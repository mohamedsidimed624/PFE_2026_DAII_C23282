package com.onmm.backend.dto.publics;

import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;
import lombok.Data;

@Data
public class PublicEducationDto {
    private String diplome;
    private Long specialiteId;
    private Long sousSpecialiteId;
    private String specialiteLibelle;
    private String sousSpecialiteLibelle;
    private String universite;
    private String pays;
    private String ville;
    private Integer anneeObtention;

}
