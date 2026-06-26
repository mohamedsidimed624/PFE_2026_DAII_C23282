package com.onmm.backend.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.Nullable;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

/**
 * Client S3 configuré pour un stockage objet compatible API S3 (Cloudflare R2,
 * Backblaze B2, etc.). Les checksums S3 spécifiques AWS sont désactivés explicitement
 * pour éviter des erreurs de validation côté SDK avec ces fournisseurs.
 *
 * <p>Ce bean n'est créé que si {@code r2.endpoint} est renseigné (non vide) — sans cela,
 * {@code ObjectStorageService} bascule automatiquement sur le disque local
 * (utile en développement sans compte de stockage objet). Note : {@code @ConditionalOnProperty}
 * ne convient pas ici car la propriété existe toujours (valeur vide par défaut) ; le test
 * se fait donc explicitement dans le corps de la méthode.
 */
@Configuration
public class R2Config {

    @Bean
    @Nullable
    public S3Client s3Client(
            @Value("${r2.endpoint:}") String endpoint,
            @Value("${r2.access-key:}") String accessKey,
            @Value("${r2.secret-key:}") String secretKey,
            @Value("${r2.region:auto}") String region
    ) {
        if (endpoint == null || endpoint.isBlank()) {
            return null;
        }
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder()
                        .chunkedEncodingEnabled(false)
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
    }
}
