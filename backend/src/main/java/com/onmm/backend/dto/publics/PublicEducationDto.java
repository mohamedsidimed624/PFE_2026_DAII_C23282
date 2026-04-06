package com.onmm.backend.dto.publics;

public class PublicEducationDto {
    private String diplome;
    private String specialite;
    private String sousSpecialite;
    private String universite;
    private String pays;
    private String ville;
    private Integer anneeObtention;

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getDiplome() {
        return diplome;
    }

    public void setDiplome(String diplome) {
        this.diplome = diplome;
    }

    public String getSousSpecialite() {
        return sousSpecialite;
    }

    public void setSousSpecialite(String sousSpecialite) {
        this.sousSpecialite = sousSpecialite;
    }

    public String getUniversite() {
        return universite;
    }

    public void setUniversite(String universite) {
        this.universite = universite;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public int getAnneeObtention() {
        return anneeObtention;
    }

    public void setAnneeObtention(int anneeObtention) {
        this.anneeObtention = anneeObtention;
    }
}
