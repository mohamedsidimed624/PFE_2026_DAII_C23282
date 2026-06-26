package com.onmm.backend.service.election.crypto;

import com.onmm.backend.entity.Vote;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

/**
 * Empreinte d'intégrité du bulletin de vote — seul usage du hachage cryptographique
 * dans le module Élections.
 *
 * <p>{@code voteHash = SHA-256(electionId : voterToken : encryptedChoice : timestamp)}.
 * Le choix de vote n'apparaît jamais en clair dans cette empreinte (contrairement à
 * l'ancienne implémentation) : seul le contenu déjà chiffré ({@code encryptedChoice}) y entre,
 * ce qui permet à quiconque de vérifier qu'un bulletin n'a pas été modifié en base, sans
 * jamais avoir besoin d'une clé secrète ni de révéler le vote.
 */
@Service
public class HashingService {

    public String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new RuntimeException("SHA-256 unavailable", ex);
        }
    }

    public String buildVoteHash(Long electionId, String voterToken, String encryptedChoice, LocalDateTime timestamp) {
        String raw = electionId + ":" + voterToken + ":" + encryptedChoice + ":" + timestamp;
        return sha256Hex(raw);
    }

    /** Recalcule le hash d'un bulletin déjà stocké et le compare à celui enregistré. */
    public boolean verifyVoteHash(Vote vote, Long electionId) {
        String recomputed = buildVoteHash(electionId, vote.getVoterToken(), vote.getEncryptedChoice(), vote.getDateVote());
        return recomputed.equals(vote.getVoteHash());
    }
}
