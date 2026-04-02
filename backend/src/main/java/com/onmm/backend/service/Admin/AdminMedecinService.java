package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.Admin.AdminMedecinDetailResponse;
import com.onmm.backend.dto.Admin.AdminMedecinListResponse;

import java.util.List;

public interface AdminMedecinService {

    List<AdminMedecinListResponse> getAllMedecins();

    AdminMedecinDetailResponse getMedecinById(Long id);

    void suspendMedecin(Long id, String adminComment);

    void deleteMedecin(Long id);

    void reactivateMedecin(Long id);

}
