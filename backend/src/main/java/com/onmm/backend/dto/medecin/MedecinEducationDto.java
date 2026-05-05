package com.onmm.backend.dto.medecin;

import lombok.Data;

@Data
public class MedecinEducationDto {

    private Long id;

    private String diplome;

    private Long specialiteId;
    private String specialiteLibelle;

    private Long sousSpecialiteId;
    private String sousSpecialiteLibelle;

    private String universite;
    private String pays;
    private String ville;
    private Integer anneeObtention;
}