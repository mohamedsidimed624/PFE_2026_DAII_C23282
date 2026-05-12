package com.onmm.backend.controller;

import com.onmm.backend.dto.reclamation.CreateMedecinReclamationRequest;
import com.onmm.backend.dto.reclamation.ReclamationCreatedResponse;
import com.onmm.backend.dto.reclamation.ReclamationDetailResponse;
import com.onmm.backend.dto.reclamation.ReclamationListResponse;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.FileStorageService;
import com.onmm.backend.service.ReclamationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/medecin/reclamations")
@CrossOrigin(origins = "http://localhost:5173")
public class MedecinReclamationController {

    private final ReclamationService reclamationService;
    private final FileStorageService fileStorageService;

    public MedecinReclamationController(ReclamationService reclamationService,
                                        FileStorageService fileStorageService) {
        this.reclamationService = reclamationService;
        this.fileStorageService = fileStorageService;
    }

    private String currentEmail(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getEmail();
    }

    @PostMapping
    public ReclamationCreatedResponse createMedecinReclamation(
            Authentication authentication,
            @RequestPart("data") CreateMedecinReclamationRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        String pieceJointePath = fileStorageService.storeReclamationFile(file);
        return reclamationService.createMedecinReclamation(
                currentEmail(authentication),
                request,
                pieceJointePath
        );
    }

    @GetMapping
    public List<ReclamationListResponse> getMyReclamations(Authentication authentication) {
        return reclamationService.getMedecinReclamations(currentEmail(authentication));
    }

    @GetMapping("/{id}")
    public ReclamationDetailResponse getReclamationDetail(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return reclamationService.getMedecinReclamationDetail(id, currentEmail(authentication));
    }
}
