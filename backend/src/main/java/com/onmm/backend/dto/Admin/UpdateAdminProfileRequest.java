package com.onmm.backend.dto.Admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAdminProfileRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(max = 200, message = "Le nom complet ne peut pas dépasser 200 caractères")
    private String nomComplet;

    private String telephone;
}
