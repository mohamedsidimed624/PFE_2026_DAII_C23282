package com.onmm.backend.mapper;

import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteDetailResponse;
import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteResponse;
import com.onmm.backend.entity.Specialite;

import java.util.List;

public class SpecialiteAdminMapper {

    private SpecialiteAdminMapper() {
    }

    public static AdminSpecialiteResponse toResponse(
            Specialite specialite,
            long nombreSousSpecialites,
            long nombreMedecins,
            long nombreDemandes,
            boolean canDelete
    ) {
        AdminSpecialiteResponse response = new AdminSpecialiteResponse();
        response.setId(specialite.getId());
        response.setCode(specialite.getCode());
        response.setLibelle(specialite.getLibelle());
        response.setDescription(specialite.getDescription());
        response.setOrdreAffichage(specialite.getOrdreAffichage());
        response.setActive(specialite.isActive());
        response.setNombreSousSpecialites(nombreSousSpecialites);
        response.setNombreMedecins(nombreMedecins);
        response.setNombreDemandes(nombreDemandes);
        response.setCanDelete(canDelete);
        return response;
    }

    public static AdminSpecialiteDetailResponse toDetailResponse(
            Specialite specialite,
            long nombreSousSpecialites,
            long nombreMedecins,
            long nombreDemandes,
            boolean canDelete,
            List<com.onmm.backend.dto.Admin.specialite.AdminSousSpecialiteResponse> sousSpecialites
    ) {
        AdminSpecialiteDetailResponse response = new AdminSpecialiteDetailResponse();
        response.setId(specialite.getId());
        response.setCode(specialite.getCode());
        response.setLibelle(specialite.getLibelle());
        response.setDescription(specialite.getDescription());
        response.setOrdreAffichage(specialite.getOrdreAffichage());
        response.setActive(specialite.isActive());
        response.setNombreSousSpecialites(nombreSousSpecialites);
        response.setNombreMedecins(nombreMedecins);
        response.setNombreDemandes(nombreDemandes);
        response.setCanDelete(canDelete);
        response.setSousSpecialites(sousSpecialites);
        return response;
    }
}