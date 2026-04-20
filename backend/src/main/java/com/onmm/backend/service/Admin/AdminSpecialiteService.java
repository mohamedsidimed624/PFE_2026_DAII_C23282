package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteDetailResponse;
import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteResponse;
import com.onmm.backend.dto.Admin.specialite.SpecialiteRequest;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminSpecialiteService {

//    List<AdminSpecialiteResponse> getAllSpecialites(String search, Boolean active);
    AdminSpecialiteDetailResponse getSpecialiteById(Long id);
    AdminSpecialiteResponse createSpecialite(SpecialiteRequest request);
    AdminSpecialiteResponse updateSpecialite(Long id, SpecialiteRequest request);
    void toggleSpecialiteStatus(Long id);
    void deleteSpecialite(Long id);
    boolean isCodeAvailable(String code, Long excludeId);
    boolean isLibelleAvailable(String libelle, Long excludeId);
    Page<AdminSpecialiteResponse> getAllSpecialites(
            int page,
            int size,
            String search,
            Boolean active,
            String sortBy
    );
}
