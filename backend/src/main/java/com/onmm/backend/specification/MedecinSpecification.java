package com.onmm.backend.specification;

import com.onmm.backend.entity.Medecin;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class MedecinSpecification {

    public static Specification<Medecin> filter(
            String nom,
            String prenom,
            String numeroInscription,
            String specialite,
            String ville
    ) {
        return (root, query, cb) -> {
            query.distinct(true);

            var predicate = cb.conjunction();

            if (nom != null && !nom.isBlank()) {
                String value = "%" + nom.trim().toLowerCase() + "%";

                predicate = cb.and(
                        predicate,
                        cb.or(
                                cb.like(cb.lower(root.get("nom")), value),
                                cb.like(cb.lower(root.get("prenom")), value)
                        )
                );
            }

            if (prenom != null && !prenom.isBlank()) {
                predicate = cb.and(
                        predicate,
                        cb.like(cb.lower(root.get("prenom")), "%" + prenom.trim().toLowerCase() + "%")
                );
            }

            if (numeroInscription != null && !numeroInscription.isBlank()) {
                predicate = cb.and(
                        predicate,
                        cb.like(
                                cb.lower(root.get("numeroInscription")),
                                "%" + numeroInscription.trim().toLowerCase() + "%"
                        )
                );
            }

            if (ville != null && !ville.isBlank()) {
                predicate = cb.and(
                        predicate,
                        cb.like(
                                cb.lower(root.get("villeExercice")),
                                "%" + ville.trim().toLowerCase() + "%"
                        )
                );
            }

            if (specialite != null && !specialite.isBlank()) {
                var educationJoin = root.join("educations", JoinType.LEFT);
                var specialiteJoin = educationJoin.join("specialite", JoinType.LEFT);
                var sousSpecialiteJoin = educationJoin.join("sousSpecialite", JoinType.LEFT);

                String value = "%" + specialite.trim().toLowerCase() + "%";

                predicate = cb.and(
                        predicate,
                        cb.or(
                                cb.like(cb.lower(specialiteJoin.get("libelle")), value),
                                cb.like(cb.lower(sousSpecialiteJoin.get("libelle")), value)
                        )
                );
            }

            return predicate;
        };
    }
}