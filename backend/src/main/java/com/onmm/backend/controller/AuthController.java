package com.onmm.backend.controller;

import com.onmm.backend.dto.auth.SetPasswordRequest;
import com.onmm.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/activate")
    public String activateAccount(@RequestParam String token) {
        return authService.activateAccount(token);
    }

    @PostMapping("/set-password")
    public String setPassword(@RequestBody SetPasswordRequest request) {
        authService.setPassword(request);
        return "Mot de passe defini avec succes";
    }
}
