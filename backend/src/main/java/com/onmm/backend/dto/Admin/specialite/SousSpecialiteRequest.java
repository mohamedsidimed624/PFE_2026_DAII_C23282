package com.onmm.backend.dto.Admin.specialite;

import lombok.Data;

@Data
public class SousSpecialiteRequest {

    private String code;
    private String libelle;
    private String description;
    private Integer ordreAffichage;
    private Boolean active;
    private Long specialiteId;
}