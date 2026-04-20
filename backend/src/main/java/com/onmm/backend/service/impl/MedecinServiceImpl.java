package com.onmm.backend.service.impl;

import com.onmm.backend.dto.medecin.MedecinProfileResponse;
import com.onmm.backend.dto.medecin.UpdateMedecinProfileRequest;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.User;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.UserRepository;
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
import java.util.UUID;

@Service
public class MedecinServiceImpl implements MedecinService {

    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;

    @Value("${upload.dir}")
    private String uploadDir;

    public MedecinServiceImpl(UserRepository userRepository,
                              MedecinRepository medecinRepository) {
        this.userRepository = userRepository;
        this.medecinRepository = medecinRepository;
    }

    @Override
    @Transactional
    public MedecinProfileResponse getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Medecin medecin = medecinRepository.findProfileByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profil médecin introuvable"));

        return mapToResponse(medecin);
    }

    @Override
    @Transactional
    public MedecinProfileResponse updateMyProfile(String email, UpdateMedecinProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Medecin medecin = medecinRepository.findProfileByUserId(user.getId())
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

        if (medecin.getSpecialite() != null) {
            response.setSpecialiteId(medecin.getSpecialite().getId());
            response.setSpecialiteLibelle(medecin.getSpecialite().getLibelle());
        }

        if (medecin.getSousSpecialite() != null) {
            response.setSousSpecialiteId(medecin.getSousSpecialite().getId());
            response.setSousSpecialiteLibelle(medecin.getSousSpecialite().getLibelle());
        }

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

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Medecin medecin = medecinRepository.findByUser(user)
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