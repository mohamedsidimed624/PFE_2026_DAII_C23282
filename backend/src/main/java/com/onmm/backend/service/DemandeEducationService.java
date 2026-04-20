package com.onmm.backend.service;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.dto.DemandeEducationRequest;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.entity.DemandeEducation;

public interface DemandeEducationService {

    DemandeEducationResponse addEducation(Long demandeId, DemandeEducationRequest request);
}
