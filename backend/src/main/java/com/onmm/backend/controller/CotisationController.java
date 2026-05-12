package com.onmm.backend.controller;

import com.onmm.backend.dto.cotisation.ConfirmerPaiementRequest;
import com.onmm.backend.dto.cotisation.CotisationDto;
import com.onmm.backend.dto.cotisation.InitierPaiementResponse;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.CotisationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/cotisations")
@CrossOrigin(origins = "http://localhost:5173")
public class CotisationController {

    private final CotisationService cotisationService;

    public CotisationController(CotisationService cotisationService) {
        this.cotisationService = cotisationService;
    }

    private String currentEmail(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getEmail();
    }

    @GetMapping
    public List<CotisationDto> getMyCotisations(Authentication authentication) {
        return cotisationService.getMyCotisations(currentEmail(authentication));
    }

    @GetMapping("/courante")
    public ResponseEntity<CotisationDto> getCotisationCourante(Authentication authentication) {
        CotisationDto dto = cotisationService.getCotisationCourante(currentEmail(authentication));
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/initier-paiement")
    public ResponseEntity<InitierPaiementResponse> initierPaiement(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(cotisationService.initierPaiement(currentEmail(authentication), id));
    }

    @PostMapping("/{id}/confirmer-paiement")
    public ResponseEntity<CotisationDto> confirmerPaiement(
            @PathVariable Long id,
            @RequestBody ConfirmerPaiementRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                cotisationService.confirmerPaiement(currentEmail(authentication), id, request.getCodeTransaction())
        );
    }
}
