package com.onmm.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${upload.dir}")
    private String uploadDir;

    private static final long MAX_IMAGE_SIZE = 3 * 1024 * 1024;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    public String storeReclamationFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        return storeFile(file, "reclamations");
    }

    public String storeContenuImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("L’image de couverture est obligatoire.");
        }

        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new RuntimeException("L’image ne doit pas dépasser 3 Mo.");
        }

        if (!ALLOWED_IMAGE_TYPES.contains(image.getContentType())) {
            throw new RuntimeException("Format non autorisé. Utilisez JPG, PNG ou WEBP.");
        }

        return storeFile(image, "contenus");
    }

    private String storeFile(MultipartFile file, String folder) {
        try {
            String originalName = file.getOriginalFilename();
            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String safeFileName = UUID.randomUUID() + extension;

            Path targetDir = Paths.get(uploadDir, folder);
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(safeFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + folder + "/" + safeFileName;

        } catch (IOException e) {
            throw new RuntimeException("Impossible d'enregistrer le fichier", e);
        }
    }
}