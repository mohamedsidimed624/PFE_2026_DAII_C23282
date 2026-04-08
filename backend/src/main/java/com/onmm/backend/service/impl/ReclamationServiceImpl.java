package com.onmm.backend.service.impl;

import com.onmm.backend.dto.reclamation.*;
import com.onmm.backend.entity.*;
import com.onmm.backend.entity.enums.ReclamationAuteurType;
import com.onmm.backend.entity.enums.ReclamationStatus;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.ReclamationRepository;
import com.onmm.backend.repository.UserRepository;
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

    public ReclamationServiceImpl(ReclamationRepository reclamationRepository,
                                  UserRepository userRepository,
                                  MedecinRepository medecinRepository,
                                  EmailService emailService) {
        this.reclamationRepository = reclamationRepository;
        this.userRepository = userRepository;
        this.medecinRepository = medecinRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public ReclamationCreatedResponse createPublicReclamation(CreatePublicReclamationRequest request, String pieceJointePath) {
        Reclamation reclamation = new Reclamation();
        reclamation.setNumeroReclamation(generateNumeroReclamation());
        reclamation.setTypeAuteur(ReclamationAuteurType.CITOYEN);
        reclamation.setObjet(request.getObjet());
        reclamation.setMessage(request.getMessage());
        reclamation.setPieceJointePath(pieceJointePath);
        reclamation.setStatut(ReclamationStatus.SUBMITTED);
        reclamation.setDateCreation(LocalDateTime.now());

        reclamation.setNomCitoyen(request.getNom());
        reclamation.setPrenomCitoyen(request.getPrenom());
        reclamation.setVilleCitoyen(request.getVille());
        reclamation.setAdresseCitoyen(request.getAdresse());
        reclamation.setTelephoneCitoyen(request.getTelephone());
        reclamation.setEmailCitoyen(request.getEmail());

        reclamationRepository.save(reclamation);

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
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Medecin medecin = medecinRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        Reclamation reclamation = new Reclamation();
        reclamation.setNumeroReclamation(generateNumeroReclamation());
        reclamation.setTypeAuteur(ReclamationAuteurType.MEDECIN);
        reclamation.setObjet(request.getObjet());
        reclamation.setMessage(request.getMessage());
        reclamation.setPieceJointePath(pieceJointePath);
        reclamation.setStatut(ReclamationStatus.SUBMITTED);
        reclamation.setDateCreation(LocalDateTime.now());
        reclamation.setMedecin(medecin);

        reclamationRepository.save(reclamation);

        return toCreatedResponse(reclamation);
    }

    @Override
    @Transactional
    public List<ReclamationListResponse> getMedecinReclamations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Medecin medecin = medecinRepository.findByUser(user)
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
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Medecin medecin = medecinRepository.findByUser(user)
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

        reclamation.setStatut(ReclamationStatus.IN_PROGRESS);
        reclamation.setDatePriseEnCharge(LocalDateTime.now());

        reclamationRepository.save(reclamation);
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

        reclamation.setStatut(ReclamationStatus.CLOSED);
        reclamation.setDateCloture(LocalDateTime.now());
        reclamation.setAdminResponse(request.getAdminResponse());
        reclamation.setAdminTraiteur(currentAdmin);

        if (reclamation.getDatePriseEnCharge() == null) {
            reclamation.setDatePriseEnCharge(LocalDateTime.now());
        }

        reclamationRepository.save(reclamation);

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

    private ReclamationCreatedResponse toCreatedResponse(Reclamation reclamation) {
        ReclamationCreatedResponse response = new ReclamationCreatedResponse();
        response.setId(reclamation.getId());
        response.setNumeroReclamation(reclamation.getNumeroReclamation());
        response.setStatut(reclamation.getStatut().name());
        return response;
    }

    private ReclamationListResponse toListResponse(Reclamation reclamation) {
        ReclamationListResponse response = new ReclamationListResponse();
        response.setId(reclamation.getId());
        response.setNumeroReclamation(reclamation.getNumeroReclamation());
        response.setTypeAuteur(reclamation.getTypeAuteur().name());
        response.setObjet(reclamation.getObjet());
        response.setStatut(reclamation.getStatut().name());
        response.setDateCreation(reclamation.getDateCreation() != null ? reclamation.getDateCreation().toString() : null);

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
        response.setObjet(reclamation.getObjet());
        response.setMessage(reclamation.getMessage());
        response.setPieceJointePath(reclamation.getPieceJointePath());
        response.setStatut(reclamation.getStatut().name());
        response.setDateCreation(reclamation.getDateCreation() != null ? reclamation.getDateCreation().toString() : null);
        response.setDatePriseEnCharge(reclamation.getDatePriseEnCharge() != null ? reclamation.getDatePriseEnCharge().toString() : null);
        response.setDateCloture(reclamation.getDateCloture() != null ? reclamation.getDateCloture().toString() : null);
        response.setAdminResponse(reclamation.getAdminResponse());

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