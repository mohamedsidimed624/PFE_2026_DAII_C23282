package com.onmm.backend.dto.contenu;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategorieContenuDTO {

    private Long id;

    private String nom;

    private boolean active;
}


