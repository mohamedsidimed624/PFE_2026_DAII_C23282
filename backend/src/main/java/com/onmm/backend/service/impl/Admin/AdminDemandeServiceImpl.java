package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.dto.Admin.AdminDemandeDetailResponse;
import com.onmm.backend.dto.Admin.AdminDemandeResponse;
import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.dto.DemandeExperienceResponse;
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
                            System.out.println("File path :" + d.getFilePath());
                            System.out.println("After Fix :" + d.getFilePath().replace("\\", "/"));
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