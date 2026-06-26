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
import com.onmm.backend.service.storage.ObjectStorageService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
    private final PasswordEncoder passwordEncoder;
    private final ObjectStorageService objectStorageService;

    public MedecinServiceImpl(
            MedecinRepository medecinRepository,
            MedecinEducationRepository educationRepository,
            MedecinExperienceRepository experienceRepository,
            MedecinDocumentRepository documentRepository,
            SpecialiteRepository specialiteRepository,
            SousSpecialiteRepository sousSpecialiteRepository,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder,
            ObjectStorageService objectStorageService
    ) {
        this.medecinRepository = medecinRepository;
        this.educationRepository = educationRepository;
        this.experienceRepository = experienceRepository;
        this.documentRepository = documentRepository;
        this.specialiteRepository = specialiteRepository;
        this.sousSpecialiteRepository = sousSpecialiteRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
        this.objectStorageService = objectStorageService;
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
        medecin.setWilayaExercice(request.getWilayaExercice());

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
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) extension = originalName.substring(dotIndex);

            String fileName = "medecin_" + medecin.getId() + "_" + UUID.randomUUID() + extension;
            String key = "profiles/" + fileName;
            String url = objectStorageService.upload(key, file.getBytes(), contentType);

            medecin.setPhotoProfilPath(url);
            medecinRepository.save(medecin);

            return url;
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
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
            String extension = "";
            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) extension = originalName.substring(dotIndex);

            String fileName = UUID.randomUUID() + extension;
            String key = "documents/medecin_" + medecin.getId() + "/" + fileName;
            String url = objectStorageService.upload(key, file.getBytes(), file.getContentType());

            MedecinDocument doc = new MedecinDocument();
            doc.setMedecin(medecin);
            doc.setFileName(originalName);
            doc.setFilePath(url);
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
        response.setWilayaExercice(medecin.getWilayaExercice());
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
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            Color green      = new Color(22, 163, 74);   // vert ONMM (#16A34A)
            Color lightGreen = new Color(220, 245, 230);
            Color borderGray = new Color(120, 120, 120);

            // ── Cadre du document ───────────────────────────────────────────
            PdfContentByte cb = writer.getDirectContent();
            float pageW = PageSize.A4.getWidth();
            float pageH = PageSize.A4.getHeight();
            cb.setColorStroke(green);
            cb.setLineWidth(2.2f);
            cb.rectangle(28, 28, pageW - 56, pageH - 56);
            cb.stroke();
            cb.setColorStroke(borderGray);
            cb.setLineWidth(0.6f);
            cb.rectangle(34, 34, pageW - 68, pageH - 68);
            cb.stroke();

            Font institutionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 15, Color.BLACK);
            Font subHeaderFont   = FontFactory.getFont(FontFactory.HELVETICA, 11, green);
            Font bodyFont        = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.DARK_GRAY);
            Font labelFont       = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, green);
            Font valueFont       = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
            Font titleFont       = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 17, Color.BLACK);
            Font refFont         = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
            Font footerFont      = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);
            Font signatureFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

            doc.add(new Paragraph(" "));

            // ── Numéro de référence (coin) ──────────────────────────────────
            String reference = "N° CERT-" + (medecin.getNumeroInscription() != null ? medecin.getNumeroInscription() : medecin.getId())
                    + "-" + LocalDate.now().getYear();
            Paragraph refPara = new Paragraph(reference, refFont);
            refPara.setAlignment(Element.ALIGN_RIGHT);
            doc.add(refPara);

            // ── Emblème ONMM ─────────────────────────────────────────────────
            try {
                Image logo = Image.getInstance(getClass().getClassLoader().getResource("static/images/logo-onmm.png"));
                logo.scaleToFit(85, 85);
                logo.setAlignment(Element.ALIGN_CENTER);
                logo.setSpacingBefore(4f);
                logo.setSpacingAfter(10f);
                doc.add(logo);
            } catch (Exception ignored) {
                // Logo introuvable : le certificat reste valide sans image
            }

            Paragraph institution = new Paragraph("ORDRE NATIONAL DES MÉDECINS DE MAURITANIE", institutionFont);
            institution.setAlignment(Element.ALIGN_CENTER);
            doc.add(institution);

            Paragraph subHeader = new Paragraph("Conseil National de l'Ordre", subHeaderFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            subHeader.setSpacingAfter(14f);
            doc.add(subHeader);

            // ── Divider ───────────────────────────────────────────────────────
            cb.setColorFill(green);
            cb.rectangle(120, pageH - 175, pageW - 240, 1.5f);
            cb.fill();

            doc.add(new Paragraph(" "));

            Paragraph certTitle = new Paragraph("CERTIFICAT D'ADHÉSION", titleFont);
            certTitle.setAlignment(Element.ALIGN_CENTER);
            certTitle.setSpacingBefore(16f);
            certTitle.setSpacingAfter(22f);
            doc.add(certTitle);

            Paragraph intro = new Paragraph(
                "L'Ordre National des Médecins de Mauritanie certifie que :", bodyFont);
            intro.setAlignment(Element.ALIGN_CENTER);
            intro.setSpacingAfter(18f);
            doc.add(intro);

            // ── Grille d'informations (cellules bordées) ─────────────────────
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(85);
            table.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.setSpacingBefore(6f);
            table.setSpacingAfter(34f);
            table.setWidths(new float[]{40, 60});

            addTableRow(table, "Nom complet", "Dr. " + medecin.getPrenom() + " " + medecin.getNom(), labelFont, valueFont, lightGreen);
            addTableRow(table, "N° Inscription", medecin.getNumeroInscription() != null ? medecin.getNumeroInscription() : "—", labelFont, valueFont, Color.WHITE);
            addTableRow(table, "Spécialité", specialite, labelFont, valueFont, lightGreen);
            addTableRow(table, "Statut", "ACTIF", labelFont, valueFont, Color.WHITE);
            addTableRow(table, "Date de délivrance",
                LocalDate.now().format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH)),
                labelFont, valueFont, lightGreen);
            doc.add(table);

            // ── Zone signature / cachet ──────────────────────────────────────
            PdfPTable signatureBlock = new PdfPTable(2);
            signatureBlock.setWidthPercentage(85);
            signatureBlock.setHorizontalAlignment(Element.ALIGN_CENTER);
            signatureBlock.setWidths(new float[]{50, 50});

            PdfPCell placeCell = new PdfPCell();
            placeCell.setBorder(Rectangle.NO_BORDER);
            Paragraph place = new Paragraph(
                "Fait à Nouakchott, le " + LocalDate.now().format(DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH)),
                bodyFont);
            placeCell.addElement(place);
            signatureBlock.addCell(placeCell);

            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.NO_BORDER);
            signCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            Paragraph signLabel = new Paragraph("Le Président de l'Ordre", signatureFont);
            signLabel.setAlignment(Element.ALIGN_CENTER);
            signCell.addElement(signLabel);
            signCell.addElement(new Paragraph(" "));
            signCell.addElement(new Paragraph(" "));
            Paragraph signLine = new Paragraph("_________________________", bodyFont);
            signLine.setAlignment(Element.ALIGN_CENTER);
            signCell.addElement(signLine);
            signatureBlock.addCell(signCell);

            doc.add(signatureBlock);

            // ── Footer ─────────────────────────────────────────────────────────
            Paragraph footer = new Paragraph(
                "Ce certificat est valable pour l'exercice en cours.\n" +
                "Tout exercice illégal de la médecine est passible de sanctions pénales.\n" +
                "ONMM — Ordre National des Médecins de Mauritanie",
                footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(26f);
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

    // ── Sécurité ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin introuvable"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), medecin.getPassword())) {
            throw new BusinessException("Mot de passe actuel incorrect");
        }

        medecin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        medecinRepository.save(medecin);

        notificationService.createMedecinNotification(
                email,
                "SECURITE",
                "Mot de passe modifié",
                "Votre mot de passe a été modifié avec succès.",
                "/medecin/parametres",
                false
        );
    }
}
