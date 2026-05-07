package com.onmm.backend.dto.Admin;

import lombok.Data;

@Data
public class AdminProfileResponse {
    private Long id;
    private String nomComplet;
    private String email;
    private String telephone;
    private String photoProfilPath;
    private String dateCreation;
}
