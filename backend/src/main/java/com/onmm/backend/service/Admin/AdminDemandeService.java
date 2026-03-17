package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.Admin.AdminDemandeDetailResponse;
import com.onmm.backend.dto.Admin.AdminDemandeResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AdminDemandeService {

    List<AdminDemandeResponse> getAllDemandes();

    AdminDemandeDetailResponse getDemandeDetail(Long id);

    void approveDemande(Long id);

    void rejectDemande(Long id, String comment);
}
