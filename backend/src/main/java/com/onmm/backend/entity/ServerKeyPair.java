package com.onmm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Paire de clés Ed25519 du serveur (singleton applicatif, id toujours 1L).
 * Sert exclusivement à signer les bulletins de vote à la soumission, pour attester
 * qu'ils ont été produits par l'API légitime — indépendant de toute élection.
 */
@Entity
@Table(name = "server_key_pair")
public class ServerKeyPair {

    @Id
    private Long id;

    // Clé publique Ed25519 au format X.509/DER encodé Base64
    @Column(name = "public_key_b64", nullable = false, columnDefinition = "TEXT")
    private String publicKeyB64;

    // Clé privée Ed25519 (PKCS8/DER) chiffrée AES-256-GCM, format Base64(iv || ciphertext)
    @Column(name = "private_key_encrypted_b64", nullable = false, columnDefinition = "TEXT")
    private String privateKeyEncryptedB64;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPublicKeyB64() { return publicKeyB64; }
    public void setPublicKeyB64(String publicKeyB64) { this.publicKeyB64 = publicKeyB64; }

    public String getPrivateKeyEncryptedB64() { return privateKeyEncryptedB64; }
    public void setPrivateKeyEncryptedB64(String privateKeyEncryptedB64) { this.privateKeyEncryptedB64 = privateKeyEncryptedB64; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
