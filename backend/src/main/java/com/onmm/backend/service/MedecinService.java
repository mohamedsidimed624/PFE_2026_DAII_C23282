package com.onmm.backend.service;

import com.onmm.backend.dto.medecin.MedecinProfileResponse;

public interface MedecinService {

    MedecinProfileResponse getMyProfile(String email);
}
