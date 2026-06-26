package com.onmm.backend.dto.Admin.specialite;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
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
}