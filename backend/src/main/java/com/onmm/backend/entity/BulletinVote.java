package com.onmm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "bulletins_vote",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_bulletin_participation_candidature",
                        columnNames = {"participation_id", "candidature_id"}
                )
        }
)
public class BulletinVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Une participation représente un électeur anonyme dans une élection.
     * Le bulletin appartient à cette participation.
     * Cela permet :
     * - d'éviter les incohérences,
     * - de compter correctement les bulletins,
     * - de garder l'anonymat car on ne stocke pas le médecin ici.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participation_id", nullable = false)
    private ParticipationElectorale participation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidature_id", nullable = false)
    private Candidature candidature;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private PositionElectorale positionElectorale;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateVote = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ParticipationElectorale getParticipation() {
        return participation;
    }

    public void setParticipation(ParticipationElectorale participation) {
        this.participation = participation;
    }

    public Election getElection() {
        return election;
    }

    public void setElection(Election election) {
        this.election = election;
    }

    public Candidature getCandidature() {
        return candidature;
    }

    public void setCandidature(Candidature candidature) {
        this.candidature = candidature;
    }

    public PositionElectorale getPositionElectorale() {
        return positionElectorale;
    }

    public void setPositionElectorale(PositionElectorale positionElectorale) {
        this.positionElectorale = positionElectorale;
    }

    public LocalDateTime getDateVote() {
        return dateVote;
    }

    public void setDateVote(LocalDateTime dateVote) {
        this.dateVote = dateVote;
    }
}