package com.onmm.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Service
public class VoteEncryptionService {

    @Value("${vote.encryption-key}")
    private String keyBase64;

    @PostConstruct
    void validate() {
        try {
            byte[] k = Base64.getDecoder().decode(keyBase64);
            if (k.length != 32) {
                throw new IllegalStateException(
                    "[SECURITY] vote.encryption-key must be exactly 32 bytes (256 bits). " +
                    "Generate one with: openssl rand -base64 32");
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("[SECURITY] vote.encryption-key is not valid Base64.", e);
        }
    }

    public String encrypt(Long candidatureId) {
        byte[] iv = new byte[12];
        new SecureRandom().nextBytes(iv);
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, getKey(), new GCMParameterSpec(128, iv));
            byte[] encrypted = cipher.doFinal(candidatureId.toString().getBytes(StandardCharsets.UTF_8));
            byte[] out = new byte[12 + encrypted.length];
            System.arraycopy(iv, 0, out, 0, 12);
            System.arraycopy(encrypted, 0, out, 12, encrypted.length);
            return Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new RuntimeException("Vote encryption failed", e);
        }
    }

    public Long decrypt(String stored) {
        try {
            byte[] raw = Base64.getDecoder().decode(stored);
            byte[] iv  = Arrays.copyOfRange(raw, 0, 12);
            byte[] enc = Arrays.copyOfRange(raw, 12, raw.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, getKey(), new GCMParameterSpec(128, iv));
            return Long.parseLong(new String(cipher.doFinal(enc), StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Vote decryption failed", e);
        }
    }

    private SecretKey getKey() {
        return new SecretKeySpec(Base64.getDecoder().decode(keyBase64), "AES");
    }
}
