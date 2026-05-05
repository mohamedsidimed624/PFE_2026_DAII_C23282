package com.onmm.backend.controller.publics;

import com.onmm.backend.dto.contenu.ContenuResponseDTO;
import com.onmm.backend.entity.enums.ContenuType;
import com.onmm.backend.service.Admin.ContenuService;
import com.onmm.backend.service.publics.ContenuPublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/contenus")
@RequiredArgsConstructor
public class ContenuPublicController {

    private final ContenuPublicService contenuPublicService;

    @GetMapping
    public Page<ContenuResponseDTO> getPublicContenus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) ContenuType type,
            @RequestParam(required = false) Long categorieId,
            @RequestParam(required = false) String search
    ) {
        return contenuPublicService.getPublicContenus(
                page,
                size,
                type,
                categorieId,
                search
        );
    }

    @GetMapping("/{id}")
    public ContenuResponseDTO getPublicContenuById(@PathVariable Long id) {
        return contenuPublicService.getPublicContenuById(id);
    }
}