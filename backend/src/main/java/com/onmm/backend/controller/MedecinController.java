package com.onmm.backend.controller;

import com.onmm.backend.dto.medecin.MedecinProfileResponse;
import com.onmm.backend.entity.User;
import com.onmm.backend.service.MedecinService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medecin")
@CrossOrigin(origins = "http://localhost:5173")
public class MedecinController {

    private final MedecinService medecinService;

    public MedecinController(MedecinService medecinService) {
        this.medecinService = medecinService;
    }

    @GetMapping("/me")
    public MedecinProfileResponse getMyProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String email = user.getEmail();
        return medecinService.getMyProfile(email);
    }
}