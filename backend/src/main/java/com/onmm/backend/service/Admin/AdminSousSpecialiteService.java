package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.Admin.specialite.AdminSousSpecialiteResponse;
import com.onmm.backend.dto.Admin.specialite.SousSpecialiteRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminSousSpecialiteService {

    List<AdminSousSpecialiteResponse> getSousSpecialitesBySpecialite(Long specialiteId);
    AdminSousSpecialiteResponse createSousSpecialite(SousSpecialiteRequest request);
    AdminSousSpecialiteResponse updateSousSpecialite(Long id, SousSpecialiteRequest request);
    void toggleSousSpecialiteStatus(Long id);
    void deleteSousSpecialite(Long id);
    boolean isCodeAvailable(String code, Long excudeId);
    boolean isLibelleAvailable(String libelle, Long specialiteId, Long excludeId);


}
