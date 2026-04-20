package com.onmm.backend.service.impl;

import com.onmm.backend.dto.DemandeEducationRequest;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.DemandeEducation;
import com.onmm.backend.entity.Specialite;
import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.mapper.DemandeEducationMapper;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.DemandeEducationRepository;
import com.onmm.backend.repository.SpecialiteRepository;
import com.onmm.backend.repository.SousSpecialiteRepository;
import com.onmm.backend.service.DemandeEducationService;
import org.springframework.stereotype.Service;

@Service
public class DemandeEducationServiceImpl implements DemandeEducationService {

    private final DemandeEducationRepository educationRepository;
    private final DemandeAdhesionRepository demandeRepository;
    private final SpecialiteRepository specialiteRepository;
    private final SousSpecialiteRepository sousSpecialiteRepository;

    public DemandeEducationServiceImpl(
            DemandeEducationRepository educationRepository,
            DemandeAdhesionRepository demandeRepository,
            SpecialiteRepository specialiteRepository,
            SousSpecialiteRepository sousSpecialiteRepository
    ) {
        this.educationRepository = educationRepository;
        this.demandeRepository = demandeRepository;
        this.specialiteRepository = specialiteRepository;
        this.sousSpecialiteRepository = sousSpecialiteRepository;
    }

    @Override
    public DemandeEducationResponse addEducation(Long demandeId, DemandeEducationRequest request) {

        // 1) récupérer la demande
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        // 2) valider et charger la spécialité
        if (request.getSpecialiteId() == null) {
            throw new RuntimeException("La spécialité est obligatoire");
        }

        Specialite specialite = specialiteRepository.findById(request.getSpecialiteId())
                .orElseThrow(() -> new RuntimeException("Spécialité introuvable"));

        if (!specialite.isActive()) {
            throw new RuntimeException("La spécialité sélectionnée est inactive");
        }

        // 3) valider et charger la sous-spécialité si fournie
        SousSpecialite sousSpecialite = null;

        if (request.getSousSpecialiteId() != null) {
            sousSpecialite = sousSpecialiteRepository.findById(request.getSousSpecialiteId())
                    .orElseThrow(() -> new RuntimeException("Sous-spécialité introuvable"));

            if (!sousSpecialite.isActive()) {
                throw new RuntimeException("La sous-spécialité sélectionnée est inactive");
            }

            if (!sousSpecialite.getSpecialite().getId().equals(specialite.getId())) {
                throw new RuntimeException("La sous-spécialité ne correspond pas à la spécialité sélectionnée");
            }
        }

        // 4) construire l'entité
        DemandeEducation education = new DemandeEducation();
        education.setDemandeAdhesion(demande);
        education.setSpecialite(specialite);
        education.setSousSpecialite(sousSpecialite);
        education.setDiplome(request.getDiplome());
        education.setAnneeObtention(request.getAnneeObtention());
        education.setPays(request.getPays());
        education.setVille(request.getVille());
        education.setUniversite(request.getUniversite());

        // 5) sauvegarder
        DemandeEducation savedEducation = educationRepository.save(education);

        // 6) retourner la réponse
        return DemandeEducationMapper.toResponse(savedEducation);
    }
}