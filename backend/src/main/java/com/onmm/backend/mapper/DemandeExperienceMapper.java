package com.onmm.backend.mapper;

import com.onmm.backend.dto.DemandeExperienceRequest;
import com.onmm.backend.dto.DemandeExperienceResponse;
import com.onmm.backend.entity.DemandeExperience;

public class DemandeExperienceMapper {

    public static DemandeExperience toEntity(DemandeExperienceRequest request) {

        DemandeExperience exp = new DemandeExperience();

        exp.setPoste(request.getPoste());
        exp.setNomEtablissement(request.getNomEtablissement());
        exp.setPays(request.getPays());
        exp.setVille(request.getVille());
        exp.setDateDebut(request.getDateDebut());
        exp.setDateFin(request.getDateFin());
        exp.setDescription(request.getDescription());

        return exp;
    }

    public static DemandeExperienceResponse toResponse(DemandeExperience exp) {

        DemandeExperienceResponse response = new DemandeExperienceResponse();

        response.setId(exp.getId());
        response.setPoste(exp.getPoste());
        response.setNomEtablissement(exp.getNomEtablissement());
        response.setPays(exp.getPays());
        response.setVille(exp.getVille());
        response.setDateDebut(exp.getDateDebut());
        response.setDateFin(exp.getDateFin());
        response.setDescription(exp.getDescription());

        return response;
    }
}
