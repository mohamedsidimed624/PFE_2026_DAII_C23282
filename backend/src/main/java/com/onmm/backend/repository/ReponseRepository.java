package com.onmm.backend.repository;

import com.onmm.backend.entity.Reponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReponseRepository extends JpaRepository<Reponse, Long> {

    List<Reponse> findByParticipationId(Long participationId);

    List<Reponse> findByParticipation_SondageIdAndQuestionOrdre(Long sondageId, Integer questionOrdre);
}
