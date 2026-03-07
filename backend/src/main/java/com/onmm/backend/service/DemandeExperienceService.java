package com.onmm.backend.service;

import com.onmm.backend.dto.DemandeExperienceRequest;
import com.onmm.backend.dto.DemandeExperienceResponse;

public interface DemandeExperienceService {

    DemandeExperienceResponse addExperience(
            Long demandeId,
            DemandeExperienceRequest request
    );
}
