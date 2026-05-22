package com.onmm.backend.dto.election;

public class PositionElectoraleRequest {
    private String libelle;
    private int ordre;
    private int nombreSieges = 1;
    private int maxVotesParElecteur = 1;

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public int getOrdre() { return ordre; }
    public void setOrdre(int ordre) { this.ordre = ordre; }

    public int getNombreSieges() { return nombreSieges; }
    public void setNombreSieges(int nombreSieges) { this.nombreSieges = nombreSieges; }

    public int getMaxVotesParElecteur() { return maxVotesParElecteur; }
    public void setMaxVotesParElecteur(int maxVotesParElecteur) { this.maxVotesParElecteur = maxVotesParElecteur; }
}
