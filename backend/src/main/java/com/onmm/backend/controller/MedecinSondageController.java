package com.onmm.backend.controller;

import com.onmm.backend.dto.sondage.*;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.Admin.SondageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/sondages")
@CrossOrigin(origins = "http://localhost:5173")
public class MedecinSondageController {

    private final SondageService sondageService;

    public MedecinSondageController(SondageService sondageService) {
        this.sondageService = sondageService;
    }

    private String currentEmail(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getEmail();
    }

    @GetMapping
    public List<MedecinSondageDto> getMesSondages(Authentication auth) {
        return sondageService.getSondagesForMedecin(currentEmail(auth));
    }

    @GetMapping("/{id}")
    public MedecinSondageDto getSondage(@PathVariable Long id, Authentication auth) {
        return sondageService.getSondageForMedecin(id, currentEmail(auth));
    }

    @PostMapping("/{id}/participer")
    public ResponseEntity<ParticipationStartResponse> startParticipation(
            @PathVariable Long id,
            Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sondageService.startParticipation(id, currentEmail(auth)));
    }

    @PostMapping("/participations/repondre")
    public ResponseEntity<Void> submitReponses(
            @RequestBody ReponseSubmitRequest req,
            Authentication auth
    ) {
        sondageService.submitReponses(req, currentEmail(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/mes-participations")
    public List<ParticipationStatusDto> getMesParticipations(Authentication auth) {
        return sondageService.getMesParticipations(currentEmail(auth));
    }
}
