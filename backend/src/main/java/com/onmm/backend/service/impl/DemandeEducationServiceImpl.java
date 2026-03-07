package com.onmm.backend.service.impl;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.dto.DemandeEducationRequest;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.DemandeEducation;
import com.onmm.backend.mapper.DemandeEducationMapper;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.DemandeEducationRepository;
import com.onmm.backend.service.DemandeEducationService;
import org.springframework.stereotype.Service;

@Service
public class DemandeEducationServiceImpl implements DemandeEducationService {

    private final DemandeEducationRepository educationRepository;
    private final DemandeAdhesionRepository demandeRepository;

    public DemandeEducationServiceImpl(DemandeEducationRepository educationRepository,
                                       DemandeAdhesionRepository demandeRepository) {
        this.educationRepository = educationRepository;
        this.demandeRepository = demandeRepository;
    }

    @Override
    public DemandeEducation addEducation(Long demandeId, DemandeAdhesionRequest request) {
        return null;
    }

    @Override
    public DemandeEducationResponse addEducation(Long demandeId, DemandeEducationRequest request) {

        // 1 récupérer la demande
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        // 2 convertir DTO → Entity
        DemandeEducation education = DemandeEducationMapper.toEntity(request);

        // 3 attacher la demande
        education.setDemandeAdhesion(demande);

        // 4 sauvegarder
        DemandeEducation savedEducation = educationRepository.save(education);

        // 5 convertir Entity → ResponseDTO
        return DemandeEducationMapper.toResponse(savedEducation);
    }
}