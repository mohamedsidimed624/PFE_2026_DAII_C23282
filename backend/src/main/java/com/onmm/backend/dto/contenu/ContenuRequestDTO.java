package com.onmm.backend.dto.contenu;

import com.onmm.backend.entity.enums.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContenuRequestDTO {

    private String titre;

    private String resume;

    private String contenu;

    private ContenuType type;

    private ContenuVisibilite visibilite;

    private Long categorieId;

    private String dateExpiration;

    private String description;

    private String imageUrl;

    private Long specialiteCibleId;
}