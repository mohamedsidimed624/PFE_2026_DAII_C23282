package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.service.DemandeAdhesionService;
import org.springframework.http.HttpStatus;
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
    public DemandeAdhesion createDemande(@RequestBody DemandeAdhesionRequest request) {

        DemandeAdhesion demande = new DemandeAdhesion();

        demande.setNNI(request.getNni());
        demande.setNom(request.getNom());
        demande.setPrenom(request.getPrenom());
        demande.setSexe(request.getSexe());
        demande.setNationalite(request.getNationalite());
        demande.setDateNaissance(request.getDateNaissance());
        demande.setEmail(request.getEmail());
        demande.setTelephone(request.getTelephone());
        demande.setAdresse(request.getAdresse());

        return demandeAdhesionService.createDemande(demande);
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
