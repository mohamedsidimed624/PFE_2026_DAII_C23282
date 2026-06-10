package com.onmm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "votes_election",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_vote_election_position_voter",
        columnNames = {"election_id", "position_id", "voter_key_hash"}
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

    // Nullable — le choix est désormais stocké dans encrypted_choice (AES-256-GCM)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidature_id", nullable = true)
    private Candidature candidature;

    // Choix chiffré (AES-256-GCM) — remplace candidature_id en clair
    @Column(name = "encrypted_choice", columnDefinition = "TEXT")
    private String encryptedChoice;

    @Column(name = "voter_key_hash", nullable = false, length = 128)
    private String voterKeyHash;

    @Column(name = "vote_hash", nullable = false, length = 128)
    private String voteHash;

    // Hash du bulletin précédent — permet de former une chaîne et détecter les suppressions
    @Column(name = "prev_hash", length = 128)
    private String prevHash;

    // Numéro de séquence dans l'élection — ordonne la chaîne
    @Column(name = "sequence_num")
    private Long sequenceNum;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateVote;

    @PrePersist
    protected void onCreate() {
        this.dateVote = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Election getElection() { return election; }
    public void setElection(Election election) { this.election = election; }

    public PositionElectorale getPositionElectorale() { return positionElectorale; }
    public void setPositionElectorale(PositionElectorale positionElectorale) { this.positionElectorale = positionElectorale; }

    public Candidature getCandidature() { return candidature; }
    public void setCandidature(Candidature candidature) { this.candidature = candidature; }

    public String getEncryptedChoice() { return encryptedChoice; }
    public void setEncryptedChoice(String encryptedChoice) { this.encryptedChoice = encryptedChoice; }

    public String getVoterKeyHash() { return voterKeyHash; }
    public void setVoterKeyHash(String voterKeyHash) { this.voterKeyHash = voterKeyHash; }

    public String getVoteHash() { return voteHash; }
    public void setVoteHash(String voteHash) { this.voteHash = voteHash; }

    public String getPrevHash() { return prevHash; }
    public void setPrevHash(String prevHash) { this.prevHash = prevHash; }

    public Long getSequenceNum() { return sequenceNum; }
    public void setSequenceNum(Long sequenceNum) { this.sequenceNum = sequenceNum; }

    public LocalDateTime getDateVote() { return dateVote; }
    public void setDateVote(LocalDateTime dateVote) { this.dateVote = dateVote; }
}
