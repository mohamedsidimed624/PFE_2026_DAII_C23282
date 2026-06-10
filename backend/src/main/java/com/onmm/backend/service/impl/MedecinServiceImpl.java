package com.onmm.backend.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.onmm.backend.exception.BusinessException;
import com.onmm.backend.exception.ForbiddenException;
import com.onmm.backend.exception.ResourceNotFoundException;
import com.onmm.backend.dto.medecin.*;
import com.onmm.backend.entity.*;
import com.onmm.backend.repository.*;
import com.onmm.backend.service.MedecinService;
import com.onmm.backend.service.NotificationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class MedecinServiceImpl implements MedecinService {

    private final MedecinRepository medecinRepository;
    private final MedecinEducationRepository educationRepository;
    private final MedecinExperienceRepository experienceRepository;
    private final MedecinDocumentRepository documentRepository;
    private final SpecialiteRepository specialiteRepository;
    private final SousSpecialiteRepository sousSpecialiteRepository;
    private final NotificationService notificationService;

    @Value("${upload.dir}")
    private String uploadDir;

    public MedecinServiceImpl(
            MedecinRepository medecinRepository,
            MedecinEducationRepository educationRepository,
            MedecinExperienceRepository experienceRepository,
            MedecinDocumentRepository documentRepository,
            SpecialiteRepository specialiteRepository,
            SousSpecialiteRepository sousSpecialiteRepository,
            NotificationService notificationService
    ) {
        this.medecinRepository = medecinRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.documentRepository = documentRepository;
        this.specialiteRepository = specialiteRepository;
        this.sousSpecialiteRepository = sousSpecialiteRepository;
        this.notificationService = notificationService;
    }

    // ── Profile ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public MedecinProfileResponse getMyProfile(String email) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Profil médecin introuvable"));
        return mapToResponse(medecin);
    }

    @Override
    @Transactional
    public MedecinProfileResponse updateMyProfile(String email, UpdateMedecinProfileRequest request) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));

        medecin.setNom(request.getNom());
        medecin.setPrenom(request.getPrenom());
        medecin.setTelephone(request.getTelephone());
        medecin.setNationalite(request.getNationalite());
        medecin.setAdresse(request.getAdresse());

        medecinRepository.save(medecin);

        notificationService.createNotification(
                "MEDECIN_PROFIL_MODIFIE",
                "Profil médecin modifié",
                medecin.getPrenom() + " " + medecin.getNom() + " a mis à jour son profil",
                "/admin/medecins/" + medecin.getId(),
                false
        );

        notificationService.createMedecinNotification(
                email,
                "INFO",
                "Profil mis à jour",
                "Vos informations personnelles ont bien été enregistrées.",
                "/medecin/profil",
                false
        );

        return mapToResponse(medecin);
    }

    @Override
    @Transactional
    public String updateMyPhoto(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Aucun fichier envoyé");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg")
                        && !contentType.equals("image/png")
                        && !contentType.equals("image/webp"))) {
            throw new BusinessException("Format d'image non supporté");
        }

        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));

        try {
            Path uploadPath = Paths.get(uploadDir, "profiles");
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) extension = originalName.substring(dotIndex);

            String fileName = "medecin_" + medecin.getId() + "_" + UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "/uploads/profiles/" + fileName;
            medecin.setPhotoProfilPath(relativePath);
            medecinRepository.save(medecin);

            return relativePath;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo");
        }
    }

    // ── Education ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<MedecinEducationDto> getEducations(String email) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
        return medecin.getEducations().stream().map(this::mapEducation).toList();
    }

    @Override
    @Transactional
    public MedecinEducationDto addEducation(String email, AddMedecinEducationRequest request) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));

        MedecinEducation edu = new MedecinEducation();
        edu.setMedecin(medecin);
        edu.setDiplome(request.getDiplome());
        edu.setUniversite(request.getUniversite());
        edu.setPays(request.getPays());
        edu.setVille(request.getVille());
        edu.setAnneeObtention(request.getAnneeObtention());

        if (request.getSpecialiteId() != null) {
            specialiteRepository.findById(request.getSpecialiteId())
                    .ifPresent(edu::setSpecialite);
        }
        if (request.getSousSpecialiteId() != null) {
            sousSpecialiteRepository.findById(request.getSousSpecialiteId())
                    .ifPresent(edu::setSousSpecialite);
        }

        MedecinEducation saved = educationRepository.save(edu);
        return mapEducation(saved);
    }

    @Override
    @Transactional
    public void deleteEducation(String email, Long educationId) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
        MedecinEducation edu = educationRepository.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Formation introuvable"));
        if (!edu.getMedecin().getId().equals(medecin.getId())) {
            throw new ForbiddenException("Accès refusé.");
        }
        educationRepository.delete(edu);
    }

    // ── Experience ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<MedecinExperienceDto> getExperiences(String email) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
        return medecin.getExperiences().stream().map(this::mapExperience).toList();
    }

    @Override
    @Transactional
    public MedecinExperienceDto addExperience(String email, AddMedecinExperienceRequest request) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));

        MedecinExperience exp = new MedecinExperience();
        exp.setMedecin(medecin);
        exp.setPoste(request.getPoste());
        exp.setNomEtablissement(request.getNomEtablissement());
        exp.setPays(request.getPays() != null ? request.getPays() : "");
        exp.setVille(request.getVille() != null ? request.getVille() : "");
        exp.setDescription(request.getDescription() != null ? request.getDescription() : "");
        exp.setDateDebut(LocalDate.parse(request.getDateDebut()));
        exp.setDateFin(request.getDateFin() != null && !request.getDateFin().isBlank()
                ? LocalDate.parse(request.getDateFin())
                : null);

        MedecinExperience saved = experienceRepository.save(exp);
        return mapExperience(saved);
    }

    @Override
    @Transactional
    public void deleteExperience(String email, Long experienceId) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
        MedecinExperience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Expérience introuvable"));
        if (!exp.getMedecin().getId().equals(medecin.getId())) {
            throw new ForbiddenException("Accès refusé.");
        }
        experienceRepository.delete(exp);
    }

    // ── Documents ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<MedecinDocumentDto> getDocuments(String email) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
        return medecin.getDocuments().stream().map(this::mapDocument).toList();
    }

    @Override
    @Transactional
    public MedecinDocumentDto uploadDocument(String email, String typeDocument, String categorie, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BusinessException("Aucun fichier envoyé");

        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));

        try {
            Path uploadPath = Paths.get(uploadDir, "documents", "medecin_" + medecin.getId());
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) extension = originalName.substring(dotIndex);

            String fileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            MedecinDocument doc = new MedecinDocument();
            doc.setMedecin(medecin);
            doc.setFileName(originalName);
            doc.setFilePath("/uploads/documents/medecin_" + medecin.getId() + "/" + fileName);
            doc.setTypeDocument(typeDocument != null ? typeDocument : "AUTRE");
            doc.setCategorie(categorie != null ? categorie : "AUTRE");
            doc.setSize(file.getSize());
            doc.setUploadDate(LocalDateTime.now());

            MedecinDocument saved = documentRepository.save(doc);
            return mapDocument(saved);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du document");
        }
    }

    @Override
    @Transactional
    public void deleteDocument(String email, Long documentId) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));
        MedecinDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable"));
        if (!doc.getMedecin().getId().equals(medecin.getId())) {
            throw new ForbiddenException("Accès refusé.");
        }
        documentRepository.delete(doc);
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private MedecinProfileResponse mapToResponse(Medecin medecin) {
        MedecinProfileResponse response = new MedecinProfileResponse();
        response.setId(medecin.getId());
        response.setNom(medecin.getNom());
        response.setPrenom(medecin.getPrenom());
        response.setEmail(medecin.getEmail());
        response.setTelephone(medecin.getTelephone());
        response.setNni(medecin.getNni());
        response.setSexe(medecin.getSexe());
        response.setNationalite(medecin.getNationalite());
        response.setAdresse(medecin.getAdresse());
        response.setNumeroInscription(medecin.getNumeroInscription());
        response.setStatut(medecin.getStatut() != null ? medecin.getStatut().name() : null);
        response.setPhotoProfilPath(medecin.getPhotoProfilPath());
        response.setSectionOrdre(medecin.getSectionOrdre() != null ? medecin.getSectionOrdre().name() : null);
        response.setVilleExercice(medecin.getVilleExercice());
        response.setEducations(
                medecin.getEducations() == null
                        ? List.of()
                        : medecin.getEducations().stream().map(this::mapEducation).toList()
        );
        return response;
    }

    private MedecinEducationDto mapEducation(MedecinEducation education) {
        MedecinEducationDto dto = new MedecinEducationDto();
        dto.setId(education.getId());
        dto.setDiplome(education.getDiplome());
        dto.setUniversite(education.getUniversite());
        dto.setPays(education.getPays());
        dto.setVille(education.getVille());
        dto.setAnneeObtention(education.getAnneeObtention());
        if (education.getSpecialite() != null) {
            dto.setSpecialiteId(education.getSpecialite().getId());
            dto.setSpecialiteLibelle(education.getSpecialite().getLibelle());
        }
        if (education.getSousSpecialite() != null) {
            dto.setSousSpecialiteId(education.getSousSpecialite().getId());
            dto.setSousSpecialiteLibelle(education.getSousSpecialite().getLibelle());
        }
        return dto;
    }

    private MedecinExperienceDto mapExperience(MedecinExperience exp) {
        MedecinExperienceDto dto = new MedecinExperienceDto();
        dto.setId(exp.getId());
        dto.setPoste(exp.getPoste());
        dto.setNomEtablissement(exp.getNomEtablissement());
        dto.setPays(exp.getPays());
        dto.setVille(exp.getVille());
        dto.setDescription(exp.getDescription());
        dto.setDateDebut(exp.getDateDebut() != null ? exp.getDateDebut().toString() : null);
        dto.setDateFin(exp.getDateFin() != null ? exp.getDateFin().toString() : null);
        return dto;
    }

    private MedecinDocumentDto mapDocument(MedecinDocument doc) {
        MedecinDocumentDto dto = new MedecinDocumentDto();
        dto.setId(doc.getId());
        dto.setFileName(doc.getFileName());
        dto.setFilePath(doc.getFilePath());
        dto.setTypeDocument(doc.getTypeDocument());
        dto.setCategorie(doc.getCategorie());
        dto.setSize(doc.getSize());
        dto.setUploadDate(doc.getUploadDate() != null ? doc.getUploadDate().toString() : null);
        return dto;
    }

    // ── Certificate PDF ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public byte[] generateCertificat(String email) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));

        String specialite = medecin.getEducations().stream()
                .filter(e -> e.getSpecialite() != null)
                .map(e -> e.getSpecialite().getLibelle())
                .findFirst()
                .orElse("Médecine générale");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 60, 60, 70, 60);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // ── Header bar ───────────────────────────────────────────────────
            Color teal = new Color(15, 118, 110);
            Color lightTeal = new Color(204, 234, 232);

            PdfContentByte cb = writer.getDirectContent();
            cb.setColorFill(teal);
            cb.rectangle(60, PageSize.A4.getHeight() - 110, PageSize.A4.getWidth() - 120, 50);
            cb.fill();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.WHITE);
            Paragraph headerPara = new Paragraph("ORDRE NATIONAL DES MÉDECINS DE MAURITANIE", headerFont);
            headerPara.setAlignment(Element.ALIGN_CENTER);
            headerPara.setSpacingBefore(18f);
            doc.add(headerPara);

            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA, 11, teal);
            Paragraph subHeader = new Paragraph("Certificat d'adhésion", subHeaderFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            subHeader.setSpacingAfter(20f);
            doc.add(subHeader);

            // ── Divider ───────────────────────────────────────────────────────
            cb.setColorFill(lightTeal);
            cb.rectangle(60, PageSize.A4.getHeight() - 165, PageSize.A4.getWidth() - 120, 2);
            cb.fill();

            // ── Certificate body ──────────────────────────────────────────────
            Font bodyFont   = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.DARK_GRAY);
            Font labelFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, teal);
            Font valueFont  = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
            Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);

            doc.add(new Paragraph(" "));

            Paragraph certTitle = new Paragraph("CERTIFICAT D'ADHÉSION", titleFont);
            certTitle.setAlignment(Element.ALIGN_CENTER);
            certTitle.setSpacingAfter(25f);
            doc.add(certTitle);

            Paragraph intro = new Paragraph(
                "L'Ordre National des Médecins de Mauritanie certifie que :", bodyFont);
            intro.setAlignment(Element.ALIGN_CENTER);
            intro.setSpacingAfter(20f);
            doc.add(intro);

            // Info table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(80);
            table.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(30f);
            table.setWidths(new float[]{40, 60});

            addTableRow(table, "Nom complet", "Dr. " + medecin.getPrenom() + " " + medecin.getNom(), labelFont, valueFont, lightTeal);
            addTableRow(table, "N° Inscription", medecin.getNumeroInscription() != null ? medecin.getNumeroInscription() : "—", labelFont, valueFont, Color.WHITE);
            addTableRow(table, "Spécialité", specialite, labelFont, valueFont, lightTeal);
            addTableRow(table, "Statut", "ACTIF", labelFont, valueFont, Color.WHITE);
            addTableRow(table, "Date de délivrance",
                LocalDate.now().format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH)),
                labelFont, valueFont, lightTeal);
            doc.add(table);

            // ── Footer ─────────────────────────────────────────────────────────
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);
            Paragraph footer = new Paragraph(
                "Ce certificat est valable pour l'exercice en cours.\n" +
                "Tout exercice illégal de la médecine est passible de sanctions pénales.\n" +
                "ONMM — Ordre National des Médecins de Mauritanie",
                footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30f);
            doc.add(footer);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du certificat PDF", e);
        }
    }

    private void addTableRow(PdfPTable table, String label, String value,
                             Font labelFont, Font valueFont, Color bg) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBackgroundColor(bg);
        labelCell.setPadding(8f);
        labelCell.setBorderColor(Color.LIGHT_GRAY);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBackgroundColor(bg);
        valueCell.setPadding(8f);
        valueCell.setBorderColor(Color.LIGHT_GRAY);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}
