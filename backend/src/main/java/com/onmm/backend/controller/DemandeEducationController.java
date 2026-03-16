package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeEducationRequest;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.entity.DemandeEducation;
import com.onmm.backend.service.DemandeEducationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demandes")
@CrossOrigin(origins = "http://localhost:5173")
public class DemandeEducationController {

    private final DemandeEducationService educationService;

    public DemandeEducationController(DemandeEducationService educationService) {
        this.educationService = educationService;
    }

    @PostMapping("/{id}/educations")
    public DemandeEducationResponse addEducation(
            @PathVariable Long id,
            @RequestBody DemandeEducationRequest request
    ) {

        return educationService.addEducation(id, request);
    }
}