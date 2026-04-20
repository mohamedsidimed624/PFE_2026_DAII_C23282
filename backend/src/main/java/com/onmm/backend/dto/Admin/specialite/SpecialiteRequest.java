package com.onmm.backend.dto.Admin.specialite;

import lombok.Data;

@Data
public class SpecialiteRequest {

    private String code;
    private String libelle;
    private String description;
    private Integer ordreAffichage;
    private Boolean active;
}