package com.onmm.backend.service.impl;

import com.onmm.backend.dto.auth.LoginRequest;
import com.onmm.backend.dto.auth.LoginResponse;
import com.onmm.backend.dto.auth.SetPasswordRequest;
import com.onmm.backend.entity.ActivationToken;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.entity.enums.TokenType;
import com.onmm.backend.repository.ActivationTokenRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.exception.BusinessException;
import com.onmm.backend.service.AuthService;
import com.onmm.backend.service.JWTService;
import com.onmm.backend.service.email.EmailService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final ActivationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JWTService jwtService;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public AuthServiceImpl(ActivationTokenRepository tokenRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authManager,
                           JWTService jwtService,
                           EmailService emailService
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Override
    public String activateAccount(String tokenValue) {

        ActivationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new BusinessException("Token invalide"));

        if (token.isUsed()) {
            throw new BusinessException("Token déjà utilisé");
        }

        if (token.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Token expiré");
        }

        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        return "Compte activé avec succès";
    }

    @Override
    @Transactional
    public void setPassword(SetPasswordRequest request) {

        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new BusinessException("Le mot de passe doit contenir au moins 8 caractères");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Les mots de passe ne correspondent pas");
        }

        ActivationToken token = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BusinessException("Token invalide"));

        if (token.isUsed()) {
            throw new BusinessException("Token déjà utilisé");
        }

        if (token.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Token expiré");
        }

        if (token.getType() == TokenType.ACTIVATION) {
            throw new BusinessException("Token invalide pour définir le mot de passe");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);

        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            tokenRepository.deleteByUserAndType(user, TokenType.SET_PASSWORD);
            ActivationToken token = new ActivationToken();
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setType(TokenType.SET_PASSWORD);
            token.setUsed(false);
            token.setExpirationDate(LocalDateTime.now().plusHours(1));
            tokenRepository.save(token);

            String name = user.getEmail();
            String link = frontendUrl + "/set-password?token=" + token.getToken();
            emailService.sendPasswordResetEmail(email, name, link);
        });
    }

    @Override
    @Transactional
    public void verifyActivationEmail(String tokenValue, String email) {
        ActivationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new BusinessException("Lien invalide ou expiré."));
        if (token.isUsed()) {
            throw new BusinessException("Ce lien a déjà été utilisé.");
        }
        if (token.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Ce lien a expiré.");
        }
        if (token.getType() == TokenType.ACTIVATION) {
            throw new BusinessException("Type de token invalide.");
        }
        if (!token.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new RuntimeException("Email incorrect. Vérifiez l'adresse email associée à votre compte.");
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getRole().name(),
                user.getEmail()
        );
    }
}
