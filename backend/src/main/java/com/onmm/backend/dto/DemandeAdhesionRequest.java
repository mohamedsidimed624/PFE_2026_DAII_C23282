package com.onmm.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DemandeAdhesionRequest {

    private String NNI;
    private String nom;
    private String prenom;
    private String sexe;
    private String nationalite;
    private LocalDate dateNaissance;
    private String email;
    private String telephone;
    private String adresse;

}
