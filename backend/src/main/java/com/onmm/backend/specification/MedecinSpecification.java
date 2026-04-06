package com.onmm.backend.specification;

import com.onmm.backend.entity.Medecin;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class MedecinSpecification {

    public static Specification<Medecin> filter(
            String nom,
            String prenom,
            String numeroInscription,
            String specialite,
            String ville
    ) {
        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Toujours afficher seulement les médecins ACTIF dans l'annuaire public
            predicates.add(
                    criteriaBuilder.equal(
                            criteriaBuilder.upper(root.get("statut")),
                            "ACTIF"
                    )
            );

            if (nom != null && !nom.isBlank()) {
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("nom")),
                                "%" + nom.toLowerCase() + "%"
                        )
                );
            }

            if (prenom != null && !prenom.isBlank()) {
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("prenom")),
                                "%" + prenom.toLowerCase() + "%"
                        )
                );
            }

            if (numeroInscription != null && !numeroInscription.isBlank()) {
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("numeroInscription")),
                                "%" + numeroInscription.toLowerCase() + "%"
                        )
                );
            }

            if (specialite != null
                    && !specialite.isBlank()
                    && !"Toutes spécialités".equalsIgnoreCase(specialite)) {
                predicates.add(
                        criteriaBuilder.equal(root.get("specialite"), specialite)
                );
            }

            if (ville != null
                    && !ville.isBlank()
                    && !"Toutes les villes".equalsIgnoreCase(ville)) {
                predicates.add(
                        criteriaBuilder.equal(root.get("adresse"), ville)
                );
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}