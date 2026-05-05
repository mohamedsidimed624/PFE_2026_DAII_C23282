package com.onmm.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categorie_contenu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategorieContenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;

    private boolean active = true;
}
