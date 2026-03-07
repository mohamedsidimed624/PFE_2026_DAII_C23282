package com.onmm.backend.service.impl;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.service.DemandeAdhesionService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DemandeAdhesionServiceImpl implements DemandeAdhesionService {

    private final DemandeAdhesionRepository demandeAdhesionRepository;

    public DemandeAdhesionServiceImpl(DemandeAdhesionRepository demandeAdhesionRepository) {
        this.demandeAdhesionRepository = demandeAdhesionRepository;
    }

    @Override
    public DemandeAdhesion createDemande(DemandeAdhesion demande) {

        boolean exists = demandeAdhesionRepository
                .existsByNNIAndStatut(demande.getNNI(), ApplicationStatus.PENDING);

        if (exists) {
            throw new RuntimeException("Une demande existe déjà pour ce NNI");
        }

        demande.setStatut(ApplicationStatus.PENDING);
        demande.setSubmissionDate(LocalDateTime.now());

        return demandeAdhesionRepository.save(demande);
    }
}