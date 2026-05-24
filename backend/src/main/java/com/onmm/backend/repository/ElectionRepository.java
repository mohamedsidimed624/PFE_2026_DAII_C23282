package com.onmm.backend.repository;

import com.onmm.backend.entity.Election;
import com.onmm.backend.entity.enums.ElectionStatut;
import com.onmm.backend.entity.enums.ElectionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ElectionRepository extends JpaRepository<Election, Long> {

    Page<Election> findAllByOrderByDateCreationDesc(Pageable pageable);
    Page<Election> findByStatutOrderByDateCreationDesc(ElectionStatut statut, Pageable pageable);
    Page<Election> findByTypeOrderByDateCreationDesc(ElectionType type, Pageable pageable);
    Page<Election> findByStatutAndTypeOrderByDateCreationDesc(ElectionStatut statut, ElectionType type, Pageable pageable);

    List<Election> findByStatut(ElectionStatut statut);

    List<Election> findByStatutAndCandidatureStartDateLessThanEqual(ElectionStatut statut, LocalDateTime date);
    List<Election> findByStatutAndCandidatureEndDateLessThan(ElectionStatut statut, LocalDateTime date);
    List<Election> findByStatutAndVoteStartDateLessThanEqual(ElectionStatut statut, LocalDateTime date);
    List<Election> findByStatutAndVoteEndDateLessThan(ElectionStatut statut, LocalDateTime date);

    boolean existsByTypeAndStatutNotIn(ElectionType type, List<ElectionStatut> statuts);
    boolean existsByTypeAndRegionIgnoreCaseAndStatutNotIn(ElectionType type, String region, List<ElectionStatut> statuts);
}
