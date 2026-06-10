package com.onmm.backend.service;

import com.onmm.backend.exception.BusinessException;
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

    // ── Images (contenu/annonces, photos profil) ──────────────────────────────
    private static final long MAX_IMAGE_SIZE = 3 * 1024 * 1024;  // 3 MB

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    // ── Documents (réclamations, candidatures, dossiers) ──────────────────────
    private static final long MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;  // 10 MB

    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // ── Extensions dangereuses — bloquées indépendamment du MIME type ─────────
    private static final Set<String> DANGEROUS_EXTENSIONS = Set.of(
            ".php", ".phtml", ".php3", ".php4", ".php5", ".phar",
            ".exe", ".bat", ".cmd", ".com",
            ".sh", ".bash", ".zsh",
            ".jsp", ".jspx",
            ".asp", ".aspx",
            ".vbs", ".vbe",
            ".py", ".pl", ".rb",
            ".htaccess", ".htpasswd"
    );

    // ── Méthodes publiques ────────────────────────────────────────────────────

    public String storeReclamationFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (file.getSize() > MAX_DOCUMENT_SIZE) {
            throw new BusinessException("La pièce jointe ne doit pas dépasser 10 Mo.");
        }
        if (!ALLOWED_DOCUMENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("Format non autorisé. Utilisez PDF, JPG, PNG ou WEBP.");
        }
        return storeFile(file, "reclamations");
    }

    public String storeContenuImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BusinessException("L'image de couverture est obligatoire.");
        }
        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new BusinessException("L'image ne doit pas dépasser 3 Mo.");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(image.getContentType())) {
            throw new BusinessException("Format non autorisé. Utilisez JPG, PNG ou WEBP.");
        }
        return storeFile(image, "contenus");
    }

    public String storeCandidatureFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Le fichier est vide");
        }
        if (file.getSize() > MAX_DOCUMENT_SIZE) {
            throw new BusinessException("Le document ne doit pas dépasser 10 Mo.");
        }
        if (!ALLOWED_DOCUMENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("Format non autorisé. Utilisez PDF, JPG, PNG, WEBP, DOC ou DOCX.");
        }
        return storeFile(file, "candidatures");
    }

    // ── Méthode privée ────────────────────────────────────────────────────────

    private String storeFile(MultipartFile file, String folder) {
        try {
            String originalName = file.getOriginalFilename();
            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            }

            // Bloquer les extensions dangereuses (défense en profondeur)
            if (!extension.isEmpty() && DANGEROUS_EXTENSIONS.contains(extension)) {
                throw new BusinessException("Extension de fichier non autorisée.");
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
