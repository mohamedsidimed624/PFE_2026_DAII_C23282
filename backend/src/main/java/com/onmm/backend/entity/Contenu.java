package com.onmm.backend.entity;

import com.onmm.backend.entity.enums.ContenuStatut;
import com.onmm.backend.entity.enums.ContenuType;
import com.onmm.backend.entity.enums.ContenuVisibilite;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Contenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 180, nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Enumerated(EnumType.STRING)
    private ContenuType type;

    @Enumerated(EnumType.STRING)
    private ContenuStatut statut;

    @Enumerated(EnumType.STRING)
    private ContenuVisibilite visibilite;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 500)
    private String resume;

    @ManyToOne
    @JoinColumn(name = "categorie_id")
    private CategorieContenu categorie;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_cible_id")
    private Specialite specialiteCible;

    private LocalDateTime dateCreation;
    private LocalDateTime datePublication;
    private LocalDateTime dateExpiration;
}