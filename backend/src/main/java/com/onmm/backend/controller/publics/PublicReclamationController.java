package com.onmm.backend.controller.publics;

import com.onmm.backend.dto.reclamation.CreatePublicReclamationRequest;
import com.onmm.backend.dto.reclamation.ReclamationCreatedResponse;
import com.onmm.backend.service.FileStorageService;
import com.onmm.backend.service.ReclamationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/public/reclamations")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicReclamationController {

    private final ReclamationService reclamationService;
    private final FileStorageService fileStorageService;

    public PublicReclamationController(ReclamationService reclamationService,
                                       FileStorageService fileStorageService) {
        this.reclamationService = reclamationService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    public ReclamationCreatedResponse createPublicReclamation(
            @RequestPart("data") CreatePublicReclamationRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        String pieceJointePath = fileStorageService.storeReclamationFile(file);

        return reclamationService.createPublicReclamation(request, pieceJointePath);
    }
}