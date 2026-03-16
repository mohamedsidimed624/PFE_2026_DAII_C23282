package com.onmm.backend.service.impl;

import com.onmm.backend.dto.DemandeDocumentResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.DemandeDocument;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.repository.DemandeDocumentRepository;
import com.onmm.backend.service.DemandeDocumentService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Service
public class DemandeDocumentServiceImpl implements DemandeDocumentService {

    private final DemandeDocumentRepository documentRepository;
    private final DemandeAdhesionRepository demandeRepository;

    private final String uploadDir = "uploads/";

    public DemandeDocumentServiceImpl(
            DemandeDocumentRepository documentRepository,
            DemandeAdhesionRepository demandeRepository) {

        this.documentRepository = documentRepository;
        this.demandeRepository = demandeRepository;
    }

    @Override
    public DemandeDocumentResponse uploadDocument(
            Long demandeId,
            String typeDocument,
            String categorie,
            MultipartFile file) {

        try {

            DemandeAdhesion demande = demandeRepository.findById(demandeId)
                    .orElseThrow(() -> new RuntimeException("Demande introuvable"));

            System.out.println("UPLOAD DOCUMENT APPELLE");

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path path = Paths.get(uploadDir + fileName);

            Files.createDirectories(path.getParent());

            Files.write(path, file.getBytes());

            System.out.println("FILE NAME = " + file.getOriginalFilename());

            DemandeDocument document = new DemandeDocument();

            document.setTypeDocument(typeDocument);
            document.setCategorie(categorie);
            document.setFileName(fileName);
            document.setFilePath(path.toString());
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
