package com.onmm.backend.service.impl.Admin;
import java.util.Set;
import java.util.UUID;
import com.onmm.backend.dto.Admin.AdminDemandeDetailResponse;
import com.onmm.backend.dto.Admin.AdminDemandeResponse;
import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.dto.DemandeExperienceResponse;
import com.onmm.backend.entity.*;
import com.onmm.backend.entity.enums.*;
import com.onmm.backend.repository.ActivationTokenRepository;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.Admin.AdminDemandeService;
import com.onmm.backend.service.NotificationService;
import org.springframework.stereotype.Service;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.service.email.EmailService;
import com.onmm.backend.repository.MedecinRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AdminDemandeServiceImpl implements AdminDemandeService {

    private final DemandeAdhesionRepository repository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ActivationTokenRepository tokenRepository;
    private final MedecinRepository medecinRepository;
    private final NotificationService notificationService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private String genererNumeroInscription() {
        return "OM-" + java.time.Year.now().getValue() + "-" + System.currentTimeMillis();
    }

    private SectionOrdre determineSectionOrdreFromEducations(Set<DemandeEducation> educations) {

        boolean hasGeneralMedicine = educations.stream()
                .anyMatch(e -> e.getSpecialite() != null
                        && "Médecine Générale".equalsIgnoreCase(e.getSpecialite().getLibelle()));

        if (hasGeneralMedicine) {
            return SectionOrdre.GENERALISTE;
        }

        return SectionOrdre.SPECIALISTE;
    }

    public AdminDemandeServiceImpl(DemandeAdhesionRepository repository, EmailService emailService, UserRepository userRepository, ActivationTokenRepository tokenRepository, MedecinRepository medecinRepository, NotificationService notificationService) {
        this.repository = repository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.medecinRepository = medecinRepository;
        this.notificationService = notificationService;
    }

    @Override
    public List<AdminDemandeResponse> getAllDemandes() {

        List<DemandeAdhesion> demandes = repository.findAll();

        return demandes.stream().map(d -> {

            AdminDemandeResponse dto = new AdminDemandeResponse();

            dto.setId(d.getId());
            dto.setNom(d.getNom());
            dto.setPrenom(d.getPrenom());
            dto.setEmail(d.getEmail());
            dto.setStatut(d.getStatut().toString());
            dto.setSubmissionDate(d.getSubmissionDate());

            return dto;

        }).toList();
    }

    @Transactional(readOnly = true)
    @Override
    public AdminDemandeDetailResponse getDemandeDetail(Long id) {

        DemandeAdhesion demande = repository.findWithDetailsById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        AdminDemandeDetailResponse dto = new AdminDemandeDetailResponse();

        dto.setId(demande.getId());
        dto.setNom(demande.getNom());
        dto.setPrenom(demande.getPrenom());
        dto.setEmail(demande.getEmail());
        dto.setTelephone(demande.getTelephone());
        dto.setNationalite(demande.getNationalite());
        dto.setDateNaissance(demande.getDateNaissance());
        dto.setStatut(demande.getStatut().toString());
        dto.setSubmissionDate(demande.getSubmissionDate());

        dto.setEducations(
                demande.getEducations()
                        .stream()
                        .map(e -> {
                            DemandeEducationResponse res = new DemandeEducationResponse();
                            res.setId(e.getId());
                            res.setDiplome(e.getDiplome());
                            res.setUniversite(e.getUniversite());
                            res.setPays(e.getPays());
                            res.setVille(e.getVille());
                            if (e.getSpecialite() != null) {
                                res.setSpecialiteId(e.getSpecialite().getId());
                                res.setSpecialiteLibelle(e.getSpecialite().getLibelle());
                            }

                            if (e.getSousSpecialite() != null) {
                                res.setSousSpecialiteId(e.getSousSpecialite().getId());
                                res.setSousSpecialiteLibelle(e.getSousSpecialite().getLibelle());
                            }

                            res.setAnneeObtention(e.getAnneeObtention());
                            return res;
                        })
                        .toList()
        );

        dto.setExperiences(
                demande.getExperiences()
                        .stream()
                        .map(e -> {
                            DemandeExperienceResponse res = new DemandeExperienceResponse();
                            res.setId(e.getId());
                            res.setPoste(e.getPoste());
                            res.setNomEtablissement(e.getNomEtablissement());
                            res.setPays(e.getPays());
                            res.setVille(e.getVille());
                            res.setDateDebut(e.getDateDebut());
                            res.setDateFin(e.getDateFin());
                            res.setDescription(e.getDescription());
                            return res;
                        })
                        .toList()

        );
        dto.setDocuments(
                demande.getDocuments()
                        .stream()
                        .map(d -> {
                            DemandeDocumentResponse res = new DemandeDocumentResponse();
                            res.setId(d.getId());
                            res.setFileName(d.getFileName());
                            res.setFilePath(d.getFilePath().replace("\\", "/"));
                            res.setTypeDocument(d.getTypeDocument());
                            res.setCategorie(d.getCategorie());
                            res.setSize(d.getSize());
                            res.setUploadDate(d.getUploadDate());
                            return res;
                        })
                        .toList()
        );
        return dto;
    }

    @Override
    public void rejectDemande(Long id, String comment) {

        DemandeAdhesion demande = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (!demande.isPending()) {
            throw new RuntimeException("Demande déjà traitée");
        }

        demande.setStatut(ApplicationStatus.REJECTED);
        demande.setDecisionDate(LocalDateTime.now());
        demande.setAdminComment(comment);

        repository.save(demande);

        notificationService.createNotification(
                "DEMANDE_REJETEE",
                "Demande d'adhésion rejetée",
                demande.getPrenom() + " " + demande.getNom() + " — dossier traité (rejeté)",
                "/admin/demandes/" + id,
                false
        );

        emailService.sendRejectionEmail(
                demande.getEmail(),
                demande.getNom(),
                comment
        );
    }

    @Override
    @Transactional
    public void approveDemande(Long id) {

        DemandeAdhesion demande = repository.findWithDetailsById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (!demande.isPending()) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        Optional<User> existingUser = userRepository.findByEmail(demande.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Un utilisateur existe déjà avec cet email");
        }

        if (demande.getEducations() == null || demande.getEducations().isEmpty()) {
            throw new RuntimeException("Impossible d'approuver une demande sans formation");
        }

        demande.setStatut(ApplicationStatus.APPROUVED);
        demande.setDecisionDate(LocalDateTime.now());
        repository.save(demande);

        Medecin medecin = new Medecin();

        // Partie User héritée
        medecin.setEmail(demande.getEmail());
        medecin.setRole(Role.MEDECIN);
        medecin.setEnabled(false);
        medecin.setPassword(null);

        // Partie métier médecin
        medecin.setDemandeOrigine(demande);
        medecin.setNom(demande.getNom());
        medecin.setPrenom(demande.getPrenom());
        medecin.setTelephone(demande.getTelephone());
        medecin.setNni(demande.getNNI());
        medecin.setSexe(demande.getSexe());
        medecin.setNationalite(demande.getNationalite());
        medecin.setAdresse(demande.getAdresse());
        medecin.setNumeroInscription(genererNumeroInscription());
        medecin.setStatut(StatutMedecin.ACTIF);
        medecin.setDateApprouvement(java.time.LocalDate.now());
        medecin.setDateNaissance(demande.getDateNaissance());

        // Section ordre : règle simple basée sur les formations
        medecin.setSectionOrdre(determineSectionOrdreFromEducations(demande.getEducations()));

        DemandeExperience experienceActuelle = demande.getExperiences()
                .stream()
                .filter(exp -> exp.getDateFin() == null)
                .findFirst()
                .orElse(null);

        if (experienceActuelle != null) {
            medecin.setVilleExercice(experienceActuelle.getVille());
            medecin.setStructureExercice(experienceActuelle.getNomEtablissement());
        }

        long nombreExperiencesActuelles = demande.getExperiences()
                .stream()
                .filter(exp -> exp.getDateFin() == null)
                .count();

        if (nombreExperiencesActuelles > 1) {
            throw new RuntimeException("Une seule expérience professionnelle actuelle est autorisée");
        }

        // Copier les formations
        for (DemandeEducation edu : demande.getEducations()) {
            MedecinEducation medEdu = new MedecinEducation();

            medEdu.setMedecin(medecin);
            medEdu.setDiplome(edu.getDiplome());
            medEdu.setUniversite(edu.getUniversite());
            medEdu.setPays(edu.getPays());
            medEdu.setVille(edu.getVille());
            medEdu.setAnneeObtention(edu.getAnneeObtention());
            medEdu.setSpecialite(edu.getSpecialite());
            medEdu.setSousSpecialite(edu.getSousSpecialite());

            medecin.getEducations().add(medEdu);
        }

        // Copier les expériences
        if (demande.getExperiences() != null) {
            for (DemandeExperience exp : demande.getExperiences()) {
                MedecinExperience medExp = new MedecinExperience();

                medExp.setMedecin(medecin);
                medExp.setNomEtablissement(exp.getNomEtablissement());
                medExp.setPoste(exp.getPoste());
                medExp.setPays(exp.getPays());
                medExp.setVille(exp.getVille());
                medExp.setDateDebut(exp.getDateDebut());
                medExp.setDateFin(exp.getDateFin());
                medExp.setDescription(exp.getDescription());

                medecin.getExperiences().add(medExp);
            }
        }

        // Copier les documents
        if (demande.getDocuments() != null) {
            for (DemandeDocument doc : demande.getDocuments()) {
                MedecinDocument medDoc = new MedecinDocument();

                medDoc.setMedecin(medecin);
                medDoc.setFileName(doc.getFileName());
                medDoc.setFilePath(doc.getFilePath());
                medDoc.setTypeDocument(doc.getTypeDocument());
                medDoc.setCategorie(doc.getCategorie());
                medDoc.setSize(doc.getSize());
                medDoc.setUploadDate(doc.getUploadDate());

                medecin.getDocuments().add(medDoc);
            }
        }

        medecinRepository.save(medecin);

        notificationService.createNotification(
                "DEMANDE_APPROUVEE",
                "Demande d'adhésion approuvée",
                demande.getPrenom() + " " + demande.getNom() + " — dossier approuvé, compte médecin créé",
                "/admin/demandes/" + id,
                false
        );

        ActivationToken token = new ActivationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(medecin);
        token.setType(TokenType.SET_PASSWORD);
        token.setUsed(false);
        token.setExpirationDate(LocalDateTime.now().plusHours(24));

        tokenRepository.save(token);

        String link = frontendUrl + "/activate?token=" + token.getToken();

        emailService.sendApprovalEmail(
                demande.getEmail(),
                demande.getNom(),
                link
        );
    }

}