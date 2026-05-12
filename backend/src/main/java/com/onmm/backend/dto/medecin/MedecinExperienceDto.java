package com.onmm.backend.dto.medecin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedecinExperienceDto {
    private Long id;
    private String poste;
    private String nomEtablissement;
    private String pays;
    private String ville;
    private String dateDebut;
    private String dateFin;
    private String description;
}
