package com.onmm.backend.service;

import com.onmm.backend.dto.medecin.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MedecinService {

    MedecinProfileResponse getMyProfile(String email);

    MedecinProfileResponse updateMyProfile(String email, UpdateMedecinProfileRequest request);

    String updateMyPhoto(String email, MultipartFile file);

    MedecinEducationDto addEducation(String email, AddMedecinEducationRequest request);

    void deleteEducation(String email, Long educationId);

    List<MedecinEducationDto> getEducations(String email);

    MedecinExperienceDto addExperience(String email, AddMedecinExperienceRequest request);

    void deleteExperience(String email, Long experienceId);

    List<MedecinExperienceDto> getExperiences(String email);

    MedecinDocumentDto uploadDocument(String email, String typeDocument, String categorie, MultipartFile file);

    void deleteDocument(String email, Long documentId);

    List<MedecinDocumentDto> getDocuments(String email);

    byte[] generateCertificat(String email);

    void changePassword(String email, ChangePasswordRequest request);
}
