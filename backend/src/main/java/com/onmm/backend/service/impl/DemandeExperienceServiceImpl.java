package com.onmm.backend.service.impl;

import com.onmm.backend.dto.DemandeExperienceRequest;
import com.onmm.backend.dto.DemandeExperienceResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.DemandeExperience;
import com.onmm.backend.mapper.DemandeExperienceMapper;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.DemandeExperienceRepository;
import com.onmm.backend.service.DemandeExperienceService;
import org.springframework.stereotype.Service;

@Service
public class DemandeExperienceServiceImpl implements DemandeExperienceService {

    private final DemandeExperienceRepository experienceRepository;
    private final DemandeAdhesionRepository demandeRepository;

    public DemandeExperienceServiceImpl(DemandeExperienceRepository experienceRepository, DemandeAdhesionRepository demandeRepository) {
        this.experienceRepository = experienceRepository;
        this. demandeRepository = demandeRepository;
    }

    @Override
    public DemandeExperienceResponse addExperience(Long demandeId, DemandeExperienceRequest request) {
        DemandeAdhesion demande = demandeRepository.findById(demandeId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        DemandeExperience exp = DemandeExperienceMapper.toEntity(request);

        exp.setDemandeAdhesion(demande);

        DemandeExperience saved = experienceRepository.save(exp);

        return DemandeExperienceMapper.toResponse(saved);
    }
}
