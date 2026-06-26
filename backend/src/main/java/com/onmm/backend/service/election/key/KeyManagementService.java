package com.onmm.backend.service.election.key;

import com.onmm.backend.entity.ElectionKeyPair;
import com.onmm.backend.entity.ServerKeyPair;
import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.repository.ElectionKeyPairRepository;
import com.onmm.backend.repository.ServerKeyPairRepository;
import jakarta.annotation.PostConstruct;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;

/**
 * Génère et protège les clés cryptographiques du module Élections :
 * une paire RSA-2048 par élection (chiffrement des bulletins), et une paire Ed25519
 * unique au niveau serveur (signature des bulletins à la soumission).
 *
 * <p>Les clés privées sont chiffrées AES-256-GCM avec une clé dérivée par étiquette
 * (HMAC-SHA256) du secret applicatif unique {@code app.election.master-secret}, et stockées
 * directement en colonne dans la base de données — aucun stockage externe.
 */
@Service
public class KeyManagementService {

    private static final int GCM_TAG_BITS = 128;
    private static final int GCM_IV_BYTES = 12;
    private static final int RSA_KEY_BITS = 2048;
    private static final long SERVER_KEY_PAIR_ID = 1L;

    static {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    private final ElectionKeyPairRepository electionKeyPairRepo;
    private final ServerKeyPairRepository serverKeyPairRepo;

    @Value("${app.election.master-secret}")
    private String masterSecret;

    public KeyManagementService(ElectionKeyPairRepository electionKeyPairRepo,
                                 ServerKeyPairRepository serverKeyPairRepo) {
        this.electionKeyPairRepo = electionKeyPairRepo;
        this.serverKeyPairRepo = serverKeyPairRepo;
    }

    @PostConstruct
    private void validateAndBootstrap() {
        if (masterSecret == null || masterSecret.isBlank()) {
            throw new IllegalStateException(
                "[SECURITY] app.election.master-secret n'est pas configuré. " +
                "Définissez ELECTION_MASTER_SECRET dans l'environnement."
            );
        }
        ensureServerKeyPairExists();
    }

    // ── Paire RSA par élection ──────────────────────────────────────────────────

    /** Génère et stocke la paire RSA-2048 d'une élection. Appelée à l'ouverture du vote. */
    public void generateElectionKeyPair(Long electionId) {
        try {
            KeyPairGenerator rsaGen = KeyPairGenerator.getInstance("RSA");
            rsaGen.initialize(RSA_KEY_BITS, new SecureRandom());
            KeyPair rsaKP = rsaGen.generateKeyPair();

            byte[] encryptedPrivate = encryptWithLabel(rsaKP.getPrivate().getEncoded(), "election:" + electionId);

            ElectionKeyPair ekp = new ElectionKeyPair();
            ekp.setElectionId(electionId);
            ekp.setPublicKeyB64(Base64.getEncoder().encodeToString(rsaKP.getPublic().getEncoded()));
            ekp.setPrivateKeyEncryptedB64(Base64.getEncoder().encodeToString(encryptedPrivate));
            ekp.setCreatedAt(LocalDateTime.now());
            electionKeyPairRepo.save(ekp);
        } catch (Exception ex) {
            throw new RuntimeException("[SECURITY] Erreur génération paire RSA élection " + electionId, ex);
        }
    }

    public PublicKey getElectionPublicKey(Long electionId) {
        String b64 = findElectionKeyPair(electionId).getPublicKeyB64();
        try {
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return kf.generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(b64)));
        } catch (Exception ex) {
            throw new RuntimeException("[SECURITY] Impossible de charger la clé publique RSA élection " + electionId, ex);
        }
    }

    /** Clé privée RSA, accessible uniquement après clôture du vote (statut != VOTE_EN_COURS). */
    public PrivateKey getElectionPrivateKey(Long electionId, ElectionStatut statut) {
        if (statut == ElectionStatut.VOTE_EN_COURS) {
            throw new IllegalStateException(
                "[SECURITY] Déchiffrement interdit pendant VOTE_EN_COURS (élection " + electionId + "). " +
                "La clé privée n'est accessible qu'en phase DEPOUILLEMENT ou ultérieure."
            );
        }
        ElectionKeyPair ekp = findElectionKeyPair(electionId);
        try {
            byte[] der = decryptWithLabel(Base64.getDecoder().decode(ekp.getPrivateKeyEncryptedB64()), "election:" + electionId);
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (Exception ex) {
            throw new RuntimeException("[SECURITY] Impossible de reconstruire la clé privée RSA élection " + electionId, ex);
        }
    }

    private ElectionKeyPair findElectionKeyPair(Long electionId) {
        return electionKeyPairRepo.findById(electionId)
                .orElseThrow(() -> new IllegalStateException(
                    "Clé RSA non trouvée pour l'élection " + electionId + " — ouvrirVotes() a-t-il été appelé ?"));
    }

    // ── Paire Ed25519 du serveur (singleton) ────────────────────────────────────

    /** Génère la paire Ed25519 du serveur si elle n'existe pas encore. Idempotent. */
    public void ensureServerKeyPairExists() {
        if (serverKeyPairRepo.existsById(SERVER_KEY_PAIR_ID)) {
            return;
        }
        try {
            KeyPairGenerator edGen = KeyPairGenerator.getInstance("Ed25519", "BC");
            KeyPair edKP = edGen.generateKeyPair();

            byte[] encryptedPrivate = encryptWithLabel(edKP.getPrivate().getEncoded(), "server-signing-key");

            ServerKeyPair skp = new ServerKeyPair();
            skp.setId(SERVER_KEY_PAIR_ID);
            skp.setPublicKeyB64(Base64.getEncoder().encodeToString(edKP.getPublic().getEncoded()));
            skp.setPrivateKeyEncryptedB64(Base64.getEncoder().encodeToString(encryptedPrivate));
            skp.setCreatedAt(LocalDateTime.now());
            serverKeyPairRepo.save(skp);
        } catch (Exception ex) {
            throw new RuntimeException("[SECURITY] Erreur génération paire Ed25519 serveur", ex);
        }
    }

    public PublicKey getServerPublicKey() {
        String b64 = findServerKeyPair().getPublicKeyB64();
        try {
            KeyFactory kf = KeyFactory.getInstance("Ed25519", "BC");
            return kf.generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(b64)));
        } catch (Exception ex) {
            throw new RuntimeException("[SECURITY] Impossible de charger la clé publique Ed25519 serveur", ex);
        }
    }

    public PrivateKey getServerPrivateKey() {
        ServerKeyPair skp = findServerKeyPair();
        try {
            byte[] der = decryptWithLabel(Base64.getDecoder().decode(skp.getPrivateKeyEncryptedB64()), "server-signing-key");
            return KeyFactory.getInstance("Ed25519", "BC").generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (Exception ex) {
            throw new RuntimeException("[SECURITY] Impossible de reconstruire la clé privée Ed25519 serveur", ex);
        }
    }

    private ServerKeyPair findServerKeyPair() {
        return serverKeyPairRepo.findById(SERVER_KEY_PAIR_ID)
                .orElseThrow(() -> new IllegalStateException("Paire Ed25519 serveur introuvable — bootstrap manquant"));
    }

    // ── Chiffrement au repos des clés privées (AES-256-GCM, clé dérivée par étiquette) ──────

    private byte[] encryptWithLabel(byte[] plaintext, String label) throws Exception {
        SecretKeySpec aesKey = deriveKey(label);
        byte[] iv = new byte[GCM_IV_BYTES];
        new SecureRandom().nextBytes(iv);

        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, aesKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
        byte[] ciphertext = c.doFinal(plaintext);

        byte[] out = new byte[GCM_IV_BYTES + ciphertext.length];
        System.arraycopy(iv, 0, out, 0, GCM_IV_BYTES);
        System.arraycopy(ciphertext, 0, out, GCM_IV_BYTES, ciphertext.length);
        return out;
    }

    private byte[] decryptWithLabel(byte[] stored, String label) throws Exception {
        SecretKeySpec aesKey = deriveKey(label);
        byte[] iv = Arrays.copyOfRange(stored, 0, GCM_IV_BYTES);
        byte[] ciphertext = Arrays.copyOfRange(stored, GCM_IV_BYTES, stored.length);

        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.DECRYPT_MODE, aesKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
        return c.doFinal(ciphertext);
    }

    /** Dérive une clé AES-256 du secret racine, par étiquette : HMAC-SHA256(masterSecret, label). */
    private SecretKeySpec deriveKey(String label) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(masterSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] keyBytes = mac.doFinal(label.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(keyBytes, "AES");
    }
}
