package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteDetailResponse;
import com.onmm.backend.dto.Admin.specialite.AdminSpecialiteResponse;
import com.onmm.backend.dto.Admin.specialite.SpecialiteRequest;
import com.onmm.backend.service.Admin.AdminSpecialiteService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/specialites")
public class AdminSpecialiteController {

    private final AdminSpecialiteService adminSpecialiteService;

    public AdminSpecialiteController(AdminSpecialiteService adminSpecialiteService) {
        this.adminSpecialiteService = adminSpecialiteService;
    }

//    @GetMapping
//    public List<AdminSpecialiteResponse> getAllSpecialites(
//            @RequestParam(required = false) String search,
//            @RequestParam(required = false) Boolean active
//    ) {
//        return adminSpecialiteService.getAllSpecialites(search, active);
//    }

    @GetMapping("/{id}")
    public AdminSpecialiteDetailResponse getSpecialiteById(@PathVariable Long id) {
        return adminSpecialiteService.getSpecialiteById(id);
    }

    @GetMapping("/check-code")
    public boolean checkCodeAvailable(
            @RequestParam String code,
            @RequestParam(required = false) Long excludeId
    ) {
        return adminSpecialiteService.isCodeAvailable(code, excludeId);
    }

    @GetMapping("/check-libelle")
    public boolean checkLibelleAvailable(
            @RequestParam String libelle,
            @RequestParam(required = false) Long excludeId
    ) {
        return adminSpecialiteService.isLibelleAvailable(libelle, excludeId);
    }

    @GetMapping
    public Page<AdminSpecialiteResponse> getAllSpecialites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String sortBy

    ) {
        return adminSpecialiteService.getAllSpecialites(page, size, search, active, sortBy);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminSpecialiteResponse createSpecialite(@RequestBody SpecialiteRequest request) {
        return adminSpecialiteService.createSpecialite(request);
    }

    @PutMapping("/{id}")
    public AdminSpecialiteResponse updateSpecialite(
            @PathVariable Long id,
            @RequestBody SpecialiteRequest request
    ) {
        return adminSpecialiteService.updateSpecialite(id, request);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void toggleSpecialiteStatus(@PathVariable Long id) {
        adminSpecialiteService.toggleSpecialiteStatus(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSpecialite(@PathVariable Long id) {
        adminSpecialiteService.deleteSpecialite(id);
    }
}