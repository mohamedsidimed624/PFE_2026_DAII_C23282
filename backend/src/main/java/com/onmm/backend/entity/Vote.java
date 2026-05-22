package com.onmm.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "votes_election",
       uniqueConstraints = @UniqueConstraint(columnNames = {"election_id", "votant_hash", "candidature_id"}))
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidature_id", nullable = false)
    private Candidature candidature;

    // SHA-256 hash — allows duplicate detection without storing voter identity
    @Column(name = "votant_hash", nullable = false, length = 64)
    private String votantHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateVote = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Election getElection() { return election; }
    public void setElection(Election election) { this.election = election; }

    public Candidature getCandidature() { return candidature; }
    public void setCandidature(Candidature candidature) { this.candidature = candidature; }

    public String getVotantHash() { return votantHash; }
    public void setVotantHash(String votantHash) { this.votantHash = votantHash; }

    public LocalDateTime getDateVote() { return dateVote; }
    public void setDateVote(LocalDateTime dateVote) { this.dateVote = dateVote; }
}
