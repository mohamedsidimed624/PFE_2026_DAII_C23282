package com.onmm.backend.service.impl.Admin;

import com.onmm.backend.exception.BusinessException;
import com.onmm.backend.exception.ForbiddenException;
import com.onmm.backend.exception.ResourceNotFoundException;
import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteDetailResponse;
import com.onmm.backend.exception.BusinessException;
import com.onmm.backend.exception.ForbiddenException;
import com.onmm.backend.exception.ResourceNotFoundException;
import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteResponse;
import com.onmm.backend.exception.BusinessException;
import com.onmm.backend.exception.ForbiddenException;
import com.onmm.backend.exception.ResourceNotFoundException;
import com.onmm.backend.dto.Admin.specialite.AdminSousSpecialiteResponse;
import com.onmm.backend.exception.BusinessException;
import com.onmm.backend.exception.ForbiddenException;
import com.onmm.backend.exception.ResourceNotFoundException;
import com.onmm.backend.dto.Admin.specialite.SpecialiteRequest;
import com.onmm.backend.entity.Specialite;
import com.onmm.backend.mapper.SpecialiteAdminMapper;
import com.onmm.backend.mapper.SousSpecialiteAdminMapper;
import com.onmm.backend.repository.DemandeEducationRepository;
import com.onmm.backend.repository.MedecinEducationRepository;
import com.onmm.backend.repository.SousSpecialiteRepository;
import com.onmm.backend.repository.SpecialiteRepository;
import com.onmm.backend.service.Admin.AdminSpecialiteService;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AdminSpecialiteServiceImpl implements AdminSpecialiteService {

    private final SpecialiteRepository specialiteRepository;
    private final SousSpecialiteRepository sousSpecialiteRepository;
    private final MedecinEducationRepository medecinEducationRepository;
    private final DemandeEducationRepository demandeEducationRepository;

    public AdminSpecialiteServiceImpl(
            SpecialiteRepository specialiteRepository,
            SousSpecialiteRepository sousSpecialiteRepository,
            MedecinEducationRepository medecinEducationRepository,
            DemandeEducationRepository demandeEducationRepository
    ) {
        this.specialiteRepository = specialiteRepository;
        this.sousSpecialiteRepository = sousSpecialiteRepository;
        this.medecinEducationRepository = medecinEducationRepository;
        this.demandeEducationRepository = demandeEducationRepository;
    }

    private Sort buildSort(String sortBy) {
        if ("libelle_desc".equalsIgnoreCase(sortBy)) {
            return Sort.by(Sort.Direction.DESC, "libelle");
        }
        if ("libelle_asc".equalsIgnoreCase(sortBy)) {
            return Sort.by(Sort.Direction.ASC, "libelle");
        }
        if ("ordre_asc".equalsIgnoreCase(sortBy)) {
            return Sort.by(Sort.Direction.ASC, "ordreAffichage", "libelle");
        }
        if ("ordre_desc".equalsIgnoreCase(sortBy)) {
            return Sort.by(Sort.Direction.DESC, "ordreAffichage", "libelle");
        }
        return Sort.by(Sort.Direction.ASC, "libelle");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminSpecialiteResponse> getAllSpecialites(
            int page,
            int size,
            String search,
            Boolean active,
            String sortBy
    ) {
        Sort sort = buildSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Specialite> specialitesPage;

        boolean hasSearch = search != null && !search.trim().isEmpty();
        String normalizedSearch = hasSearch ? search.trim() : null;

        if (hasSearch && active != null) {
            specialitesPage = specialiteRepository
                    .findByLibelleContainingIgnoreCaseAndActive(normalizedSearch, active, pageable);
        } else if (hasSearch) {
            specialitesPage = specialiteRepository
                    .findByLibelleContainingIgnoreCase(normalizedSearch, pageable);
        } else if (active != null) {
            specialitesPage = specialiteRepository
                    .findByActive(active, pageable);
        } else {
            specialitesPage = specialiteRepository.findAll(pageable);
        }

        return specialitesPage.map(this::mapSpecialiteResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminSpecialiteDetailResponse getSpecialiteById(Long id) {
        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité introuvable"));

        long nombreSousSpecialites = sousSpecialiteRepository.countBySpecialiteId(id);
        long nombreMedecins = medecinEducationRepository.countBySpecialiteId(id);
        long nombreDemandes = demandeEducationRepository.countBySpecialiteId(id);
        boolean canDelete = canDeleteSpecialite(id);

        List<AdminSousSpecialiteResponse> sousSpecialites = sousSpecialiteRepository
                .findBySpecialiteIdOrderByOrdreAffichageAscLibelleAsc(id)
                .stream()
                .map(ss -> SousSpecialiteAdminMapper.toResponse(
                        ss,
                        medecinEducationRepository.countBySousSpecialiteId(ss.getId()),
                        demandeEducationRepository.countBySousSpecialiteId(ss.getId()),
                        canDeleteSousSpecialite(ss.getId())
                ))
                .toList();

        return SpecialiteAdminMapper.toDetailResponse(
                specialite,
                nombreSousSpecialites,
                nombreMedecins,
                nombreDemandes,
                canDelete,
                sousSpecialites
        );
    }

    @Override
    public AdminSpecialiteResponse createSpecialite(SpecialiteRequest request) {
        validateSpecialiteRequest(request);

        if (specialiteRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new RuntimeException("Le code de spécialité existe déjà.");
        }

        if (specialiteRepository.existsByLibelleIgnoreCase(request.getLibelle().trim())) {
            throw new RuntimeException("Le libellé de spécialité existe déjà.");
        }

        Specialite specialite = new Specialite();
        specialite.setCode(request.getCode().trim());
        specialite.setLibelle(request.getLibelle().trim());
        specialite.setDescription(normalizeNullable(request.getDescription()));
        specialite.setOrdreAffichage(request.getOrdreAffichage());
        specialite.setActive(request.getActive() == null || request.getActive());

        return mapSpecialiteResponse(specialiteRepository.save(specialite));
    }

    @Override
    public AdminSpecialiteResponse updateSpecialite(Long id, SpecialiteRequest request) {
        validateSpecialiteRequest(request);

        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité introuvable"));

        if (specialiteRepository.existsByCodeIgnoreCaseAndIdNot(request.getCode().trim(), id)) {
            throw new RuntimeException("Le code de spécialité existe déjà.");
        }

        if (specialiteRepository.existsByLibelleIgnoreCaseAndIdNot(request.getLibelle().trim(), id)) {
            throw new RuntimeException("Le libellé de spécialité existe déjà.");
        }

        specialite.setCode(request.getCode().trim());
        specialite.setLibelle(request.getLibelle().trim());
        specialite.setDescription(normalizeNullable(request.getDescription()));
        specialite.setOrdreAffichage(request.getOrdreAffichage());

        if (request.getActive() != null) {
            specialite.setActive(request.getActive());
        }

        return mapSpecialiteResponse(specialiteRepository.save(specialite));
    }

    @Override
    public void toggleSpecialiteStatus(Long id) {
        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité introuvable"));

        specialite.setActive(!specialite.isActive());
        specialiteRepository.save(specialite);
    }

    @Override
    public void deleteSpecialite(Long id) {
        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité introuvable"));

        if (!canDeleteSpecialite(id)) {
            throw new RuntimeException("Impossible de supprimer cette spécialité car elle est utilisée ou possède des sous-spécialités.");
        }

        specialiteRepository.delete(specialite);
    }

    private AdminSpecialiteResponse mapSpecialiteResponse(Specialite specialite) {
        long nombreSousSpecialites = sousSpecialiteRepository.countBySpecialiteId(specialite.getId());
        long nombreMedecins = medecinEducationRepository.countBySpecialiteId(specialite.getId());
        long nombreDemandes = demandeEducationRepository.countBySpecialiteId(specialite.getId());
        boolean canDelete = canDeleteSpecialite(specialite.getId());

        return SpecialiteAdminMapper.toResponse(
                specialite,
                nombreSousSpecialites,
                nombreMedecins,
                nombreDemandes,
                canDelete
        );
    }

    private boolean canDeleteSpecialite(Long specialiteId) {
        return !medecinEducationRepository.existsBySpecialiteId(specialiteId)
                && !demandeEducationRepository.existsBySpecialiteId(specialiteId)
                && sousSpecialiteRepository.countBySpecialiteId(specialiteId) == 0;
    }

    private boolean canDeleteSousSpecialite(Long sousSpecialiteId) {
        return !medecinEducationRepository.existsBySousSpecialiteId(sousSpecialiteId)
                && !demandeEducationRepository.existsBySousSpecialiteId(sousSpecialiteId);
    }

    private void validateSpecialiteRequest(SpecialiteRequest request) {
        if (request == null) {
            throw new RuntimeException("La requête est invalide.");
        }
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new RuntimeException("Le code est obligatoire.");
        }
        if (request.getLibelle() == null || request.getLibelle().trim().isEmpty()) {
            throw new RuntimeException("Le libellé est obligatoire.");
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
            return false;
        }

        String value = code.trim();

        if (excludeId == null) {
            return !specialiteRepository.existsByCodeIgnoreCase(value);
        }

        return !specialiteRepository.existsByCodeIgnoreCaseAndIdNot(value, excludeId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isLibelleAvailable(String libelle, Long excludeId) {
        if (libelle == null || libelle.trim().isEmpty()) {
            return false;
        }

        String value = libelle.trim();

        if (excludeId == null) {
            return !specialiteRepository.existsByLibelleIgnoreCase(value);
        }

        return !specialiteRepository.existsByLibelleIgnoreCaseAndIdNot(value, excludeId);
    }
}