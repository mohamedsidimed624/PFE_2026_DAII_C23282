package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.Admin.specialite.AdminSousSpecialiteResponse;
import com.onmm.backend.dto.Admin.specialite.SousSpecialiteRequest;
import com.onmm.backend.service.Admin.AdminSousSpecialiteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminSousSpecialiteController {

    private final AdminSousSpecialiteService adminSousSpecialiteService;

    public AdminSousSpecialiteController(AdminSousSpecialiteService adminSousSpecialiteService) {
        this.adminSousSpecialiteService = adminSousSpecialiteService;
    }

    @GetMapping("/specialites/{specialiteId}/sous-specialites")
    public List<AdminSousSpecialiteResponse> getSousSpecialitesBySpecialite(@PathVariable Long specialiteId) {
        return adminSousSpecialiteService.getSousSpecialitesBySpecialite(specialiteId);
    }

    @PostMapping("/sous-specialites")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminSousSpecialiteResponse createSousSpecialite(@Valid @RequestBody SousSpecialiteRequest request) {
        return adminSousSpecialiteService.createSousSpecialite(request);
    }

    @PutMapping("/sous-specialites/{id}")
    public AdminSousSpecialiteResponse updateSousSpecialite(
            @PathVariable Long id,
            @Valid @RequestBody SousSpecialiteRequest request
    ) {
        return adminSousSpecialiteService.updateSousSpecialite(id, request);
    }

    @PatchMapping("/sous-specialites/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void toggleSousSpecialiteStatus(@PathVariable Long id) {
        adminSousSpecialiteService.toggleSousSpecialiteStatus(id);
    }

    @DeleteMapping("/sous-specialites/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSousSpecialite(@PathVariable Long id) {
        adminSousSpecialiteService.deleteSousSpecialite(id);
    }

    @GetMapping("/sous-specialites/check-code")
    public boolean checkSousSpecialiteCodeAvailable(
            @RequestParam String code,
            @RequestParam(required = false) Long excludeId
    ) {
        return adminSousSpecialiteService.isCodeAvailable(code, excludeId);
    }

    @GetMapping("/sous-specialites/check-libelle")
    public boolean checkSousSpecialiteLibelleAvailable(
            @RequestParam String libelle,
            @RequestParam Long specialiteId,
            @RequestParam(required = false) Long excludeId
    ) {
        return adminSousSpecialiteService.isLibelleAvailable(libelle, specialiteId, excludeId);
    }
}