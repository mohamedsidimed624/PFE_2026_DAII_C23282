package com.onmm.backend.specification;

import com.onmm.backend.entity.Contenu;
import com.onmm.backend.entity.enums.ContenuStatut;
import com.onmm.backend.entity.enums.ContenuType;
import com.onmm.backend.entity.enums.ContenuVisibilite;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ContenuSpecification {

    public static Specification<Contenu> filter(
            ContenuType type,
            Long categorieId,
            String search
    ) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // \ud83d\udd10 seulement public + publié
            predicates.add(cb.equal(root.get("statut"), ContenuStatut.PUBLISHED));
            predicates.add(cb.equal(root.get("visibilite"), ContenuVisibilite.PUBLIC));

            // ⏱️ exclusion des expirés
            predicates.add(
                    cb.or(
                            cb.isNull(root.get("dateExpiration")),
                            cb.greaterThan(root.get("dateExpiration"), LocalDateTime.now())
                    )
            );

            // \ud83d\udcc2 catégorie
            if (categorieId != null) {
                predicates.add(cb.equal(root.get("categorie").get("id"), categorieId));
            }

            // \ud83c\udff7️ type
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            // \ud83d\udd0e recherche
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";

                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("titre")), like),
                                cb.like(cb.lower(root.get("resume")), like),
                                cb.like(cb.lower(root.get("contenu")), like)
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}