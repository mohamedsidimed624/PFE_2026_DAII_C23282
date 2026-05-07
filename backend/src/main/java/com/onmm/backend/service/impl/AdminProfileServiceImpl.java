package com.onmm.backend.service.impl;

import com.onmm.backend.dto.Admin.AdminProfileResponse;
import com.onmm.backend.dto.Admin.ChangePasswordRequest;
import com.onmm.backend.dto.Admin.UpdateAdminProfileRequest;
import com.onmm.backend.entity.Admin;
import com.onmm.backend.entity.User;
import com.onmm.backend.repository.AdminRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.Admin.AdminProfileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Transactional
public class AdminProfileServiceImpl implements AdminProfileService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public AdminProfileServiceImpl(AdminRepository adminRepository,
                                   UserRepository userRepository,
                                   PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AdminProfileResponse getMyProfile(String email) {
        Admin admin = findByEmail(email);
        return toResponse(admin);
    }

    @Override
    public AdminProfileResponse updateMyProfile(String email, UpdateAdminProfileRequest request) {
        Admin admin = findByEmail(email);

        if (request.getNomComplet() != null) {
            admin.setNomComplet(request.getNomComplet());
        }
        if (request.getTelephone() != null) {
            admin.setTelephone(request.getTelephone());
        }

        adminRepository.save(admin);
        return toResponse(admin);
    }

    @Override
    public String updateMyPhoto(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Aucun fichier envoyé");
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/jpeg")
                        && !contentType.equals("image/png")
                        && !contentType.equals("image/gif"))) {
            throw new RuntimeException("Format non supporté (JPG, PNG, GIF uniquement)");
        }

        Admin admin = findByEmail(email);

        try {
            Path uploadPath = Paths.get(uploadDir, "profiles");
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
            String extension = "";
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0) extension = originalName.substring(dot);

            String fileName = "admin_" + admin.getId() + "_" + UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "/uploads/profiles/" + fileName;
            admin.setPhotoProfilPath(relativePath);
            adminRepository.save(admin);

            return relativePath;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement de la photo");
        }
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        Admin admin = findByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new RuntimeException("Le nouveau mot de passe doit contenir au moins 8 caractères");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        adminRepository.save(admin);
    }

    /* ── helpers ── */

    private Admin findByEmail(String email) {
        return adminRepository.findByEmail(email).orElseGet(() -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + email));
            adminRepository.insertAdminRow(user.getId());
            return adminRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Erreur création profil admin"));
        });
    }

    private AdminProfileResponse toResponse(Admin admin) {
        AdminProfileResponse r = new AdminProfileResponse();
        r.setId(admin.getId());
        r.setNomComplet(admin.getNomComplet());
        r.setEmail(admin.getEmail());
        r.setTelephone(admin.getTelephone());
        r.setPhotoProfilPath(admin.getPhotoProfilPath());
        r.setDateCreation(
                admin.getDateCreation() != null
                        ? admin.getDateCreation().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                        : null
        );
        return r;
    }
}
