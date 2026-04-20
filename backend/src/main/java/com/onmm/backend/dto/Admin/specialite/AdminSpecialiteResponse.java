package com.onmm.backend.dto.Admin.specialite;

import lombok.Data;

@Data
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
}