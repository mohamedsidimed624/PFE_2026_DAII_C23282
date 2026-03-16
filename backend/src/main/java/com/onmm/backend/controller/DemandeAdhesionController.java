package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.service.DemandeAdhesionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demandes")
@CrossOrigin(origins = "http://localhost:5173")
public class DemandeAdhesionController {

    private final DemandeAdhesionService demandeAdhesionService;

    public DemandeAdhesionController(DemandeAdhesionService demandeAdhesionService) {
        this.demandeAdhesionService = demandeAdhesionService;
    }

    @PostMapping
    public ResponseEntity<DemandeAdhesion> createDemande(
            @RequestBody DemandeAdhesionRequest request
    ) {

        DemandeAdhesion demande = demandeAdhesionService.createDemande(request);

        return ResponseEntity.ok(demande);
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkUnique(
            @RequestParam String nni,
            @RequestParam String email,
            @RequestParam String telephone
    ) {

        return demandeAdhesionService.checkUnique(nni, email, telephone);
    }
}