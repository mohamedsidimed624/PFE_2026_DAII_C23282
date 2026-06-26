package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.dto.Admin.*;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.MedecinDocument;
import com.onmm.backend.entity.MedecinEducation;
import com.onmm.backend.entity.MedecinExperience;
import com.onmm.backend.entity.enums.StatutMedecin;
import com.onmm.backend.entity.enums.TokenType;
import com.onmm.backend.repository.ActivationTokenRepository;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.service.Admin.AdminMedecinService;
import com.onmm.backend.service.NotificationService;
import com.onmm.backend.service.email.EmailService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
public class AdminMedecinServiceImpl implements AdminMedecinService {

    private final MedecinRepository medecinRepository;
    private final EmailService emailService;
    private final ActivationTokenRepository activationTokenRepository;
    private final NotificationService notificationService;

    public AdminMedecinServiceImpl(
            MedecinRepository medecinRepository,
            EmailService emailService,
            ActivationTokenRepository activationTokenRepository,
            NotificationService notificationService
    ) {
        this.medecinRepository = medecinRepository;
        this.emailService = emailService;
        this.activationTokenRepository = activationTokenRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public List<AdminMedecinListResponse> getAllMedecins() {
        return medecinRepository.findAll().stream().map(medecin -> {

            AdminMedecinListResponse response = new AdminMedecinListResponse();

            response.setId(medecin.getId());
            response.setNumeroInscription(medecin.getNumeroInscription());
            response.setNom(medecin.getNom());
            response.setPrenom(medecin.getPrenom());
            response.setEmail(medecin.getEmail());
            response.setTelephone(medecin.getTelephone());
            response.setNni(medecin.getNni());
            response.setSexe(medecin.getSexe());
            response.setDateNaissance(medecin.getDateNaissance());
            response.setStatut(medecin.getStatut());
            response.setWilayaExercice(medecin.getWilayaExercice());

            MedecinEducation educationReference = getEducationReference(medecin);

            if (educationReference != null && educationReference.getSpecialite() != null) {
                response.setSpecialiteId(educationReference.getSpecialite().getId());
                response.setSpecialiteLibelle(educationReference.getSpecialite().getLibelle());
            }

            if (educationReference != null && educationReference.getSousSpecialite() != null) {
                response.setSousSpecialiteId(educationReference.getSousSpecialite().getId());
                response.setSousSpecialiteLibelle(educationReference.getSousSpecialite().getLibelle());
            }

            return response;

        }).toList();
    }

    @Override
    @Transactional
    public AdminMedecinDetailResponse getMedecinById(Long id) {

        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        AdminMedecinDetailResponse response = new AdminMedecinDetailResponse();

        response.setId(medecin.getId());
        response.setNom(medecin.getNom());
        response.setPrenom(medecin.getPrenom());
        response.setEmail(medecin.getEmail());
        response.setTelephone(medecin.getTelephone());
        response.setNni(medecin.getNni());
        response.setSexe(medecin.getSexe());
        response.setNationalite(medecin.getNationalite());
        response.setWilayaExercice(medecin.getAdresse());
        response.setNumeroInscription(medecin.getNumeroInscription());
        response.setStatut(medecin.getStatut());
        response.setAdminComment(medecin.getCommentaireSuspension());
        response.setPhotoProfilPath(medecin.getPhotoProfilPath());
        response.setDateNaissance(medecin.getDateNaissance());

        MedecinEducation educationReference = getEducationReference(medecin);

        if (educationReference != null && educationReference.getSpecialite() != null) {
            response.setSpecialiteId(educationReference.getSpecialite().getId());
            response.setSpecialiteLibelle(educationReference.getSpecialite().getLibelle());
        }

        if (educationReference != null && educationReference.getSousSpecialite() != null) {
            response.setSousSpecialiteId(educationReference.getSousSpecialite().getId());
            response.setSousSpecialiteLibelle(educationReference.getSousSpecialite().getLibelle());
        }

        response.setEducations(
                medecin.getEducations() == null
                        ? Collections.emptyList()
                        : medecin.getEducations().stream().map(this::mapEducation).toList()
        );

        response.setExperiences(
                medecin.getExperiences() == null
                        ? Collections.emptyList()
                        : medecin.getExperiences().stream().map(this::mapExperience).toList()
        );

        response.setDocuments(
                medecin.getDocuments() == null
                        ? Collections.emptyList()
                        : medecin.getDocuments().stream().map(this::mapDocument).toList()
        );

        return response;
    }

    @Override
    @Transactional
    public void suspendMedecin(Long id, String adminComment) {

        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        medecin.setStatut(StatutMedecin.SUSPENDU);
        medecin.setCommentaireSuspension(adminComment);
        medecinRepository.save(medecin);

        emailService.sendSuspensionEmail(
                medecin.getEmail(),
                medecin.getNom(),
                adminComment
        );

        notificationService.createMedecinNotification(
                medecin.getEmail(),
                "COMPTE_SUSPENDU",
                "Votre compte a été suspendu",
                "Votre compte a été suspendu par l'administration. Contactez l'Ordre pour plus d'informations.",
                "/medecin/profil",
                true
        );
    }

    @Override
    @Transactional
    public void reactivateMedecin(Long id) {

        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        medecin.setStatut(StatutMedecin.ACTIF);
        medecin.setCommentaireSuspension(null);
        if (medecin.getDateApprouvement() == null) {
            medecin.setDateApprouvement(java.time.LocalDate.now());
        }
        medecinRepository.save(medecin);

        notificationService.createMedecinNotification(
                medecin.getEmail(),
                "COMPTE_REACTIVE",
                "Votre compte a été réactivé",
                "Votre compte a été réactivé par l'administration. Vous pouvez à nouveau accéder à votre espace médecin.",
                "/medecin/profil",
                false
        );
    }

    @Override
    @Transactional
    public void deleteMedecin(Long id) {

        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        activationTokenRepository.deleteByUserAndType(medecin, TokenType.SET_PASSWORD);

        medecinRepository.delete(medecin);
    }

    private MedecinEducation getEducationReference(Medecin medecin) {
        if (medecin.getEducations() == null || medecin.getEducations().isEmpty()) {
            return null;
        }

        return medecin.getEducations()
                .stream()
                .max(Comparator.comparing(MedecinEducation::getAnneeObtention))
                .orElse(null);
    }

    private AdminMedecinEducationResponse mapEducation(MedecinEducation edu) {
        AdminMedecinEducationResponse response = new AdminMedecinEducationResponse();

        response.setId(edu.getId());
        response.setDiplome(edu.getDiplome());
        response.setAnneeObtention(edu.getAnneeObtention());
        response.setPays(edu.getPays());
        response.setVille(edu.getVille());
        response.setUniversite(edu.getUniversite());

        if (edu.getSpecialite() != null) {
            response.setSpecialiteId(edu.getSpecialite().getId());
            response.setSpecialiteLibelle(edu.getSpecialite().getLibelle());
        }

        if (edu.getSousSpecialite() != null) {
            response.setSousSpecialiteId(edu.getSousSpecialite().getId());
            response.setSousSpecialiteLibelle(edu.getSousSpecialite().getLibelle());
        }

        return response;
    }

    private AdminMedecinExperienceResponse mapExperience(MedecinExperience exp) {
        AdminMedecinExperienceResponse response = new AdminMedecinExperienceResponse();

        response.setId(exp.getId());
        response.setPoste(exp.getPoste());
        response.setNomEtablissement(exp.getNomEtablissement());
        response.setVille(exp.getVille());
        response.setPays(exp.getPays());
        response.setDateDebut(exp.getDateDebut());
        response.setDateFin(exp.getDateFin());
        response.setDescription(exp.getDescription());

        return response;
    }

    private AdminMedecinDocumentResponse mapDocument(MedecinDocument doc) {
        AdminMedecinDocumentResponse response = new AdminMedecinDocumentResponse();

        response.setId(doc.getId());
        response.setFileName(doc.getFileName());
        response.setFilePath(doc.getFilePath());
        response.setSize(doc.getSize());
        response.setCategorie(doc.getCategorie());
        response.setTypeDocument(doc.getTypeDocument());

        return response;
    }
}