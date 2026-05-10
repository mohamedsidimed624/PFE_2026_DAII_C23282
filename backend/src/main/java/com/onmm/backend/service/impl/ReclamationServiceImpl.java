package com.onmm.backend.service.impl;

import com.onmm.backend.dto.reclamation.*;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.Reclamation;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.enums.ReclamationAuteurType;
import com.onmm.backend.entity.enums.ReclamationCategory;
import com.onmm.backend.entity.enums.ReclamationModule;
import com.onmm.backend.entity.enums.ReclamationPriorite;
import com.onmm.backend.entity.enums.ReclamationStatus;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.ReclamationRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.NotificationService;
import com.onmm.backend.service.ReclamationService;
import com.onmm.backend.service.email.EmailService;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReclamationServiceImpl implements ReclamationService {

    private final ReclamationRepository reclamationRepository;
    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public ReclamationServiceImpl(ReclamationRepository reclamationRepository,
                                  UserRepository userRepository,
                                  MedecinRepository medecinRepository,
                                  EmailService emailService,
                                  NotificationService notificationService) {
        this.reclamationRepository = reclamationRepository;
        this.userRepository = userRepository;
        this.medecinRepository = medecinRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public ReclamationCreatedResponse createPublicReclamation(CreatePublicReclamationRequest request, String pieceJointePath) {
        ReclamationCategory categorie = parseCategory(request.getCategorie());
        LocalDateTime now = LocalDateTime.now();

        Reclamation reclamation = new Reclamation();
        reclamation.setNumeroReclamation(generateNumeroReclamation());
        reclamation.setTypeAuteur(ReclamationAuteurType.CITOYEN);
        reclamation.setCategorie(categorie);
        reclamation.setPriorite(ReclamationPriorite.MEDIUM);
        reclamation.setModuleConcerne(mapCategoryToModule(categorie));
        reclamation.setObjet(request.getObjet());
        reclamation.setMessage(request.getMessage());
        reclamation.setPieceJointePath(pieceJointePath);
        reclamation.setStatut(ReclamationStatus.SUBMITTED);
        reclamation.setDateCreation(now);
        reclamation.setDateDerniereMiseAJour(now);

        reclamation.setNomCitoyen(request.getNom());
        reclamation.setPrenomCitoyen(request.getPrenom());
        reclamation.setVilleCitoyen(request.getVille());
        reclamation.setAdresseCitoyen(request.getAdresse());
        reclamation.setTelephoneCitoyen(request.getTelephone());
        reclamation.setEmailCitoyen(request.getEmail());

        reclamationRepository.save(reclamation);

        notificationService.createNotification(
                "NOUVELLE_RECLAMATION",
                "Nouvelle réclamation soumise",
                reclamation.getPrenomCitoyen() + " " + reclamation.getNomCitoyen() + " a soumis une réclamation : " + reclamation.getObjet(),
                "/admin/reclamations/" + reclamation.getId(),
                true
        );

        emailService.sendPublicReclamationSubmissionEmail(
                reclamation.getEmailCitoyen(),
                reclamation.getPrenomCitoyen() + " " + reclamation.getNomCitoyen(),
                reclamation.getNumeroReclamation(),
                reclamation.getObjet()
        );

        return toCreatedResponse(reclamation);
    }

    @Override
    @Transactional
    public ReclamationCreatedResponse createMedecinReclamation(String userEmail, CreateMedecinReclamationRequest request, String pieceJointePath) {

        Medecin medecin = medecinRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        ReclamationCategory categorie = parseCategory(request.getCategorie());
        LocalDateTime now = LocalDateTime.now();

        Reclamation reclamation = new Reclamation();
        reclamation.setNumeroReclamation(generateNumeroReclamation());
        reclamation.setTypeAuteur(ReclamationAuteurType.MEDECIN);
        reclamation.setCategorie(categorie);
        reclamation.setPriorite(ReclamationPriorite.MEDIUM);
        reclamation.setModuleConcerne(mapCategoryToModule(categorie));
        reclamation.setObjet(request.getObjet());
        reclamation.setMessage(request.getMessage());
        reclamation.setPieceJointePath(pieceJointePath);
        reclamation.setStatut(ReclamationStatus.SUBMITTED);
        reclamation.setDateCreation(now);
        reclamation.setDateDerniereMiseAJour(now);
        reclamation.setMedecin(medecin);

        reclamationRepository.save(reclamation);

        notificationService.createNotification(
                "NOUVELLE_RECLAMATION",
                "Nouvelle réclamation (médecin)",
                medecin.getPrenom() + " " + medecin.getNom() + " (médecin) a soumis une réclamation : " + reclamation.getObjet(),
                "/admin/reclamations/" + reclamation.getId(),
                true
        );

        return toCreatedResponse(reclamation);
    }

    @Override
    @Transactional
    public List<ReclamationListResponse> getMedecinReclamations(String userEmail) {

        Medecin medecin = medecinRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        return reclamationRepository.findByMedecinOrderByDateCreationDesc(medecin)
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<ReclamationListResponse> getAllReclamations() {
        return reclamationRepository.findAllByOrderByDateCreationDesc()
                .stream()
                .map(this::toListResponse)
                .toList();
    }

    @Override
    @Transactional
    public ReclamationDetailResponse getReclamationDetail(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable"));

        return toDetailResponse(reclamation);
    }

    @Override
    @Transactional
    public ReclamationDetailResponse getMedecinReclamationDetail(Long id, String userEmail) {

        Medecin medecin = medecinRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        Reclamation reclamation = reclamationRepository.findByIdAndMedecin(id, medecin)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable ou accès refusé"));

        return toDetailResponse(reclamation);
    }

    @Override
    @Transactional
    public void startReclamation(Long id) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable"));

        if (reclamation.getStatut() != ReclamationStatus.SUBMITTED) {
            throw new RuntimeException("Seule une réclamation soumise peut être prise en charge");
        }

        LocalDateTime now = LocalDateTime.now();

        reclamation.setStatut(ReclamationStatus.IN_PROGRESS);
        reclamation.setDatePriseEnCharge(now);
        reclamation.setDateDerniereMiseAJour(now);

        reclamationRepository.save(reclamation);

        notificationService.createNotification(
                "RECLAMATION_PRISE_EN_CHARGE",
                "Réclamation prise en charge",
                "Réclamation " + reclamation.getNumeroReclamation() + " est maintenant en cours de traitement",
                "/admin/reclamations/" + id,
                false
        );
    }

    @Override
    @Transactional
    public void closeReclamation(Long id, CloseReclamationRequest request) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réclamation introuvable"));

        if (reclamation.getStatut() == ReclamationStatus.CLOSED) {
            throw new RuntimeException("Cette réclamation est déjà clôturée");
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentAdmin = (User) principal;

        LocalDateTime now = LocalDateTime.now();

        reclamation.setStatut(ReclamationStatus.CLOSED);
        reclamation.setDateCloture(now);
        reclamation.setAdminResponse(request.getAdminResponse());
        reclamation.setAdminTraiteur(currentAdmin);
        reclamation.setDateDerniereMiseAJour(now);

        if (reclamation.getDatePriseEnCharge() == null) {
            reclamation.setDatePriseEnCharge(now);
        }

        reclamationRepository.save(reclamation);

        notificationService.createNotification(
                "RECLAMATION_CLOTUREE",
                "Réclamation clôturée",
                "Réclamation " + reclamation.getNumeroReclamation() + " a été clôturée",
                "/admin/reclamations/" + id,
                false
        );

        String destinataireEmail;
        String destinataireNom;

        if (reclamation.getTypeAuteur() == ReclamationAuteurType.MEDECIN && reclamation.getMedecin() != null) {
            destinataireEmail = reclamation.getMedecin().getEmail();
            destinataireNom = reclamation.getMedecin().getPrenom() + " " + reclamation.getMedecin().getNom();
        } else {
            destinataireEmail = reclamation.getEmailCitoyen();
            destinataireNom = reclamation.getPrenomCitoyen() + " " + reclamation.getNomCitoyen();
        }

        emailService.sendReclamationClosedEmail(
                destinataireEmail,
                destinataireNom,
                reclamation.getNumeroReclamation(),
                reclamation.getObjet(),
                reclamation.getAdminResponse()
        );
    }

    private String generateNumeroReclamation() {
        return "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private ReclamationCategory parseCategory(String rawCategory) {
        if (rawCategory == null || rawCategory.isBlank()) {
            throw new RuntimeException("La catégorie de réclamation est obligatoire");
        }

        try {
            return ReclamationCategory.valueOf(rawCategory.toUpperCase().trim());
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Catégorie de réclamation invalide");
        }
    }

    private ReclamationModule mapCategoryToModule(ReclamationCategory category) {
        return switch (category) {
            case RETARD_TRAITEMENT, ERREUR_DOSSIER, DEMANDE_INFORMATION ->
                    ReclamationModule.ADMINISTRATIF;

            case QUALITE_SOINS ->
                    ReclamationModule.EXERCICE_PROFESSIONNEL;

            case SECRET_PROFESSIONNEL, CONFRATERNITE, PUBLICITE_CHARLATANISME, DECONSIDERATION_PROFESSION ->
                    ReclamationModule.ETHIQUE_DEONTOLOGIE;

            case INFORMATION_CONSENTEMENT, COMPORTEMENT_INAPPROPRIE ->
                    ReclamationModule.RELATION_PATIENT;

            case CERTIFICAT_MEDICAL, PRESCRIPTION_ABUSIVE ->
                    ReclamationModule.DOCUMENT_MEDICAL;

            case AUTRE ->
                    ReclamationModule.AUTRE;
        };
    }

    private ReclamationCreatedResponse toCreatedResponse(Reclamation reclamation) {
        ReclamationCreatedResponse response = new ReclamationCreatedResponse();
        response.setId(reclamation.getId());
        response.setNumeroReclamation(reclamation.getNumeroReclamation());
        response.setCategorie(reclamation.getCategorie() != null ? reclamation.getCategorie().name() : null);
        response.setStatut(reclamation.getStatut().name());
        return response;
    }

    private ReclamationListResponse toListResponse(Reclamation reclamation) {
        ReclamationListResponse response = new ReclamationListResponse();
        response.setId(reclamation.getId());
        response.setNumeroReclamation(reclamation.getNumeroReclamation());
        response.setTypeAuteur(reclamation.getTypeAuteur().name());
        response.setCategorie(reclamation.getCategorie() != null ? reclamation.getCategorie().name() : null);
        response.setPriorite(reclamation.getPriorite() != null ? reclamation.getPriorite().name() : null);
        response.setModuleConcerne(reclamation.getModuleConcerne() != null ? reclamation.getModuleConcerne().name() : null);
        response.setObjet(reclamation.getObjet());
        response.setStatut(reclamation.getStatut().name());
        response.setDateCreation(reclamation.getDateCreation() != null ? reclamation.getDateCreation().toString() : null);
        response.setDateDerniereMiseAJour(
                reclamation.getDateDerniereMiseAJour() != null
                        ? reclamation.getDateDerniereMiseAJour().toString()
                        : null
        );

        if (reclamation.getAdminTraiteur() != null) {
            response.setAdminTraiteurNom(reclamation.getAdminTraiteur().getEmail());
        }

        if (reclamation.getTypeAuteur() == ReclamationAuteurType.MEDECIN && reclamation.getMedecin() != null) {
            response.setAuteurNom(reclamation.getMedecin().getNom() + " " + reclamation.getMedecin().getPrenom());
        } else {
            response.setAuteurNom(
                    (reclamation.getNomCitoyen() != null ? reclamation.getNomCitoyen() : "") + " " +
                            (reclamation.getPrenomCitoyen() != null ? reclamation.getPrenomCitoyen() : "")
            );
        }

        return response;
    }

    private ReclamationDetailResponse toDetailResponse(Reclamation reclamation) {
        ReclamationDetailResponse response = new ReclamationDetailResponse();
        response.setId(reclamation.getId());
        response.setNumeroReclamation(reclamation.getNumeroReclamation());
        response.setTypeAuteur(reclamation.getTypeAuteur().name());
        response.setCategorie(reclamation.getCategorie() != null ? reclamation.getCategorie().name() : null);
        response.setPriorite(reclamation.getPriorite() != null ? reclamation.getPriorite().name() : null);
        response.setModuleConcerne(reclamation.getModuleConcerne() != null ? reclamation.getModuleConcerne().name() : null);
        response.setObjet(reclamation.getObjet());
        response.setMessage(reclamation.getMessage());
        response.setPieceJointePath(reclamation.getPieceJointePath());
        response.setStatut(reclamation.getStatut().name());
        response.setDateCreation(reclamation.getDateCreation() != null ? reclamation.getDateCreation().toString() : null);
        response.setDatePriseEnCharge(reclamation.getDatePriseEnCharge() != null ? reclamation.getDatePriseEnCharge().toString() : null);
        response.setDateCloture(reclamation.getDateCloture() != null ? reclamation.getDateCloture().toString() : null);
        response.setDateDerniereMiseAJour(
                reclamation.getDateDerniereMiseAJour() != null
                        ? reclamation.getDateDerniereMiseAJour().toString()
                        : null
        );
        response.setAdminResponse(reclamation.getAdminResponse());

        if (reclamation.getAdminTraiteur() != null) {
            response.setAdminTraiteurId(reclamation.getAdminTraiteur().getId());
            response.setAdminTraiteurNom(reclamation.getAdminTraiteur().getEmail());
        }

        if (reclamation.getTypeAuteur() == ReclamationAuteurType.MEDECIN && reclamation.getMedecin() != null) {
            response.setNomAuteur(reclamation.getMedecin().getNom());
            response.setPrenomAuteur(reclamation.getMedecin().getPrenom());
            response.setEmailAuteur(reclamation.getMedecin().getEmail());
            response.setTelephoneAuteur(reclamation.getMedecin().getTelephone());
            response.setAdresseAuteur(reclamation.getMedecin().getAdresse());
        } else {
            response.setNomAuteur(reclamation.getNomCitoyen());
            response.setPrenomAuteur(reclamation.getPrenomCitoyen());
            response.setEmailAuteur(reclamation.getEmailCitoyen());
            response.setTelephoneAuteur(reclamation.getTelephoneCitoyen());
            response.setVilleAuteur(reclamation.getVilleCitoyen());
            response.setAdresseAuteur(reclamation.getAdresseCitoyen());
        }

        return response;
    }
}