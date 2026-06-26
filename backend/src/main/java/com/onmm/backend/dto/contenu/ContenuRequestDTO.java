package com.onmm.backend.dto.contenu;

import com.onmm.backend.entity.enums.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContenuRequestDTO {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    @NotBlank(message = "Le résumé est obligatoire")
    private String resume;

    @NotBlank(message = "Le contenu est obligatoire")
    private String contenu;

    private ContenuType type;

    private ContenuVisibilite visibilite;

    private Long categorieId;

    private String dateExpiration;

    private String description;

    private String imageUrl;

    private Long specialiteCibleId;
}