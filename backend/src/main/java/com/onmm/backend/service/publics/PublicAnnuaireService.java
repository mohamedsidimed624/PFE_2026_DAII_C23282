package com.onmm.backend.service.publics;

import com.onmm.backend.dto.publics.PublicMedecinDetailResponse;
import com.onmm.backend.dto.publics.PublicMedecinListResponse;
import com.onmm.backend.dto.publics.PublicMedecinResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface PublicAnnuaireService {



    Page<PublicMedecinResponse> searchMedecins(
            String nom,
            String prenom,
            String numeroInscription,
            String specialite,
            String ville,
            int page,
            int size,
            String sort
    );

    PublicMedecinDetailResponse getPublicMedecinById(Long id);
}
