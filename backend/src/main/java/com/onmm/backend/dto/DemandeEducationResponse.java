package com.onmm.backend.dto;

import lombok.Data;

@Data
public class DemandeEducationResponse {

    private Long id;
    private Long specialiteId;
    private String specialiteLibelle;
    private Long sousSpecialiteId;
    private String sousSpecialiteLibelle;
    private String diplome;
    private Integer anneeObtention;
    private String pays;
    private String ville;
    private String universite;

}