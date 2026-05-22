package com.onmm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "positions_electorales",
       uniqueConstraints = @UniqueConstraint(columnNames = {"election_id", "libelle"}))
public class PositionElectorale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id", nullable = false)
    private Election election;

    @Column(nullable = false, length = 150)
    private String libelle;

    @Column(nullable = false)
    private int ordre = 0;

    @Column(nullable = false)
    private int nombreSieges = 1;

    @Column(nullable = false)
    private int maxVotesParElecteur = 1;

    @Column(nullable = false)
    private boolean actif = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Election getElection() { return election; }
    public void setElection(Election election) { this.election = election; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public int getOrdre() { return ordre; }
    public void setOrdre(int ordre) { this.ordre = ordre; }

    public int getNombreSieges() { return nombreSieges; }
    public void setNombreSieges(int nombreSieges) { this.nombreSieges = nombreSieges; }

    public int getMaxVotesParElecteur() { return maxVotesParElecteur; }
    public void setMaxVotesParElecteur(int maxVotesParElecteur) { this.maxVotesParElecteur = maxVotesParElecteur; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}
