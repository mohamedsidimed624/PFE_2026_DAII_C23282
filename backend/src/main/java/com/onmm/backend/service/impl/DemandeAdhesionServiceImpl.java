package com.onmm.backend.service.impl;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.dto.demande.RepriseDemandeResponse;
import com.onmm.backend.dto.demande.SuiviDossierResponse;
import com.onmm.backend.entity.ActivationToken;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.entity.enums.TokenType;
import com.onmm.backend.repository.ActivationTokenRepository;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.DemandeAdhesionService;
import com.onmm.backend.service.NotificationService;
import com.onmm.backend.service.email.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DemandeAdhesionServiceImpl implements DemandeAdhesionService {

    private final DemandeAdhesionRepository demandeAdhesionRepository;
    private final EmailService emailService;
    private final MedecinRepository medecinRepository;
    private final ActivationTokenRepository activationTokenRepository;
    private final NotificationService notificationService;
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    private String genererNumeroDossier() {
        return "DOS-" + java.time.Year.now().getValue() + "-" + System.currentTimeMillis();
    }

    public DemandeAdhesionServiceImpl(DemandeAdhesionRepository demandeAdhesionRepository, EmailService emailService, MedecinRepository medecinRepository, ActivationTokenRepository activationTokenRepository, NotificationService notificationService) {
        this.demandeAdhesionRepository = demandeAdhesionRepository;
        this.emailService = emailService;
        this.medecinRepository = medecinRepository;
        this.activationTokenRepository = activationTokenRepository;
        this.notificationService = notificationService;
    }

    @Override
    public DemandeAdhesion createDemande(DemandeAdhesionRequest request) {

        boolean NNIConflit = demandeAdhesionRepository
                .existsByNNIAndStatutIn(request.getNni(), List.of(ApplicationStatus.PENDING, ApplicationStatus.APPROUVED ));

        boolean EmailConflit = demandeAdhesionRepository
                .existsByEmailAndStatutIn(request.getEmail(), List.of(ApplicationStatus.PENDING, ApplicationStatus.APPROUVED));

        boolean TelephoneConflit = demandeAdhesionRepository
                .existsByTelephoneAndStatutIn(request.getTelephone(), List.of(ApplicationStatus.PENDING, ApplicationStatus.APPROUVED));




        if (NNIConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour ce NNI"
            );
        }

        if (EmailConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour cet email"
            );
        }

        if (TelephoneConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour ce numéro de téléphone"
            );
        }

        DemandeAdhesion demande = new DemandeAdhesion();



        demande.setNNI(request.getNni());
        demande.setNom(request.getNom());
        demande.setPrenom(request.getPrenom());
        demande.setSexe(request.getSexe());
        demande.setNationalite(request.getNationalite());
        demande.setDateNaissance(request.getDateNaissance());
        demande.setEmail(request.getEmail());
        demande.setTelephone(request.getTelephone());
        demande.setAdresse(request.getAdresse());
        demande.setNumeroDossier(genererNumeroDossier());

        demande.setStatut(ApplicationStatus.PENDING);
        demande.setSubmissionDate(LocalDateTime.now());

        DemandeAdhesion saved = demandeAdhesionRepository.save(demande);

        // Email accusé de réception
        emailService.sendSubmissionEmail(
                saved.getEmail(),
                saved.getNom(),
                saved.getNumeroDossier()
        );

        notificationService.createNotification(
                "NOUVELLE_DEMANDE",
                "Nouvelle demande d'adhésion",
                saved.getPrenom() + " " + saved.getNom() + " a soumis une demande d'adhésion",
                "/admin/demandes/" + saved.getId(),
                true
        );

        return saved;
    }


    @Override
    public ResponseEntity<?> checkUnique(String nni, String email, String telephone) {

        Map<String,String> errors = new HashMap<>();

        if(demandeAdhesionRepository.existsByNNIAndStatutIn(nni, List.of(ApplicationStatus.PENDING, ApplicationStatus.APPROUVED))){
            errors.put("nni","NNI déjà utilisé");
        }

        if(demandeAdhesionRepository.existsByEmailAndStatutIn(email, List.of(ApplicationStatus.PENDING, ApplicationStatus.APPROUVED))){
            errors.put("email","Email déjà utilisé");
        }

        if(demandeAdhesionRepository.existsByTelephoneAndStatutIn(telephone, List.of(ApplicationStatus.PENDING, ApplicationStatus.APPROUVED))){
            errors.put("telephone","Téléphone déjà utilisé");
        }

        if(!errors.isEmpty()){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errors);
        }

        return ResponseEntity.ok("OK");
    }

    @Override
    @Transactional(readOnly = true)
    public SuiviDossierResponse getSuiviByNumeroDossier(String numeroDossier) {

        DemandeAdhesion demande = demandeAdhesionRepository.findByNumeroDossier(numeroDossier)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable"));

        SuiviDossierResponse response = new SuiviDossierResponse();

        // Informations principales
        response.setNumeroDossier(demande.getNumeroDossier());
        response.setNom(demande.getNom());
        response.setPrenom(demande.getPrenom());
        response.setEmail(demande.getEmail());
        response.setStatut(demande.getStatut().toString());
        response.setDateSoumission(demande.getSubmissionDate());
        response.setDateDecision(demande.getDecisionDate());
        response.setCommentaireAdmin(demande.getAdminComment());

        // Valeurs par défaut
        response.setCompteCree(false);
        response.setCompteActive(false);
        response.setPeutActiverCompte(false);
        response.setPeutCompleterDossier(false);
        response.setActivationLink(null);

        // Cas PENDING
        if (demande.isPending()) {
            return response;
        }

        // Cas REJECTED
        if (demande.isRejected()) {
            response.setPeutCompleterDossier(true);
            return response;
        }

        // Cas APPROUVED
        if (demande.isApproved()) {
            Medecin medecin = medecinRepository.findByDemandeOrigine(demande).orElse(null);

            if (medecin != null) {
                response.setCompteCree(true);
                response.setCompteActive(medecin.isEnabled());

                if (!medecin.isEnabled()) {
                    response.setPeutActiverCompte(true);
                    response.setActivationLink(getOrCreateActivationLink(medecin));
                }
            }

            return response;
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public RepriseDemandeResponse getDemandePourReprise(String numeroDossier) {

        DemandeAdhesion demande = demandeAdhesionRepository.findByNumeroDossier(numeroDossier)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable"));

        if (!demande.isRejected()) {
            throw new RuntimeException("Seuls les dossiers rejetés peuvent être repris");
        }

        RepriseDemandeResponse response = new RepriseDemandeResponse();

        // personal
        RepriseDemandeResponse.PersonalData personal = new RepriseDemandeResponse.PersonalData();
        personal.setNom(demande.getNom());
        personal.setPrenom(demande.getPrenom());
        personal.setEmail(demande.getEmail());
        personal.setTelephone(demande.getTelephone());
        personal.setNni(demande.getNNI());
        personal.setSexe(demande.getSexe());
        personal.setNationalite(demande.getNationalite());
        personal.setDateNaissance(demande.getDateNaissance());
        personal.setAdresse(demande.getAdresse());

        response.setPersonal(personal);

        // education
        response.setEducation(
                demande.getEducations().stream().map(edu -> {
                    RepriseDemandeResponse.EducationData e = new RepriseDemandeResponse.EducationData();

                    if (edu.getSpecialite() != null) {
                        e.setSpecialiteId(edu.getSpecialite().getId());
                        e.setSpecialiteLibelle(edu.getSpecialite().getLibelle());
                    } else {
                        e.setSpecialiteId(null);
                        e.setSpecialiteLibelle(null);
                    }

                    if (edu.getSousSpecialite() != null) {
                        e.setSousSpecialiteId(edu.getSousSpecialite().getId());
                        e.setSousSpecialiteLibelle(edu.getSousSpecialite().getLibelle());
                    } else {
                        e.setSousSpecialiteId(null);
                        e.setSousSpecialiteLibelle(null);
                    }

                    e.setDiplome(edu.getDiplome());
                    e.setAnneeObtention(edu.getAnneeObtention());
                    e.setPays(edu.getPays());
                    e.setVille(edu.getVille());
                    e.setUniversite(edu.getUniversite());

                    return e;
                }).toList()
        );

        // experience
        response.setExperience(
                demande.getExperiences().stream().map(exp -> {
                    RepriseDemandeResponse.ExperienceData e = new RepriseDemandeResponse.ExperienceData();
                    e.setPoste(exp.getPoste());
                    e.setEtablissement(exp.getNomEtablissement());
                    e.setVille(exp.getVille());
                    e.setPays(exp.getPays());
                    e.setDateDebut(exp.getDateDebut());
                    e.setDateFin(exp.getDateFin());
                    e.setDescription(exp.getDescription());
                    return e;
                }).toList()
        );

        return response;
    }

    private String getOrCreateActivationLink(User user) {

        ActivationToken token = activationTokenRepository
                .findFirstByUserAndTypeAndUsedFalseAndExpirationDateAfterOrderByExpirationDateDesc(
                        user,
                        TokenType.SET_PASSWORD,
                        LocalDateTime.now()
                )
                .orElseGet(() -> {
                    ActivationToken newToken = new ActivationToken();
                    newToken.setUser(user);
                    newToken.setToken(UUID.randomUUID().toString());
                    newToken.setType(TokenType.SET_PASSWORD);
                    newToken.setUsed(false);
                    newToken.setExpirationDate(LocalDateTime.now().plusHours(24));
                    return activationTokenRepository.save(newToken);
                });

        return frontendUrl + "/activate?token=" + token.getToken();
    }

}