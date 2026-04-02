package com.onmm.backend.dto.Admin;

public class AdminMedecinEducationResponse {

    private Long id;
    private String specialite;
    private String sousSpecialite;
    private String diplome;
    private Integer anneeObtention;
    private String pays;
    private String ville;
    private String universite;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getSousSpecialite() {
        return sousSpecialite;
    }

    public void setSousSpecialite(String sousSpecialite) {
        this.sousSpecialite = sousSpecialite;
    }

    public String getDiplome() {
        return diplome;
    }

    public void setDiplome(String diplome) {
        this.diplome = diplome;
    }

    public Integer getAnneeObtention() {
        return anneeObtention;
    }

    public void setAnneeObtention(Integer anneeObtention) {
        this.anneeObtention = anneeObtention;
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

    public String getUniversite() {
        return universite;
    }

    public void setUniversite(String universite) {
        this.universite = universite;
    }
}