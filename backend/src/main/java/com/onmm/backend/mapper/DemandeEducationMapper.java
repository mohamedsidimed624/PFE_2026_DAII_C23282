package com.onmm.backend.mapper;

import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.entity.DemandeEducation;

public class DemandeEducationMapper {

    private DemandeEducationMapper() {
    }

    public static DemandeEducationResponse toResponse(DemandeEducation education) {
        DemandeEducationResponse response = new DemandeEducationResponse();

        response.setId(education.getId());

        if (education.getSpecialite() != null) {
            response.setSpecialiteId(education.getSpecialite().getId());
            response.setSpecialiteLibelle(education.getSpecialite().getLibelle());
        }

        if (education.getSousSpecialite() != null) {
            response.setSousSpecialiteId(education.getSousSpecialite().getId());
            response.setSousSpecialiteLibelle(education.getSousSpecialite().getLibelle());
        }

        response.setDiplome(education.getDiplome());
        response.setAnneeObtention(education.getAnneeObtention());
        response.setPays(education.getPays());
        response.setVille(education.getVille());
        response.setUniversite(education.getUniversite());

        return response;
    }
}