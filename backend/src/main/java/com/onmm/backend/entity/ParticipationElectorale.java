package com.onmm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participations_electorales",
       uniqueConstraints = @UniqueConstraint(columnNames = {"election_id", "votant_hash"}))
public class ParticipationElectorale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @Column(name = "votant_hash", nullable = false, length = 64)
    private String votantHash;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateParticipation = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Election getElection() { return election; }
    public void setElection(Election election) { this.election = election; }

    public String getVotantHash() { return votantHash; }
    public void setVotantHash(String votantHash) { this.votantHash = votantHash; }

    public LocalDateTime getDateParticipation() { return dateParticipation; }
    public void setDateParticipation(LocalDateTime dateParticipation) { this.dateParticipation = dateParticipation; }
}
