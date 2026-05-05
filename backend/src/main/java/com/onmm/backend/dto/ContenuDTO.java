package com.onmm.backend.dto;

import com.onmm.backend.entity.enums.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContenuDTO {

    private Long id;

    private String titre;

    private String contenu;

    private ContenuType type;

    private ContenuStatut statut;

    private ContenuVisibilite visibilite;

    private Long categorieId;

    private String categorieNom;

    private String createdBy;

}