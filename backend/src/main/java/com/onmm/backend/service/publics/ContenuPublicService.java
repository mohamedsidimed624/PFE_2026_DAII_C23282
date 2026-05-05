package com.onmm.backend.service.publics;

import com.onmm.backend.dto.contenu.ContenuResponseDTO;
import com.onmm.backend.entity.enums.ContenuType;
import org.springframework.data.domain.Page;

public interface ContenuPublicService {

    Page<ContenuResponseDTO> getPublicContenus(
            int page,
            int size,
            ContenuType type,
            Long categorieId,
            String search
    );

    ContenuResponseDTO getPublicContenuById(Long id);
}