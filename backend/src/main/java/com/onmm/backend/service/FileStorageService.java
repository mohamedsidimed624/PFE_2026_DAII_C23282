package com.onmm.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${upload.dir}")
    private String uploadDir;

    public String storeReclamationFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String originalName = file.getOriginalFilename();
            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String safeFileName = UUID.randomUUID() + extension;

            Path reclamationsDir = Paths.get(uploadDir, "reclamations");
            Files.createDirectories(reclamationsDir);

            Path targetPath = reclamationsDir.resolve(safeFileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/reclamations/" + safeFileName;

        } catch (IOException e) {
            throw new RuntimeException("Impossible d'enregistrer le fichier de réclamation", e);
        }
    }
}