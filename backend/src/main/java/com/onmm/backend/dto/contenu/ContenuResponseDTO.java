package com.onmm.backend.dto.contenu;

import com.onmm.backend.entity.enums.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContenuResponseDTO {

    private Long id;
    private String titre;
    private String contenu;

    private ContenuType type;
    private ContenuStatut statut;
    private ContenuVisibilite visibilite;

    private Long categorieId;
    private String categorieNom;

    private String createdBy;
    private String dateCreation;
    private String datePublication;
    private String dateExpiration;
    private String imageUrl;
    private String resume;
}