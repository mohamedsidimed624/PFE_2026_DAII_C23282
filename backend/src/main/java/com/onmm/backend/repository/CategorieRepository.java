package com.onmm.backend.repository;

import com.onmm.backend.entity.CategorieContenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategorieRepository extends JpaRepository<CategorieContenu, Long> {


}
