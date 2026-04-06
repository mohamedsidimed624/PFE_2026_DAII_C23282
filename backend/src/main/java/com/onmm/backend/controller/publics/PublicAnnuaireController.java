package com.onmm.backend.controller.publics;

import com.onmm.backend.dto.publics.PublicMedecinDetailResponse;
import com.onmm.backend.dto.publics.PublicMedecinResponse;
import com.onmm.backend.service.publics.PublicAnnuaireService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/annuaire")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicAnnuaireController {

    private final PublicAnnuaireService publicAnnuaireService;

    public PublicAnnuaireController(PublicAnnuaireService publicAnnuaireService) {
        this.publicAnnuaireService = publicAnnuaireService;
    }

    @GetMapping("/medecins")
    public Page<PublicMedecinResponse> searchMedecins(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String numeroInscription,
            @RequestParam(required = false) String specialite,
            @RequestParam(required = false) String ville,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(defaultValue = "alpha") String sort
    ) {
        return publicAnnuaireService.searchMedecins(
                nom,
                prenom,
                numeroInscription,
                specialite,
                ville,
                page,
                size,
                sort
        );
    }

    @GetMapping("/medecins/{id}")
    public PublicMedecinDetailResponse getPublicMedecinById(@PathVariable Long id) {
        return publicAnnuaireService.getPublicMedecinById(id);
    }
}