package com.onmm.backend.mapper;

import com.onmm.backend.dto.reference.ReferenceSousSpecialiteResponse;
import com.onmm.backend.dto.reference.ReferenceSpecialiteResponse;
import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;

public class ReferenceMapper {

    private ReferenceMapper() {
    }

    public static ReferenceSpecialiteResponse toSpecialiteResponse(Specialite specialite) {
        ReferenceSpecialiteResponse response = new ReferenceSpecialiteResponse();
        response.setId(specialite.getId());
        response.setCode(specialite.getCode());
        response.setLibelle(specialite.getLibelle());
        return response;
    }

    public static ReferenceSousSpecialiteResponse toSousSpecialiteResponse(SousSpecialite sousSpecialite) {
        ReferenceSousSpecialiteResponse response = new ReferenceSousSpecialiteResponse();
        response.setId(sousSpecialite.getId());
        response.setCode(sousSpecialite.getCode());
        response.setLibelle(sousSpecialite.getLibelle());

        if (sousSpecialite.getSpecialite() != null) {
            response.setSpecialiteId(sousSpecialite.getSpecialite().getId());
        }

        return response;
    }
}