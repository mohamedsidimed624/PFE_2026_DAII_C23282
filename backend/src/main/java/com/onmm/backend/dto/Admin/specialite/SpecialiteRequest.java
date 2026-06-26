package com.onmm.backend.dto.Admin.specialite;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SpecialiteRequest {

    @NotBlank(message = "Le code est obligatoire")
    private String code;

    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    private String description;
    private Integer ordreAffichage;
    private Boolean active;
}