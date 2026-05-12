package com.onmm.backend.dto.medecin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddMedecinEducationRequest {
    private Long specialiteId;
    private Long sousSpecialiteId;
    private String diplome;
    private Integer anneeObtention;
    private String pays;
    private String ville;
    private String universite;
}
