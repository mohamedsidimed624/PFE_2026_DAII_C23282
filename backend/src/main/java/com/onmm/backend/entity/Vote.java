package com.onmm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "votes_election",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_vote_election_position_voter",
        columnNames = {"election_id", "position_id", "voter_token"}
    )
)
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private PositionElectorale positionElectorale;

    // Choix chiffré : Base64(wrappedDEK) + "." + Base64(iv + ciphertext) — AES-256-GCM + RSA-2048-OAEP
    @Column(name = "encrypted_choice", nullable = false, columnDefinition = "TEXT")
    private String encryptedChoice;

    // Pseudonyme de l'électeur : HMAC-SHA256(masterSecret, electionId:medecinId)
    @Column(name = "voter_token", nullable = false, length = 64)
    private String voterToken;

    // Empreinte d'intégrité : SHA-256(electionId:voterToken:encryptedChoice:dateVote)
    @Column(name = "vote_hash", nullable = false, length = 64)
    private String voteHash;

    // Signature Ed25519 du serveur sur (encryptedChoice||voterToken||dateVote), calculée à la soumission
    @Column(name = "ballot_signature", nullable = false, columnDefinition = "TEXT")
    private String ballotSignature;

    // Horodatage — calculé une seule fois et réutilisé pour voteHash ET ballotSignature
    @Column(nullable = false, updatable = false)
    private LocalDateTime dateVote;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Election getElection() { return election; }
    public void setElection(Election election) { this.election = election; }

    public PositionElectorale getPositionElectorale() { return positionElectorale; }
    public void setPositionElectorale(PositionElectorale positionElectorale) { this.positionElectorale = positionElectorale; }

    public String getEncryptedChoice() { return encryptedChoice; }
    public void setEncryptedChoice(String encryptedChoice) { this.encryptedChoice = encryptedChoice; }

    public String getVoterToken() { return voterToken; }
    public void setVoterToken(String voterToken) { this.voterToken = voterToken; }

    public String getVoteHash() { return voteHash; }
    public void setVoteHash(String voteHash) { this.voteHash = voteHash; }

    public String getBallotSignature() { return ballotSignature; }
    public void setBallotSignature(String ballotSignature) { this.ballotSignature = ballotSignature; }

    public LocalDateTime getDateVote() { return dateVote; }
    public void setDateVote(LocalDateTime dateVote) { this.dateVote = dateVote; }
}
