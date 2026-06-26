package com.onmm.backend.controller.publics;

import com.onmm.backend.service.storage.ObjectStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sert les fichiers uploadés (photos, documents, images de contenu) depuis le bucket
 * objet privé "uploads" — évite de dépendre d'un accès public au niveau du bucket
 * (certains fournisseurs S3-compatibles facturent cette option).
 */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final ObjectStorageService objectStorageService;

    public FileController(ObjectStorageService objectStorageService) {
        this.objectStorageService = objectStorageService;
    }

    @GetMapping("/{*path}")
    public ResponseEntity<byte[]> getFile(@PathVariable String path) {
        String key = path.startsWith("/") ? path.substring(1) : path;
        byte[] data = objectStorageService.download(key);
        MediaType contentType = MediaTypeFactory.getMediaType(key).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(contentType).body(data);
    }
}
