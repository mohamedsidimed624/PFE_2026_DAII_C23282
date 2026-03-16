package com.onmm.backend.service;

import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;
import com.onmm.backend.repository.SousSpecialiteRepository;
import com.onmm.backend.repository.SpecialiteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReferenceService {

    private final SpecialiteRepository specialiteRepository;
    private final SousSpecialiteRepository sousSpecialiteRepository;

    public ReferenceService(SpecialiteRepository specialiteRepository, SousSpecialiteRepository sousSpecialiteRepository) {
        this.specialiteRepository = specialiteRepository;
        this.sousSpecialiteRepository = sousSpecialiteRepository;
    }

    public List<Specialite> getSpecialite() {
        return specialiteRepository.findAll();
    }

    public List<SousSpecialite> getSousSpecialites(Long specialiteId) {
        return sousSpecialiteRepository.findBySpecialiteId(specialiteId);
    }
}
