package com.onmm.backend.controller;

import com.onmm.backend.dto.contenu.ContenuResponseDTO;
import com.onmm.backend.entity.User;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.Admin.ContenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medecin/contenus")
@RequiredArgsConstructor
public class ContenuMedecinController {

    private final ContenuService contenuService;
    private final UserRepository userRepository;

    @GetMapping
    public Page<ContenuResponseDTO> getMedecinContenus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return contenuService.getMedecinContenus(user.getId(), page, size);
    }
}
