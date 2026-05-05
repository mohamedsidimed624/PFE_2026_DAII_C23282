package com.onmm.backend.service.impl.publics;

import com.onmm.backend.dto.publics.PublicSpecialiteResponse;
import com.onmm.backend.repository.SpecialiteRepository;
import com.onmm.backend.service.publics.PublicSpecialiteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PublicSpecialiteServiceImpl implements PublicSpecialiteService {

    private final SpecialiteRepository specialiteRepository;

    public PublicSpecialiteServiceImpl(SpecialiteRepository specialiteRepository) {
        this.specialiteRepository = specialiteRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicSpecialiteResponse> getActiveSpecialites() {
        return specialiteRepository.findByActiveTrueOrderByLibelleAsc()
                .stream()
                .map(s -> new PublicSpecialiteResponse(s.getId(), s.getLibelle()))
                .toList();
    }
}