package com.onmm.backend.service.impl;

import com.onmm.backend.dto.medecin.MedecinEducationDto;
import com.onmm.backend.dto.medecin.MedecinProfileResponse;
import com.onmm.backend.dto.medecin.UpdateMedecinProfileRequest;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.MedecinEducation;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.service.MedecinService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class MedecinServiceImpl implements MedecinService {

    private final MedecinRepository medecinRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    public MedecinServiceImpl(MedecinRepository medecinRepository) {
        this.medecinRepository = medecinRepository;
    }

    private MedecinEducationDto mapEducation(MedecinEducation education) {
        MedecinEducationDto dto = new MedecinEducationDto();

        dto.setId(education.getId());
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

    @Override
    @Transactional
    public MedecinProfileResponse getMyProfile(String email) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profil médecin introuvable"));

        return mapToResponse(medecin);
    }

    @Override
    @Transactional
    public MedecinProfileResponse updateMyProfile(String email, UpdateMedecinProfileRequest request) {
        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        medecin.setNom(request.getNom());
        medecin.setPrenom(request.getPrenom());
        medecin.setTelephone(request.getTelephone());
        medecin.setNationalite(request.getNationalite());
        medecin.setAdresse(request.getAdresse());

        medecinRepository.save(medecin);

        return mapToResponse(medecin);
    }



    private MedecinProfileResponse mapToResponse(Medecin medecin) {
        MedecinProfileResponse response = new MedecinProfileResponse();

        response.setId(medecin.getId());
        response.setNom(medecin.getNom());
        response.setPrenom(medecin.getPrenom());
        response.setEmail(medecin.getEmail());
        response.setTelephone(medecin.getTelephone());
        response.setNni(medecin.getNni());
        response.setSexe(medecin.getSexe());
        response.setNationalite(medecin.getNationalite());
        response.setAdresse(medecin.getAdresse());
        response.setNumeroInscription(medecin.getNumeroInscription());
        response.setStatut(medecin.getStatut() != null ? medecin.getStatut().name() : null);
        response.setPhotoProfilPath(medecin.getPhotoProfilPath());

        response.setEducations(
                medecin.getEducations() == null
                        ? List.of()
                        : medecin.getEducations()
                        .stream()
                        .map(this::mapEducation)
                        .toList()
        );

        return response;
    }

    @Override
    @Transactional
    public String updateMyPhoto(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Aucun fichier envoyé");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg")
                        && !contentType.equals("image/png")
                        && !contentType.equals("image/webp"))) {
            throw new RuntimeException("Format d'image non supporté");
        }

        Medecin medecin = medecinRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));

        try {
            Path uploadPath = Paths.get(uploadDir, "profiles");
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
            String extension = "";

            int dotIndex = originalName.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex);
            }

            String fileName = "medecin_" + medecin.getId() + "_" + UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "/uploads/profiles/" + fileName;
            medecin.setPhotoProfilPath(relativePath);
            medecinRepository.save(medecin);

            return relativePath;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo");
        }
    }
}