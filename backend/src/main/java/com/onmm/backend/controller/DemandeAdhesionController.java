package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.service.DemandeAdhesionService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demandes")
public class DemandeAdhesionController {

    private final DemandeAdhesionService demandeAdhesionService;


    public DemandeAdhesionController(DemandeAdhesionService demandeAdhesionService) {
        this.demandeAdhesionService = demandeAdhesionService;
    }

    @PostMapping
    public DemandeAdhesion createDemande(@RequestBody DemandeAdhesionRequest request) {

        DemandeAdhesion demande = new DemandeAdhesion();

        demande.setNNI(request.getNNI());
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
}
