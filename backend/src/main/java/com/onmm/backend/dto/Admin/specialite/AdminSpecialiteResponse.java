package com.onmm.backend.dto.Admin.specialite;

public class AdminSpecialiteResponse {

    private Long id;
    private String code;
    private String libelle;
    private String description;
    private Integer ordreAffichage;
    private Boolean active;

    private Long nombreSousSpecialites;
    private Long nombreMedecins;
    private Long nombreDemandes;

    private Boolean canDelete;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getOrdreAffichage() { return ordreAffichage; }
    public void setOrdreAffichage(Integer ordreAffichage) { this.ordreAffichage = ordreAffichage; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Long getNombreSousSpecialites() { return nombreSousSpecialites; }
    public void setNombreSousSpecialites(Long nombreSousSpecialites) { this.nombreSousSpecialites = nombreSousSpecialites; }

    public Long getNombreMedecins() { return nombreMedecins; }
    public void setNombreMedecins(Long nombreMedecins) { this.nombreMedecins = nombreMedecins; }

    public Long getNombreDemandes() { return nombreDemandes; }
    public void setNombreDemandes(Long nombreDemandes) { this.nombreDemandes = nombreDemandes; }

    public Boolean getCanDelete() { return canDelete; }
    public void setCanDelete(Boolean canDelete) { this.canDelete = canDelete; }
}