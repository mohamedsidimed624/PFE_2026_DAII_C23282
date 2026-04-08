package com.onmm.backend.controller;

import com.onmm.backend.dto.reclamation.CreateMedecinReclamationRequest;
import com.onmm.backend.dto.reclamation.ReclamationCreatedResponse;
import com.onmm.backend.dto.reclamation.ReclamationDetailResponse;
import com.onmm.backend.dto.reclamation.ReclamationListResponse;
import com.onmm.backend.entity.User;
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

    @PostMapping
    public ReclamationCreatedResponse createMedecinReclamation(
            Authentication authentication,
            @RequestPart("data") CreateMedecinReclamationRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        User user = (User) authentication.getPrincipal();

        String pieceJointePath = fileStorageService.storeReclamationFile(file);

        return reclamationService.createMedecinReclamation(
                user.getEmail(),
                request,
                pieceJointePath
        );
    }

    @GetMapping
    public List<ReclamationListResponse> getMyReclamations(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return reclamationService.getMedecinReclamations(user.getEmail());
    }

    @GetMapping("/{id}")
    public ReclamationDetailResponse getReclamationDetail(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return reclamationService.getMedecinReclamationDetail(id, user.getEmail());
    }
}