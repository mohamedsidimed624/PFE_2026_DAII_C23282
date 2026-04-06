package com.onmm.backend.service.impl.publics;

import com.onmm.backend.dto.publics.PublicEducationDto;
import com.onmm.backend.dto.publics.PublicExperienceDto;
import com.onmm.backend.dto.publics.PublicMedecinDetailResponse;
import com.onmm.backend.dto.publics.PublicMedecinResponse;
import com.onmm.backend.entity.DemandeEducation;
import com.onmm.backend.entity.DemandeExperience;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.service.publics.PublicAnnuaireService;
import com.onmm.backend.specification.MedecinSpecification;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PublicAnnuaireServiceImpl implements PublicAnnuaireService {

    private final MedecinRepository medecinRepository;

    public PublicAnnuaireServiceImpl(MedecinRepository medecinRepository) {
        this.medecinRepository = medecinRepository;
    }

    @Override
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
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        if (!"ACTIF".equalsIgnoreCase(medecin.getStatut())) {
            throw new RuntimeException("Médecin non disponible dans l'annuaire public");
        }

        return toDetailDto(medecin);
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

    private PublicMedecinResponse toDto(Medecin medecin) {
        PublicMedecinResponse dto = new PublicMedecinResponse();
        dto.setId(medecin.getId());
        dto.setNom(medecin.getNom());
        dto.setPrenom(medecin.getPrenom());
        dto.setSpecialite(medecin.getSpecialite());
        dto.setNumeroInscription(medecin.getNumeroInscription());
        dto.setVille(medecin.getAdresse());
        dto.setPhotoProfilPath(medecin.getPhotoProfilPath());
        return dto;
    }

    private PublicMedecinDetailResponse toDetailDto(Medecin medecin) {
        PublicMedecinDetailResponse dto = new PublicMedecinDetailResponse();
        dto.setId(medecin.getId());
        dto.setNom(medecin.getNom());
        dto.setPrenom(medecin.getPrenom());
        dto.setSpecialite(medecin.getSpecialite());
        dto.setNumeroInscription(medecin.getNumeroInscription());
        dto.setVille(medecin.getAdresse());
        dto.setPhotoProfilPath(medecin.getPhotoProfilPath());
        dto.setStatut(medecin.getStatut());
        dto.setAdresse(medecin.getAdresse());
        dto.setNationalite(medecin.getNationalite());
        dto.setSexe(medecin.getSexe());

        if (medecin.getUser() != null
                && medecin.getUser().getDemandeApprouvee() != null) {

            List<PublicEducationDto> educations = medecin.getUser()
                    .getDemandeApprouvee()
                    .getEducations()
                    .stream()
                    .map(this::toEducationDto)
                    .collect(Collectors.toList());

            List<PublicExperienceDto> experiences = medecin.getUser()
                    .getDemandeApprouvee()
                    .getExperiences()
                    .stream()
                    .map(this::toExperienceDto)
                    .collect(Collectors.toList());

            dto.setEducations(educations);
            dto.setExperiences(experiences);
        }

        return dto;
    }

    private PublicEducationDto toEducationDto(DemandeEducation education) {
        PublicEducationDto dto = new PublicEducationDto();
        dto.setDiplome(education.getDiplome());
        dto.setSpecialite(education.getSpecialite());
        dto.setSousSpecialite(education.getSousSpecialite());
        dto.setUniversite(education.getUniversite());
        dto.setPays(education.getPays());
        dto.setVille(education.getVille());
        dto.setAnneeObtention(education.getAnneeObtention());
        return dto;
    }

    private PublicExperienceDto toExperienceDto(DemandeExperience experience) {
        PublicExperienceDto dto = new PublicExperienceDto();
        dto.setPoste(experience.getPoste());
        dto.setNomEtablissement(experience.getNomEtablissement());
        dto.setVille(experience.getVille());
        dto.setPays(experience.getPays());
        dto.setDateDebut(experience.getDateDebut() != null ? experience.getDateDebut().toString() : null);
        dto.setDateFin(experience.getDateFin() != null ? experience.getDateFin().toString() : null);
        return dto;
    }
}