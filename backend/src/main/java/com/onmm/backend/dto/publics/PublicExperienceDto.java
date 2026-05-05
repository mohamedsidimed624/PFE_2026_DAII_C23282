package com.onmm.backend.dto.publics;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PublicExperienceDto {
    private String poste;
    private String nomEtablissement;
    private String ville;
    private String pays;
    private String dateDebut;
    private String dateFin;
}