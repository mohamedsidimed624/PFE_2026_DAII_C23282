package com.onmm.backend.controller;

import com.onmm.backend.dto.auth.ForgotPasswordRequest;
import com.onmm.backend.dto.auth.LoginRequest;
import com.onmm.backend.dto.auth.LoginResponse;
import com.onmm.backend.dto.auth.SetPasswordRequest;
import com.onmm.backend.dto.auth.VerifyEmailRequest;
import com.onmm.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        System.out.println("Success");
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Si cet email est enregistré, vous recevrez un lien de réinitialisation.");
    }

    @PostMapping("/verify-activation-email")
    public ResponseEntity<String> verifyActivationEmail(@RequestBody VerifyEmailRequest request) {
        authService.verifyActivationEmail(request.getToken(), request.getEmail());
        return ResponseEntity.ok("Email vérifié.");
    }
}
