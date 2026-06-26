package com.onmm.backend.service.impl;

import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.DemandeDocument;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.DemandeDocumentRepository;
import com.onmm.backend.service.DemandeDocumentService;
import com.onmm.backend.service.storage.ObjectStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class DemandeDocumentServiceImpl implements DemandeDocumentService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final java.util.Set<String> ALLOWED_CONTENT_TYPES = java.util.Set.of(
            "application/pdf", "image/jpeg", "image/png");

    private final DemandeDocumentRepository documentRepository;
    private final DemandeAdhesionRepository demandeRepository;
    private final ObjectStorageService objectStorageService;

    public DemandeDocumentServiceImpl(
            DemandeDocumentRepository documentRepository,
            DemandeAdhesionRepository demandeRepository,
            ObjectStorageService objectStorageService) {

        this.documentRepository = documentRepository;
        this.demandeRepository = demandeRepository;
        this.objectStorageService = objectStorageService;
    }

    @Override
    public DemandeDocumentResponse uploadDocument(
            Long demandeId,
            String typeDocument,
            String categorie,
            MultipartFile file) {

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new RuntimeException("Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("Le fichier dépasse la taille maximale autorisée (5 Mo)");
        }

        try {

            DemandeAdhesion demande = demandeRepository.findById(demandeId)
                    .orElseThrow(() -> new RuntimeException("Demande introuvable"));

            System.out.println("UPLOAD DOCUMENT APPELLE");

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String key = "demandes/" + fileName;
            String url = objectStorageService.upload(key, file.getBytes(), file.getContentType());

            System.out.println("FILE NAME = " + file.getOriginalFilename());

            DemandeDocument document = new DemandeDocument();

            document.setTypeDocument(typeDocument);
            document.setCategorie(categorie);
            document.setFileName(fileName);
            document.setFilePath(url);
            document.setSize(file.getSize());
            document.setUploadDate(LocalDateTime.now());
            document.setDemandeAdhesion(demande);

            DemandeDocument saved = documentRepository.save(document);

            DemandeDocumentResponse response = new DemandeDocumentResponse();

            response.setId(saved.getId());
            response.setTypeDocument(saved.getTypeDocument());
            response.setCategorie(saved.getCategorie());
            response.setFileName(saved.getFileName());
            response.setSize(saved.getSize());
            response.setUploadDate(saved.getUploadDate());

            return response;

        } catch (IOException e) {
            throw new RuntimeException("Erreur upload fichier");
        }
    }
}
