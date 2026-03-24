package com.onmm.backend.service.impl;

import com.onmm.backend.dto.auth.SetPasswordRequest;
import com.onmm.backend.entity.ActivationToken;
import com.onmm.backend.entity.User;
import com.onmm.backend.entity.enums.TokenType;
import com.onmm.backend.repository.ActivationTokenRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.AuthService;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.onmm.backend.dto.auth.LoginRequest;
import com.onmm.backend.dto.auth.LoginResponse;
import com.onmm.backend.service.JwtService;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final ActivationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(ActivationTokenRepository tokenRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public String activateAccount(String tokenValue) {

        ActivationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (token.isUsed()) {
            throw new RuntimeException("Token déjà utilisé");
        }

        if (token.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expiré");
        }

        User user = token.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        return "Compte activé avec succès";
    }

    @Override
    public void setPassword(SetPasswordRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas");
        }

        ActivationToken token = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (token.isUsed()) {
            throw new RuntimeException("Token déjà utilisé");
        }

        if (token.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expiré");
        }

        if (token.getType() != TokenType.SET_PASSWORD) {
            throw new RuntimeException("Token invalide pour définir le mot de passe");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);

        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe invalide"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Votre compte n'est pas encore activé");
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new RuntimeException("Email ou mot de passe invalide");
        }

        // JWT viendra à l’étape suivante
        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getRole().name(),
                user.getEmail()
        );
    }
}