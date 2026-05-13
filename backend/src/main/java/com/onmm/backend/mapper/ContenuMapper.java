package com.onmm.backend.mapper;

import com.onmm.backend.dto.contenu.ContenuResponseDTO;
import com.onmm.backend.entity.Contenu;

public class ContenuMapper {

    public static ContenuResponseDTO toDTO(Contenu contenu) {
        return ContenuResponseDTO.builder()
                .id(contenu.getId())
                .titre(contenu.getTitre())
                .contenu(contenu.getContenu())
                .type(contenu.getType())
                .statut(contenu.getStatut())
                .visibilite(contenu.getVisibilite())
                .categorieId(contenu.getCategorie() != null ? contenu.getCategorie().getId() : null)
                .categorieNom(contenu.getCategorie() != null ? contenu.getCategorie().getNom() : null)
                .createdBy(contenu.getCreatedBy() != null ? contenu.getCreatedBy().getEmail() : null)
                .dateCreation(contenu.getDateCreation() != null ? contenu.getDateCreation().toString() : null)
                .datePublication(contenu.getDatePublication() != null ? contenu.getDatePublication().toString() : null)
                .dateExpiration(contenu.getDateExpiration() != null ? contenu.getDateExpiration().toString() : null)
                .imageUrl(contenu.getImageUrl())
                .resume(contenu.getResume())
                .specialiteCibleId(contenu.getSpecialiteCible() != null ? contenu.getSpecialiteCible().getId() : null)
                .specialiteCibleNom(contenu.getSpecialiteCible() != null ? contenu.getSpecialiteCible().getLibelle() : null)
                .build();
    }
}