package com.onmm.backend.service.impl.publics;

import com.onmm.backend.dto.publics.PublicEducationDto;
import com.onmm.backend.dto.publics.PublicExperienceDto;
import com.onmm.backend.dto.publics.PublicMedecinDetailResponse;
import com.onmm.backend.dto.publics.PublicMedecinResponse;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.MedecinEducation;
import com.onmm.backend.entity.MedecinExperience;
import com.onmm.backend.entity.enums.StatutMedecin;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.service.publics.PublicAnnuaireService;
import com.onmm.backend.specification.MedecinSpecification;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class PublicAnnuaireServiceImpl implements PublicAnnuaireService {

    private final MedecinRepository medecinRepository;

    public PublicAnnuaireServiceImpl(MedecinRepository medecinRepository) {
        this.medecinRepository = medecinRepository;
    }

    @Override
    @Transactional
    public Page<PublicMedecinResponse> searchMedecins(
            String nom,
            String prenom,
            String numeroInscription,
            String specialite,
            String ville,
            int page,
            int size,
            String sort
    ) {
        Sort sortObj = buildSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Specification<Medecin> specification = MedecinSpecification.filter(
                nom,
                prenom,
                numeroInscription,
                specialite,
                ville
        );

        Page<Medecin> medecinPage = medecinRepository.findAll(specification, pageable);

        return medecinPage.map(this::toDto);
    }

    @Override
    @Transactional
    public PublicMedecinDetailResponse getPublicMedecinById(Long id) {

        Medecin medecin = medecinRepository.findPublicDetailById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        if (medecin.getStatut() != StatutMedecin.ACTIF) {
            throw new RuntimeException("Médecin non disponible");
        }

        return toDetailDto(medecin);
    }

    private PublicMedecinResponse toDto(Medecin medecin) {

        PublicMedecinResponse dto = new PublicMedecinResponse();

        dto.setId(medecin.getId());
        dto.setNom(medecin.getNom());
        dto.setPrenom(medecin.getPrenom());
        dto.setNumeroInscription(medecin.getNumeroInscription());
        dto.setVilleExercice(medecin.getVilleExercice());
        dto.setPhotoProfilPath(medecin.getPhotoProfilPath());

        dto.setEducations(
                medecin.getEducations() == null
                        ? List.of()
                        : medecin.getEducations()
                        .stream()
                        .map(this::toEducationDto)
                        .toList()
        );

        return dto;
    }

    private PublicMedecinDetailResponse toDetailDto(Medecin medecin) {

        PublicMedecinDetailResponse dto = new PublicMedecinDetailResponse();

        dto.setId(medecin.getId());
        dto.setNom(medecin.getNom());
        dto.setPrenom(medecin.getPrenom());
        dto.setNumeroInscription(medecin.getNumeroInscription());
        dto.setVille(medecin.getAdresse());
        dto.setPhotoProfilPath(medecin.getPhotoProfilPath());
        dto.setStatut(medecin.getStatut() != null ? medecin.getStatut().name() : null);
        dto.setAdresse(medecin.getAdresse());
        dto.setNationalite(medecin.getNationalite());
        dto.setSexe(medecin.getSexe());



        List<PublicEducationDto> educations = medecin.getEducations() == null
                ? List.of()
                : medecin.getEducations()
                .stream()
                .map(this::toEducationDto)
                .toList();

        List<PublicExperienceDto> experiences = medecin.getExperiences() == null
                ? List.of()
                : medecin.getExperiences()
                .stream()
                .map(this::toExperienceDto)
                .toList();

        dto.setEducations(educations);
        dto.setExperiences(experiences);

        return dto;
    }

    private MedecinEducation getEducationReference(Medecin medecin) {
        if (medecin.getEducations() == null || medecin.getEducations().isEmpty()) {
            return null;
        }

        return medecin.getEducations()
                .stream()
                .max(Comparator.comparing(MedecinEducation::getAnneeObtention))
                .orElse(null);
    }

    private PublicEducationDto toEducationDto(MedecinEducation education) {

        PublicEducationDto dto = new PublicEducationDto();

        dto.setDiplome(education.getDiplome());
        dto.setUniversite(education.getUniversite());
        dto.setPays(education.getPays());
        dto.setVille(education.getVille());
        dto.setAnneeObtention(education.getAnneeObtention());

        if (education.getSpecialite() != null) {
            dto.setSpecialiteId(education.getSpecialite().getId());
            dto.setSpecialiteLibelle(education.getSpecialite().getLibelle());
        }

        if (education.getSousSpecialite() != null) {
            dto.setSousSpecialiteId(education.getSousSpecialite().getId());
            dto.setSousSpecialiteLibelle(education.getSousSpecialite().getLibelle());
        }

        return dto;
    }

    private PublicExperienceDto toExperienceDto(MedecinExperience experience) {

        PublicExperienceDto dto = new PublicExperienceDto();

        dto.setPoste(experience.getPoste());
        dto.setNomEtablissement(experience.getNomEtablissement());
        dto.setVille(experience.getVille());
        dto.setPays(experience.getPays());
        dto.setDateDebut(experience.getDateDebut() != null ? experience.getDateDebut().toString() : null);
        dto.setDateFin(experience.getDateFin() != null ? experience.getDateFin().toString() : null);

        return dto;
    }

    private Sort buildSort(String sort) {
        if (sort == null || sort.isBlank() || "alpha".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "nom", "prenom");
        }

        if ("recent".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.DESC, "id");
        }

        if ("ancien".equalsIgnoreCase(sort)) {
            return Sort.by(Sort.Direction.ASC, "id");
        }

        return Sort.by(Sort.Direction.ASC, "nom", "prenom");
    }
}