package com.onmm.backend.dto;

import lombok.Data;

@Data
public class DemandeEducationResponse {

    private Long id;
    private Long specialiteId;
    private String specialiteLibelle;
    private Long sousSpecialiteId;
    private String sousSpecialiteLibelle;
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

    public Long getSpecialiteId() {
        return specialiteId;
    }

    public void setSpecialiteId(Long specialiteId) {
        this.specialiteId = specialiteId;
    }

    public String getSpecialiteLibelle() {
        return specialiteLibelle;
    }

    public void setSpecialiteLibelle(String specialiteLibelle) {
        this.specialiteLibelle = specialiteLibelle;
    }

    public Long getSousSpecialiteId() {
        return sousSpecialiteId;
    }

    public void setSousSpecialiteId(Long sousSpecialiteId) {
        this.sousSpecialiteId = sousSpecialiteId;
    }

    public String getSousSpecialiteLibelle() {
        return sousSpecialiteLibelle;
    }

    public void setSousSpecialiteLibelle(String sousSpecialiteLibelle) {
        this.sousSpecialiteLibelle = sousSpecialiteLibelle;
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

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getUniversite() {
        return universite;
    }

    public void setUniversite(String universite) {
        this.universite = universite;
    }
}