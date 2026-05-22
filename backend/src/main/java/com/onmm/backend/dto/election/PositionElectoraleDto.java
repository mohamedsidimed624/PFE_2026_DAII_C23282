package com.onmm.backend.dto.election;

public class PositionElectoraleDto {
    private Long id;
    private Long electionId;
    private String libelle;
    private int ordre;
    private int nombreSieges;
    private int maxVotesParElecteur;
    private boolean actif;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }

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
