package com.onmm.backend.controller;

import com.onmm.backend.dto.medecin.MedecinProfileResponse;
import com.onmm.backend.dto.medecin.UpdateMedecinProfileRequest;
import com.onmm.backend.entity.User;
import com.onmm.backend.service.MedecinService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

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
        return medecinService.getMyProfile(user.getEmail());
    }

    @PutMapping("/me")
    public ResponseEntity<MedecinProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateMedecinProfileRequest request
    ) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(
                medecinService.updateMyProfile(user.getEmail(), request)
        );
    }

    @PostMapping("/me/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        User user = (User) authentication.getPrincipal();

        String photoPath = medecinService.updateMyPhoto(user.getEmail(), file);

        Map<String, String> response = new HashMap<>();
        response.put("photoProfilPath", photoPath);

        return ResponseEntity.ok(response);
    }
}