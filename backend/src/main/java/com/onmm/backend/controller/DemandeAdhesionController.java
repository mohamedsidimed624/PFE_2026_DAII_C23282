package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.dto.DemandeAdhesionResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.service.DemandeAdhesionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.onmm.backend.dto.demande.SuiviDossierResponse;
import com.onmm.backend.dto.demande.RepriseDemandeResponse;

@RestController
@RequestMapping("/api/demandes")
@CrossOrigin(origins = "http://localhost:5173")
public class DemandeAdhesionController {

    private final DemandeAdhesionService demandeAdhesionService;

    public DemandeAdhesionController(DemandeAdhesionService demandeAdhesionService) {
        this.demandeAdhesionService = demandeAdhesionService;
    }

    @PostMapping
    public ResponseEntity<DemandeAdhesionResponse> createDemande(
            @RequestBody DemandeAdhesionRequest request
    ) {
        DemandeAdhesion demande = demandeAdhesionService.createDemande(request);

        DemandeAdhesionResponse response = new DemandeAdhesionResponse();
        response.setId(demande.getId());
        response.setNumeroDossier(demande.getNumeroDossier());
        response.setStatut(demande.getStatut().toString());
        response.setMessage("Votre demande a été soumise avec succès.");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkUnique(
            @RequestParam String nni,
            @RequestParam String email,
            @RequestParam String telephone
    ) {
        return demandeAdhesionService.checkUnique(nni, email, telephone);
    }

    @GetMapping("/suivi/{numeroDossier}")
    public ResponseEntity<SuiviDossierResponse> getSuiviDossier(@PathVariable String numeroDossier) {
        SuiviDossierResponse response = demandeAdhesionService.getSuiviByNumeroDossier(numeroDossier);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/reprise/{numeroDossier}")
    public ResponseEntity<RepriseDemandeResponse> getDemandePourReprise(@PathVariable String numeroDossier) {
        return ResponseEntity.ok(demandeAdhesionService.getDemandePourReprise(numeroDossier));
    }


}