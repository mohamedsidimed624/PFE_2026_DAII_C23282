package com.onmm.backend.service.election.crypto;

import com.onmm.backend.entity.Vote;
import com.onmm.backend.service.election.key.KeyManagementService;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;

/**
 * Signature Ed25519 du serveur sur chaque bulletin, calculée à la soumission du vote.
 *
 * <p>Preuve d'authenticité de l'origine : un bulletin signé prouve qu'il a été produit
 * par l'API légitime de vote — un attaquant qui insérerait une ligne directement en base
 * de données ne pourrait pas produire de signature valide sans la clé privée du serveur.
 * C'est une garantie différente de celle de {@link HashingService} : le hash détecte une
 * modification après coup, la signature prouve l'origine dès le départ.
 *
 * <p>Une seule paire Ed25519 au niveau du serveur (pas par élection) : la question à
 * laquelle répond la signature ("est-ce mon backend légitime qui a traité cette requête ?")
 * ne dépend jamais de l'élection.
 */
@Service
public class SignatureService {

    private final KeyManagementService keyManagementService;

    public SignatureService(KeyManagementService keyManagementService) {
        this.keyManagementService = keyManagementService;
    }

    public String signBallot(String encryptedChoice, String voterToken, LocalDateTime timestamp) {
        byte[] message = buildMessage(encryptedChoice, voterToken, timestamp);

        PrivateKey serverPrivate = keyManagementService.getServerPrivateKey();
        byte[] privKeyBytes = serverPrivate.getEncoded();
        // PKCS8 Ed25519 : les 32 derniers octets sont la clé scalaire brute
        byte[] rawPriv = Arrays.copyOfRange(privKeyBytes, privKeyBytes.length - 32, privKeyBytes.length);
        Ed25519PrivateKeyParameters privParams = new Ed25519PrivateKeyParameters(rawPriv, 0);

        Ed25519Signer signer = new Ed25519Signer();
        signer.init(true, privParams);
        signer.update(message, 0, message.length);
        return Base64.getEncoder().encodeToString(signer.generateSignature());
    }

    public boolean verifyBallotSignature(Vote vote) {
        if (vote.getBallotSignature() == null) return false;
        try {
            byte[] message = buildMessage(vote.getEncryptedChoice(), vote.getVoterToken(), vote.getDateVote());
            PublicKey serverPublic = keyManagementService.getServerPublicKey();

            Signature verifier = Signature.getInstance("Ed25519", "BC");
            verifier.initVerify(serverPublic);
            verifier.update(message);
            return verifier.verify(Base64.getDecoder().decode(vote.getBallotSignature()));
        } catch (Exception ex) {
            return false;
        }
    }

    private byte[] buildMessage(String encryptedChoice, String voterToken, LocalDateTime timestamp) {
        String raw = encryptedChoice + "||" + voterToken + "||" + timestamp;
        return raw.getBytes(StandardCharsets.UTF_8);
    }
}
