package com.onmm.backend.dto.Admin.specialite;

import lombok.Data;

@Data
public class AdminSousSpecialiteResponse {

    private Long id;
    private String code;
    private String libelle;
    private String description;
    private Integer ordreAffichage;
    private Boolean active;

    private Long specialiteId;
    private String specialiteLibelle;

    private Long nombreMedecins;
    private Long nombreDemandes;

    private Boolean canDelete;
}