package com.onmm.backend.mapper;

import com.onmm.backend.dto.DemandeEducationRequest;
import com.onmm.backend.dto.DemandeEducationResponse;
import com.onmm.backend.entity.DemandeEducation;

public class DemandeEducationMapper {

    public static DemandeEducation toEntity(DemandeEducationRequest request) {

        DemandeEducation education = new DemandeEducation();

        education.setSpecialite(request.getSpecialite());
        education.setSousSpecialite(request.getSousSpecialite());
        education.setDiplome(request.getDiplome());
        education.setAnneeObtention(request.getAnneeObtention());
        education.setPays(request.getPays());
        education.setVille(request.getVille());
        education.setUniversite(request.getUniversite());

        return education;
    }

    public static DemandeEducationResponse toResponse(DemandeEducation education) {

        DemandeEducationResponse response = new DemandeEducationResponse();

        response.setId(education.getId());
        response.setSpecialite(education.getSpecialite());
        response.setSousSpecialite(education.getSousSpecialite());
        response.setDiplome(education.getDiplome());
        response.setAnneeObtention(education.getAnneeObtention());
        response.setPays(education.getPays());
        response.setVille(education.getVille());
        response.setUniversite(education.getUniversite());

        return response;
    }
}