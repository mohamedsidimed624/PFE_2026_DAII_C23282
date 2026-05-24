package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.Admin.AdminDemandeDetailResponse;
import com.onmm.backend.dto.Admin.AdminDemandeResponse;
import com.onmm.backend.dto.Admin.ApproveRequest;
import com.onmm.backend.dto.Admin.RejectRequest;
import com.onmm.backend.entity.enums.SectionOrdre;
import com.onmm.backend.service.Admin.AdminDemandeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/demandes")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminDemandeController {

    private final AdminDemandeService adminService;

    public AdminDemandeController(AdminDemandeService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public List<AdminDemandeResponse> getAllDemandes() {

        return adminService.getAllDemandes();
    }

    @GetMapping("/{id}")
    public AdminDemandeDetailResponse getDemandeDetail(@PathVariable Long id) {
        return adminService.getDemandeDetail(id);
    }

    @PutMapping("/{id}/approve")
    public void approveDemande(@PathVariable Long id,
                               @RequestBody(required = false) ApproveRequest body) {
        SectionOrdre section = (body != null) ? body.getSectionValidee() : null;
        adminService.approveDemande(id, section);
    }

    @PutMapping("/{id}/reject")
    public void rejectDemande(@PathVariable Long id, @RequestBody RejectRequest request) {
        adminService.rejectDemande(id, request.getAdminComment());
    }
}