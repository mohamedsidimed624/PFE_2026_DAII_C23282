package com.onmm.backend.repository;

import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface MedecinRepository extends JpaRepository<Medecin, Long>, JpaSpecificationExecutor<Medecin> {

    Optional<Medecin> findByUser(User user);

    boolean existsBySpecialiteId(Long specialiteId);

    boolean existsBySousSpecialiteId(Long sousSpecialiteId);

    long countBySpecialiteId(Long specialiteId);

    long countBySousSpecialiteId(Long sousSpecialiteId);

    @Query("""
        select m
        from Medecin m
        left join fetch m.specialite
        left join fetch m.sousSpecialite
        where m.user.id = :userId
    """)
    Optional<Medecin> findProfileByUserId(Long userId);

    @Query("""
        select m
        from Medecin m
        left join fetch m.specialite
        left join fetch m.sousSpecialite
        left join fetch m.user u
        left join fetch u.demandeApprouvee d
        left join fetch d.educations e
        left join fetch e.specialite
        left join fetch e.sousSpecialite
        left join fetch d.experiences ex
        where m.id = :id
    """)
    Optional<Medecin> findPublicDetailById(Long id);



}