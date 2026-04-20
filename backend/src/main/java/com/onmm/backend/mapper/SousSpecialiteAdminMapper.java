package com.onmm.backend.mapper;

import com.onmm.backend.dto.Admin.specialite.AdminSousSpecialiteResponse;
import com.onmm.backend.entity.SousSpecialite;

public class SousSpecialiteAdminMapper {

    private SousSpecialiteAdminMapper() {
    }

    public static AdminSousSpecialiteResponse toResponse(
            SousSpecialite sousSpecialite,
            long nombreMedecins,
            long nombreDemandes,
            boolean canDelete
    ) {
        AdminSousSpecialiteResponse response = new AdminSousSpecialiteResponse();
        response.setId(sousSpecialite.getId());
        response.setCode(sousSpecialite.getCode());
        response.setLibelle(sousSpecialite.getLibelle());
        response.setDescription(sousSpecialite.getDescription());
        response.setOrdreAffichage(sousSpecialite.getOrdreAffichage());
        response.setActive(sousSpecialite.isActive());

        if (sousSpecialite.getSpecialite() != null) {
            response.setSpecialiteId(sousSpecialite.getSpecialite().getId());
            response.setSpecialiteLibelle(sousSpecialite.getSpecialite().getLibelle());
        }

        response.setNombreMedecins(nombreMedecins);
        response.setNombreDemandes(nombreDemandes);
        response.setCanDelete(canDelete);
        return response;
    }
}