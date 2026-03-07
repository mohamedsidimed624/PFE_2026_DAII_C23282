package com.onmm.backend.controller;

import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.service.DemandeDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/demandes")
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

        return ResponseEntity.ok(
                documentService.uploadDocument(id, typeDocument, categorie, file)
        );
    }
}