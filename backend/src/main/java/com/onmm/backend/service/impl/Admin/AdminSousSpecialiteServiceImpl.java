package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.dto.Admin.specialite.AdminSousSpecialiteResponse;
import com.onmm.backend.dto.Admin.specialite.SousSpecialiteRequest;
import com.onmm.backend.entity.SousSpecialite;
import com.onmm.backend.entity.Specialite;
import com.onmm.backend.mapper.SousSpecialiteAdminMapper;
import com.onmm.backend.repository.*;
import com.onmm.backend.service.Admin.AdminSousSpecialiteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminSousSpecialiteServiceImpl implements AdminSousSpecialiteService {

    private final SousSpecialiteRepository sousSpecialiteRepository;
    private final SpecialiteRepository specialiteRepository;
    private final MedecinEducationRepository medecinEducationRepository;
    private final DemandeEducationRepository demandeEducationRepository;

    public AdminSousSpecialiteServiceImpl(
            SousSpecialiteRepository sousSpecialiteRepository,
            SpecialiteRepository specialiteRepository,
            MedecinEducationRepository medecinEducationRepository,
            DemandeEducationRepository demandeEducationRepository
    ) {
        this.sousSpecialiteRepository = sousSpecialiteRepository;
        this.specialiteRepository = specialiteRepository;
        this.medecinEducationRepository = medecinEducationRepository;
        this.demandeEducationRepository = demandeEducationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminSousSpecialiteResponse> getSousSpecialitesBySpecialite(Long specialiteId) {
        if (!specialiteRepository.existsById(specialiteId)) {
            throw new RuntimeException("Spécialité introuvable.");
        }

        return sousSpecialiteRepository.findBySpecialiteIdOrderByOrdreAffichageAscLibelleAsc(specialiteId)
                .stream()
                .map(this::mapSousSpecialiteResponse)
                .toList();
    }

    @Override
    public AdminSousSpecialiteResponse createSousSpecialite(SousSpecialiteRequest request) {
        validateSousSpecialiteRequest(request);

        Specialite specialite = specialiteRepository.findById(request.getSpecialiteId())
                .orElseThrow(() -> new RuntimeException("Spécialité parent introuvable."));

        if (sousSpecialiteRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new RuntimeException("Le code de sous-spécialité existe déjà.");
        }

        if (sousSpecialiteRepository.existsByLibelleIgnoreCaseAndSpecialiteId(
                request.getLibelle().trim(),
                request.getSpecialiteId()
        )) {
            throw new RuntimeException("Ce libellé existe déjà pour cette spécialité.");
        }

        SousSpecialite sousSpecialite = new SousSpecialite();
        sousSpecialite.setCode(request.getCode().trim());
        sousSpecialite.setLibelle(request.getLibelle().trim());
        sousSpecialite.setDescription(normalizeNullable(request.getDescription()));
        sousSpecialite.setOrdreAffichage(request.getOrdreAffichage());
        sousSpecialite.setActive(request.getActive() == null || request.getActive());
        sousSpecialite.setSpecialite(specialite);

        SousSpecialite saved = sousSpecialiteRepository.save(sousSpecialite);
        return mapSousSpecialiteResponse(saved);
    }

    @Override
    public AdminSousSpecialiteResponse updateSousSpecialite(Long id, SousSpecialiteRequest request) {
        validateSousSpecialiteRequest(request);

        SousSpecialite sousSpecialite = sousSpecialiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sous-spécialité introuvable."));

        Specialite specialite = specialiteRepository.findById(request.getSpecialiteId())
                .orElseThrow(() -> new RuntimeException("Spécialité parent introuvable."));

        if (sousSpecialiteRepository.existsByCodeIgnoreCaseAndIdNot(request.getCode().trim(), id)) {
            throw new RuntimeException("Le code de sous-spécialité existe déjà.");
        }

        if (sousSpecialiteRepository.existsByLibelleIgnoreCaseAndSpecialiteIdAndIdNot(
                request.getLibelle().trim(),
                request.getSpecialiteId(),
                id
        )) {
            throw new RuntimeException("Ce libellé existe déjà pour cette spécialité.");
        }

        sousSpecialite.setCode(request.getCode().trim());
        sousSpecialite.setLibelle(request.getLibelle().trim());
        sousSpecialite.setDescription(normalizeNullable(request.getDescription()));
        sousSpecialite.setOrdreAffichage(request.getOrdreAffichage());
        if (request.getActive() != null) {
            sousSpecialite.setActive(request.getActive());
        }
        sousSpecialite.setSpecialite(specialite);

        SousSpecialite saved = sousSpecialiteRepository.save(sousSpecialite);
        return mapSousSpecialiteResponse(saved);
    }

    @Override
    public void toggleSousSpecialiteStatus(Long id) {
        SousSpecialite sousSpecialite = sousSpecialiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sous-spécialité introuvable."));

        sousSpecialite.setActive(!sousSpecialite.isActive());
        sousSpecialiteRepository.save(sousSpecialite);
    }

    @Override
    public void deleteSousSpecialite(Long id) {
        SousSpecialite sousSpecialite = sousSpecialiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sous-spécialité introuvable."));

        if (!canDeleteSousSpecialite(id)) {
            throw new RuntimeException("Impossible de supprimer cette sous-spécialité car elle est utilisée.");
        }

        sousSpecialiteRepository.delete(sousSpecialite);
    }

    private AdminSousSpecialiteResponse mapSousSpecialiteResponse(SousSpecialite sousSpecialite) {
        long nombreMedecins = medecinEducationRepository.countBySousSpecialiteId(sousSpecialite.getId());
        long nombreDemandes = demandeEducationRepository.countBySousSpecialiteId(sousSpecialite.getId());
        boolean canDelete = canDeleteSousSpecialite(sousSpecialite.getId());

        return SousSpecialiteAdminMapper.toResponse(
                sousSpecialite,
                nombreMedecins,
                nombreDemandes,
                canDelete
        );
    }

    private boolean canDeleteSousSpecialite(Long sousSpecialiteId) {
        return !medecinEducationRepository.existsBySousSpecialiteId(sousSpecialiteId)
                && !demandeEducationRepository.existsBySousSpecialiteId(sousSpecialiteId);
    }

    private void validateSousSpecialiteRequest(SousSpecialiteRequest request) {
        if (request == null) {
            throw new RuntimeException("La requête est invalide.");
        }
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new RuntimeException("Le code est obligatoire.");
        }
        if (request.getLibelle() == null || request.getLibelle().trim().isEmpty()) {
            throw new RuntimeException("Le libellé est obligatoire.");
        }
        if (request.getSpecialiteId() == null) {
            throw new RuntimeException("La spécialité parent est obligatoire.");
        }
    }

    private String normalizeNullable(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isCodeAvailable(String code, Long excludeId) {
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Le code est obligatoire.");
        }

        String normalizedCode = code.trim();

        if (excludeId != null) {
            return !sousSpecialiteRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, excludeId);
        }

        return !sousSpecialiteRepository.existsByCodeIgnoreCase(normalizedCode);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isLibelleAvailable(String libelle, Long specialiteId, Long excludeId) {
        if (libelle == null || libelle.trim().isEmpty()) {
            throw new RuntimeException("Le libellé est obligatoire.");
        }

        if (specialiteId == null) {
            throw new RuntimeException("La spécialité parent est obligatoire.");
        }

        String normalizedLibelle = libelle.trim();

        if (excludeId != null) {
            return !sousSpecialiteRepository.existsByLibelleIgnoreCaseAndSpecialiteIdAndIdNot(
                    normalizedLibelle,
                    specialiteId,
                    excludeId
            );
        }

        return !sousSpecialiteRepository.existsByLibelleIgnoreCaseAndSpecialiteId(
                normalizedLibelle,
                specialiteId
        );
    }

}