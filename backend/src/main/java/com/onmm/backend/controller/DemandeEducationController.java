package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeEducationRequest;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.entity.DemandeEducation;
import com.onmm.backend.service.DemandeEducationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demandes")
public class DemandeEducationController {

    private final DemandeEducationService educationService;

    public DemandeEducationController(DemandeEducationService educationService) {
        this.educationService = educationService;
    }

    @PostMapping("/{id}/educations")
    public DemandeEducationResponse addEducation(
            @PathVariable Long id,
            @Valid @RequestBody DemandeEducationRequest request
    ) {

        return educationService.addEducation(id, request);
    }
}