package com.onmm.backend.service;

import com.onmm.backend.dto.medecin.MedecinProfileResponse;
import com.onmm.backend.dto.medecin.UpdateMedecinProfileRequest;
import org.springframework.web.multipart.MultipartFile;

public interface MedecinService {

    MedecinProfileResponse getMyProfile(String email);

    MedecinProfileResponse updateMyProfile(String email, UpdateMedecinProfileRequest request);

    String updateMyPhoto(String email, MultipartFile file);
}
