package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.Admin.AdminMedecinDetailResponse;
import com.onmm.backend.dto.Admin.AdminMedecinListResponse;
import com.onmm.backend.dto.Admin.SuspendMedecinRequest;
import com.onmm.backend.service.Admin.AdminMedecinService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/medecins")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminMedecinController {

    private final AdminMedecinService adminMedecinService;

    public AdminMedecinController(AdminMedecinService adminMedecinService) {
        this.adminMedecinService = adminMedecinService;
    }

    @GetMapping
    public List<AdminMedecinListResponse> getAllMedecins() {
        return adminMedecinService.getAllMedecins();
    }

    @GetMapping("/{id}")
    public AdminMedecinDetailResponse getMedecinById(@PathVariable Long id) {
        return adminMedecinService.getMedecinById(id);
    }

    @PutMapping("/{id}/suspend")
    public void suspendMedecin(@PathVariable Long id, @RequestBody SuspendMedecinRequest request) {
        adminMedecinService.suspendMedecin(id, request.getAdminComment());
    }

    @DeleteMapping("/{id}")
    public void deleteMedecin(@PathVariable Long id) {
        adminMedecinService.deleteMedecin(id);
    }

    @PutMapping("/{id}/reactivate")
    public void reactivateMedecin(@PathVariable Long id) {
        adminMedecinService.reactivateMedecin(id);
    }
}