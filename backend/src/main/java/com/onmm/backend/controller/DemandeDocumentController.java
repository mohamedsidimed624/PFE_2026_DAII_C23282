package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.service.DemandeDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/demandes")
@CrossOrigin(origins = "http://localhost:5173")
public class DemandeDocumentController {

    private final DemandeDocumentService documentService;

    public DemandeDocumentController(DemandeDocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<DemandeDocumentResponse> uploadDocument(

            @PathVariable Long id,

            @RequestParam String typeDocument,

            @RequestParam String categorie,

            @RequestParam MultipartFile file
    ) {

        DemandeDocumentResponse response =
                documentService.uploadDocument(id, typeDocument, categorie, file);

        return ResponseEntity.ok(response);
    }
}