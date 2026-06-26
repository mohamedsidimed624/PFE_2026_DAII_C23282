package com.onmm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "election_key_pairs")
public class ElectionKeyPair {

    @Id
    @Column(name = "election_id")
    private Long electionId;

    // Clé publique RSA-2048 au format X.509/DER encodé Base64
    @Column(name = "public_key_b64", nullable = false, columnDefinition = "TEXT")
    private String publicKeyB64;

    // Clé privée RSA-2048 (PKCS8/DER) chiffrée AES-256-GCM, format Base64(iv || ciphertext)
    @Column(name = "private_key_encrypted_b64", nullable = false, columnDefinition = "TEXT")
    private String privateKeyEncryptedB64;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }

    public String getPublicKeyB64() { return publicKeyB64; }
    public void setPublicKeyB64(String publicKeyB64) { this.publicKeyB64 = publicKeyB64; }

    public String getPrivateKeyEncryptedB64() { return privateKeyEncryptedB64; }
    public void setPrivateKeyEncryptedB64(String privateKeyEncryptedB64) { this.privateKeyEncryptedB64 = privateKeyEncryptedB64; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
