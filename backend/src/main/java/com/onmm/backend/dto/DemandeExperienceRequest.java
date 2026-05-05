package com.onmm.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DemandeExperienceRequest {

    private String poste;

    private String nomEtablissement;

    private String pays;

    private String ville;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin;

    private String description;
}
