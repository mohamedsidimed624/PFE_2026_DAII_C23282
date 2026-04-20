package com.onmm.backend.service.impl;

import com.onmm.backend.dto.SpecialiteResponse;
import com.onmm.backend.dto.SousSpecialiteResponse;
import com.onmm.backend.entity.Specialite;
import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.repository.SpecialiteRepository;
import com.onmm.backend.repository.SousSpecialiteRepository;
import com.onmm.backend.service.SpecialiteService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpecialiteServiceImpl implements SpecialiteService {

    private final SpecialiteRepository specialiteRepository;
    private final SousSpecialiteRepository sousSpecialiteRepository;

    public SpecialiteServiceImpl(SpecialiteRepository specialiteRepository,
                                 SousSpecialiteRepository sousSpecialiteRepository) {
        this.specialiteRepository = specialiteRepository;
        this.sousSpecialiteRepository = sousSpecialiteRepository;
    }

    @Override
    public List<SpecialiteResponse> getAllActiveSpecialites() {
        List<Specialite> specialites =
                specialiteRepository.findByActiveTrueOrderByOrdreAffichageAscLibelleAsc();

        return specialites.stream()
                .map(s -> new SpecialiteResponse(
                        s.getId(),
                        s.getCode(),
                        s.getLibelle()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<SousSpecialiteResponse> getSousSpecialitesBySpecialite(Long specialiteId) {

        List<SousSpecialite> sousSpecialites =
                sousSpecialiteRepository.findBySpecialiteIdAndActiveTrueOrderByOrdreAffichageAscLibelleAsc(specialiteId);

        return sousSpecialites.stream()
                .map(ss -> new SousSpecialiteResponse(
                        ss.getId(),
                        ss.getCode(),
                        ss.getLibelle()
                ))
                .collect(Collectors.toList());
    }
}