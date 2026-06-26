package com.onmm.backend.service.storage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Accès au stockage des fichiers uploadés (photos, documents, images), servis via
 * {@code FileController} (GET /api/files/**) — jamais d'URL directe exposée.
 *
 * <p>Bascule automatiquement entre deux backends selon la configuration :
 * <ul>
 *   <li>{@code r2.endpoint} renseigné → stockage objet compatible S3 (Backblaze B2,
 *       Cloudflare R2, etc.), nécessaire en production (disque éphémère sur Render).</li>
 *   <li>{@code r2.endpoint} absent → disque local ({@code storage.local-dir}), pratique
 *       en développement sans compte de stockage objet.</li>
 * </ul>
 */
@Service
public class ObjectStorageService {

    @Nullable
    private final S3Client s3Client;

    private final String uploadsBucket;
    private final Path localDir;

    @Autowired(required = false)
    public ObjectStorageService(
            @Nullable S3Client s3Client,
            @Value("${r2.uploads-bucket:}") String uploadsBucket,
            @Value("${storage.local-dir:uploads}") String localDir
    ) {
        this.s3Client = s3Client;
        this.uploadsBucket = uploadsBucket;
        this.localDir = Paths.get(localDir);
    }

    /** Dépose un fichier et retourne le chemin relatif servi par FileController. */
    public String upload(String key, byte[] data, String contentType) {
        if (s3Client != null) {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(uploadsBucket)
                            .key(key)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromBytes(data)
            );
        } else {
            writeLocal(key, data);
        }
        return "/api/files/" + key;
    }

    /** Lit un fichier (utilisé par FileController pour le servir). */
    public byte[] download(String key) {
        if (s3Client != null) {
            try {
                return s3Client.getObject(
                        GetObjectRequest.builder()
                                .bucket(uploadsBucket)
                                .key(key)
                                .build()
                ).readAllBytes();
            } catch (NoSuchKeyException ex) {
                throw new IllegalStateException("Fichier introuvable : " + key, ex);
            } catch (IOException ex) {
                throw new RuntimeException("Impossible de lire le fichier : " + key, ex);
            }
        }
        return readLocal(key);
    }

    private void writeLocal(String key, byte[] data) {
        try {
            Path target = localDir.resolve(key);
            Files.createDirectories(target.getParent());
            Files.write(target, data);
        } catch (IOException ex) {
            throw new RuntimeException("Impossible d'enregistrer le fichier localement : " + key, ex);
        }
    }

    private byte[] readLocal(String key) {
        Path target = localDir.resolve(key);
        if (!Files.exists(target)) {
            throw new IllegalStateException("Fichier introuvable : " + key);
        }
        try {
            return Files.readAllBytes(target);
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de lire le fichier local : " + key, ex);
        }
    }
}
