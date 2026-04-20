package com.onmm.backend.dto.medecin;

import lombok.Data;

@Data
public class UpdateMedecinProfileRequest {

    private String nom;
    private String prenom;
    private String telephone;
    private String nationalite;
    private String adresse;

}