package com.onmm.backend.service.election.crypto;

import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.service.election.key.KeyManagementService;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.MGF1ParameterSpec;
import java.util.Arrays;
import java.util.Base64;

/**
 * Chiffrement hybride AES-256-GCM + RSA-2048-OAEP du choix de vote.
 *
 * <p>Une clé symétrique aléatoire (DEK) est générée pour chaque bulletin et chiffre le
 * choix ; la DEK elle-même est enveloppée avec la clé publique RSA de l'élection. Seule la
 * clé privée RSA, inaccessible pendant le vote (statut VOTE_EN_COURS), permet de la
 * désenvelopper et de déchiffrer le bulletin, au moment du dépouillement.
 *
 * <p>Format stocké : {@code Base64(wrappedDEK) + "." + Base64(iv + ciphertext)}.
 */
@Service
public class BallotCryptoService {

    private static final int GCM_TAG_BITS = 128;
    private static final int GCM_IV_BYTES = 12;
    private static final int DEK_BYTES = 32;

    private final KeyManagementService keyManagementService;

    public BallotCryptoService(KeyManagementService keyManagementService) {
        this.keyManagementService = keyManagementService;
    }

    public String encryptChoice(Long candidatureId, Long electionId) {
        try {
            byte[] dek = new byte[DEK_BYTES];
            new SecureRandom().nextBytes(dek);

            byte[] iv = new byte[GCM_IV_BYTES];
            new SecureRandom().nextBytes(iv);

            Cipher aesCipher = Cipher.getInstance("AES/GCM/NoPadding");
            aesCipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(dek, "AES"),
                    new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] ciphertext = aesCipher.doFinal(
                    candidatureId.toString().getBytes(StandardCharsets.UTF_8));

            PublicKey rsaPublic = keyManagementService.getElectionPublicKey(electionId);
            Cipher rsaCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            rsaCipher.init(Cipher.WRAP_MODE, rsaPublic,
                    new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT));
            byte[] wrappedDek = rsaCipher.wrap(new SecretKeySpec(dek, "AES"));

            byte[] ivPlusCiphertext = new byte[GCM_IV_BYTES + ciphertext.length];
            System.arraycopy(iv, 0, ivPlusCiphertext, 0, GCM_IV_BYTES);
            System.arraycopy(ciphertext, 0, ivPlusCiphertext, GCM_IV_BYTES, ciphertext.length);

            return Base64.getEncoder().encodeToString(wrappedDek)
                    + "."
                    + Base64.getEncoder().encodeToString(ivPlusCiphertext);

        } catch (Exception ex) {
            throw new RuntimeException("[SECURITY] Chiffrement du bulletin échoué pour élection " + electionId, ex);
        }
    }

    /** Déchiffre un bulletin. Bloque si le statut de l'élection est VOTE_EN_COURS. */
    public Long decryptChoice(String encryptedChoice, Long electionId, ElectionStatut statut) {
        try {
            String[] parts = encryptedChoice.split("\\.", 2);
            if (parts.length != 2) {
                throw new IllegalArgumentException("Format encryptedChoice invalide (pas de '.')");
            }
            byte[] wrappedDek = Base64.getDecoder().decode(parts[0]);
            byte[] ivPlusCiphertext = Base64.getDecoder().decode(parts[1]);

            PrivateKey rsaPrivate = keyManagementService.getElectionPrivateKey(electionId, statut);
            Cipher rsaCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
            rsaCipher.init(Cipher.UNWRAP_MODE, rsaPrivate,
                    new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT));
            Key dek = rsaCipher.unwrap(wrappedDek, "AES", Cipher.SECRET_KEY);

            byte[] iv = Arrays.copyOfRange(ivPlusCiphertext, 0, GCM_IV_BYTES);
            byte[] ciphertext = Arrays.copyOfRange(ivPlusCiphertext, GCM_IV_BYTES, ivPlusCiphertext.length);
            Cipher aesCipher = Cipher.getInstance("AES/GCM/NoPadding");
            aesCipher.init(Cipher.DECRYPT_MODE, dek, new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] plaintext = aesCipher.doFinal(ciphertext);

            return Long.parseLong(new String(plaintext, StandardCharsets.UTF_8));

        } catch (Exception ex) {
            throw new RuntimeException(
                "[SECURITY] Déchiffrement bulletin échoué pour élection " + electionId, ex);
        }
    }
}
