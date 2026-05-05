package com.onmm.backend.service.impl;

import com.onmm.backend.dto.contenu.ContenuResponseDTO;
import com.onmm.backend.entity.Contenu;
import com.onmm.backend.entity.enums.ContenuStatut;
import com.onmm.backend.entity.enums.ContenuType;
import com.onmm.backend.entity.enums.ContenuVisibilite;
import com.onmm.backend.mapper.ContenuMapper;
import com.onmm.backend.repository.ContenuRepository;
import com.onmm.backend.service.publics.ContenuPublicService;
import com.onmm.backend.specification.ContenuSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContenuPublicServiceImpl implements ContenuPublicService {

    private final ContenuRepository contenuRepository;

    @Override
    public Page<ContenuResponseDTO> getPublicContenus(
            int page,
            int size,
            ContenuType type,
            Long categorieId,
            String search
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("datePublication").descending()
        );

        var spec = ContenuSpecification.filter(type, categorieId, search);

        return contenuRepository
                .findAll(spec, pageable)
                .map(ContenuMapper::toDTO);
    }

    @Override
    public ContenuResponseDTO getPublicContenuById(Long id) {
        Contenu contenu = contenuRepository.findByIdAndStatutAndVisibilite(
                id,
                ContenuStatut.PUBLISHED,
                ContenuVisibilite.PUBLIC
        ).orElseThrow(() -> new RuntimeException("Contenu public introuvable"));

        if (contenu.getDateExpiration() != null
                && contenu.getDateExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Contenu public expiré");
        }

        return ContenuMapper.toDTO(contenu);
    }
}