package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.dto.Admin.AdminDemandeDetailResponse;
import com.onmm.backend.dto.Admin.AdminDemandeResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.service.Admin.AdminDemandeService;
import org.springframework.stereotype.Service;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.service.email.EmailService;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminDemandeServiceImpl implements AdminDemandeService {

    private final DemandeAdhesionRepository repository;
    private final EmailService emailService;

    public AdminDemandeServiceImpl(DemandeAdhesionRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
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
                        .map(e -> e.getDiplome())
                        .toList()
        );

        dto.setExperiences(
                demande.getExperiences()
                        .stream()
                        .map(e -> e.getPoste())
                        .toList()
        );

        dto.setDocuments(
                demande.getDocuments()
                        .stream()
                        .map(d -> d.getFileName())
                        .toList()
        );

        return dto;
    }

    @Override
    public void approveDemande(Long id) {

        DemandeAdhesion demande = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        // Vérification métier
        if (!demande.isPending()) {
            throw new RuntimeException("Demande déjà traitée");
        }

        demande.setStatut(ApplicationStatus.APPROUVED);
        demande.setDecisionDate(LocalDateTime.now());

        repository.save(demande);

        // Email activation (simple pour maintenant)
        String activationLink = "http://localhost:5173/activate-account";

        emailService.sendApprovalEmail(
                demande.getEmail(),
                demande.getNom(),
                activationLink
        );
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
}