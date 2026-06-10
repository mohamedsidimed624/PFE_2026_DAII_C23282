package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeExperienceRequest;
import com.onmm.backend.dto.DemandeExperienceResponse;
import com.onmm.backend.service.DemandeExperienceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demandes")
public class DemandeExperienceController {

    private final DemandeExperienceService experienceService;

    public DemandeExperienceController(DemandeExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @PostMapping("/{id}/experiences")
    public ResponseEntity<DemandeExperienceResponse> addExperience(
            @PathVariable Long id,
            @Valid @RequestBody DemandeExperienceRequest request) {

        System.out.println("EXPERIENCE RECU = " + request);

        System.out.println("EXPERIENCE CONTROLLER APPELE");

        return ResponseEntity.ok(
                experienceService.addExperience(id, request)
        );
    }
}
