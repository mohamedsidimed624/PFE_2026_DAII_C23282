package com.onmm.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DemandeExperienceResponse {

    private Long id;

    private String poste;

    private String nomEtablissement;

    private String pays;

    private String ville;

    private LocalDate dateDebut;

    private LocalDate dateFin;

    private String description;
}
