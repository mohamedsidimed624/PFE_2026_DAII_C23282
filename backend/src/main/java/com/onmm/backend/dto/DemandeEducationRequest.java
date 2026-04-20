package com.onmm.backend.dto;

import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;
import lombok.Data;

@Data
public class DemandeEducationRequest {

    private Long id;
    private Long specialiteId;
    private Long sousSpecialiteId;
    private String diplome;
    private Integer anneeObtention;
    private String pays;
    private String ville;
    private String universite;


}
