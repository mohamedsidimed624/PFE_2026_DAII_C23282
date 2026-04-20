package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.dto.Admin.*;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.DemandeDocument;
import com.onmm.backend.entity.DemandeEducation;
import com.onmm.backend.entity.DemandeExperience;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.enums.StatutMedecin;
import com.onmm.backend.repository.ActivationTokenRepository;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.Admin.AdminMedecinService;
import com.onmm.backend.service.email.EmailService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AdminMedecinServiceImpl implements AdminMedecinService {

    private final MedecinRepository medecinRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ActivationTokenRepository activationTokenRepository;

    public AdminMedecinServiceImpl(
            MedecinRepository medecinRepository,
            UserRepository userRepository,
            EmailService emailService,
            ActivationTokenRepository activationTokenRepository
    ) {
        this.medecinRepository = medecinRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.activationTokenRepository = activationTokenRepository;
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
            if (medecin.getSpecialite() != null) {
                response.setSpecialiteId(medecin.getSpecialite().getId());
                response.setSpecialiteLibelle(medecin.getSpecialite().getLibelle());
            }

            if (medecin.getSousSpecialite() != null) {
                response.setSousSpecialiteId(medecin.getSousSpecialite().getId());
                response.setSousSpecialiteLibelle(medecin.getSousSpecialite().getLibelle());
            }
            response.setStatut(medecin.getStatut());
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
        response.setAdresse(medecin.getAdresse());
        response.setNumeroInscription(medecin.getNumeroInscription());
        response.setStatut(medecin.getStatut());
        response.setPhotoProfilPath(medecin.getPhotoProfilPath());
        response.setDateNaissance(medecin.getDateNaissance());

        if (medecin.getSpecialite() != null) {
            response.setSpecialiteId(medecin.getSpecialite().getId());
            response.setSpecialiteLibelle(medecin.getSpecialite().getLibelle());
        }

        if (medecin.getSousSpecialite() != null) {
            response.setSousSpecialiteId(medecin.getSousSpecialite().getId());
            response.setSousSpecialiteLibelle(medecin.getSousSpecialite().getLibelle());
        }

        User user = medecin.getUser();
        DemandeAdhesion demande = null;

        if (user != null) {
            demande = user.getDemandeApprouvee();
        }

        if (demande != null) {
            response.setEducations(
                    demande.getEducations() == null
                            ? Collections.emptyList()
                            : demande.getEducations().stream().map(this::mapEducation).toList()
            );

            response.setExperiences(
                    demande.getExperiences() == null
                            ? Collections.emptyList()
                            : demande.getExperiences().stream().map(this::mapExperience).toList()
            );

            response.setDocuments(
                    demande.getDocuments() == null
                            ? Collections.emptyList()
                            : demande.getDocuments().stream().map(this::mapDocument).toList()
            );
        } else {
            response.setEducations(Collections.emptyList());
            response.setExperiences(Collections.emptyList());
            response.setDocuments(Collections.emptyList());
        }

        return response;
    }

    @Override
    @Transactional
    public void suspendMedecin(Long id, String adminComment) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        medecin.setStatut(StatutMedecin.SUSPENDU);
        medecinRepository.save(medecin);

        emailService.sendSuspensionEmail(
                medecin.getEmail(),
                medecin.getNom(),
                adminComment
        );
    }

    @Override
    @Transactional
    public void reactivateMedecin(Long id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        medecin.setStatut(StatutMedecin.ACTIF);
        medecinRepository.save(medecin);
    }

    @Override
    @Transactional
    public void deleteMedecin(Long id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        User user = medecin.getUser();

        if (user != null) {
            activationTokenRepository.deleteByUser(user);
        }

        medecinRepository.delete(medecin);

        if (user != null) {
            userRepository.delete(user);
        }
    }

    private AdminMedecinEducationResponse mapEducation(DemandeEducation edu) {
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

    private AdminMedecinExperienceResponse mapExperience(DemandeExperience exp) {
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

    private AdminMedecinDocumentResponse mapDocument(DemandeDocument doc) {
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