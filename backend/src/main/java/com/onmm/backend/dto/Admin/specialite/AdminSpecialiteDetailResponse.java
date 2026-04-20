package com.onmm.backend.dto.Admin.specialite;

import lombok.Data;

import java.util.List;

@Data
public class AdminSpecialiteDetailResponse {

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

    private List<AdminSousSpecialiteResponse> sousSpecialites;
}