package com.onmm.backend.dto.Admin.specialite;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SousSpecialiteRequest {

    @NotBlank(message = "Le code est obligatoire")
    private String code;

    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    private String description;
    private Integer ordreAffichage;
    private Boolean active;

    @NotNull(message = "La spécialité parente est obligatoire")
    private Long specialiteId;

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

    public Long getSpecialiteId() { return specialiteId; }
    public void setSpecialiteId(Long specialiteId) { this.specialiteId = specialiteId; }
}