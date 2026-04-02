package com.onmm.backend.service.impl.Admin;
import java.util.UUID;
import com.onmm.backend.dto.Admin.AdminDemandeDetailResponse;
import com.onmm.backend.dto.Admin.AdminDemandeResponse;
import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.dto.DemandeExperienceResponse;
import com.onmm.backend.entity.*;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.entity.enums.Role;
import com.onmm.backend.entity.enums.TokenType;
import com.onmm.backend.repository.ActivationTokenRepository;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.Admin.AdminDemandeService;
import org.springframework.stereotype.Service;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.service.email.EmailService;
import com.onmm.backend.repository.MedecinRepository;
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

    private String genererNumeroInscription() {
        return "OM-" + java.time.Year.now().getValue() + "-" + System.currentTimeMillis();
    }

    public AdminDemandeServiceImpl(DemandeAdhesionRepository repository, EmailService emailService, UserRepository userRepository, ActivationTokenRepository tokenRepository, MedecinRepository medecinRepository) {
        this.repository = repository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.medecinRepository = medecinRepository;
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
                            res.setSpecialite(e.getSpecialite());
                            res.setSousSpecialite(e.getSousSpecialite());
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

        emailService.sendRejectionEmail(
                demande.getEmail(),
                demande.getNom(),
                comment
        );
    }

    @Override
    @Transactional
    public void approveDemande(Long id) {

        DemandeAdhesion demande = repository.findByIdWithEducations(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (!demande.isPending()) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        Optional<User> existingUser = userRepository.findByEmail(demande.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Un utilisateur existe déjà avec cet email");
        }

        demande.setStatut(ApplicationStatus.APPROUVED);
        demande.setDecisionDate(LocalDateTime.now());

        User user = new User();
        user.setEmail(demande.getEmail());
        user.setRole(Role.MEDECIN);
        user.setEnabled(false);
        user.setDemandeApprouvee(demande);
        userRepository.save(user);

        Medecin medecin = new Medecin();
        medecin.setNom(demande.getNom());
        medecin.setPrenom(demande.getPrenom());
        medecin.setEmail(demande.getEmail());
        medecin.setTelephone(demande.getTelephone());
        medecin.setNni(demande.getNNI());
        medecin.setSexe(demande.getSexe());
        medecin.setNationalite(demande.getNationalite());
        medecin.setAdresse(demande.getAdresse());
        medecin.setNumeroInscription(genererNumeroInscription());
        medecin.setStatut("ACTIF");
        medecin.setDateNaissance(demande.getDateNaissance());

        if (demande.getEducations() != null && !demande.getEducations().isEmpty()) {
            DemandeEducation educationPrincipale = demande.getEducations().iterator().next();
            medecin.setSpecialite(educationPrincipale.getSpecialite());
        }

        medecin.setUser(user);
        medecinRepository.save(medecin);

        ActivationToken passwordToken = new ActivationToken();
        passwordToken.setToken(UUID.randomUUID().toString());
        passwordToken.setUser(user);
        passwordToken.setType(TokenType.SET_PASSWORD);
        passwordToken.setUsed(false);
        passwordToken.setExpirationDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(passwordToken);

        String setPasswordLink =
                "http://localhost:5173/set-password?token=" + passwordToken.getToken();

        emailService.sendApprovalEmail(
                demande.getEmail(),
                demande.getNom(),
                setPasswordLink
        );
    }

}