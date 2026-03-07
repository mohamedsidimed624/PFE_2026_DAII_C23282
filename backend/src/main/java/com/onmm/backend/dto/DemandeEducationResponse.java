package com.onmm.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DemandeEducationResponse {

    private Long id;
    private String specialite;
    private String sousSpecialite;
    private String diplome;
    private Integer anneeObtention;
    private String pays;
    private String ville;
    private String universite;

}
