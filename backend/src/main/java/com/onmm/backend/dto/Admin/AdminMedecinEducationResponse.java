package com.onmm.backend.dto.Admin;

import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;
import lombok.Data;

@Data
public class AdminMedecinEducationResponse {

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