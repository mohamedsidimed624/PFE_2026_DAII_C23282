package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.Admin.AdminProfileResponse;
import com.onmm.backend.dto.Admin.ChangePasswordRequest;
import com.onmm.backend.dto.Admin.UpdateAdminProfileRequest;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.Admin.AdminProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/profile")
public class AdminProfileController {

    private final AdminProfileService adminProfileService;

    public AdminProfileController(AdminProfileService adminProfileService) {
        this.adminProfileService = adminProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<AdminProfileResponse> getMyProfile(Authentication authentication) {
        String email = ((UserPrincipal) authentication.getPrincipal()).getUsername();
        return ResponseEntity.ok(adminProfileService.getMyProfile(email));
    }

    @PutMapping("/me")
    public ResponseEntity<AdminProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateAdminProfileRequest request) {
        String email = ((UserPrincipal) authentication.getPrincipal()).getUsername();
        return ResponseEntity.ok(adminProfileService.updateMyProfile(email, request));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String email = ((UserPrincipal) authentication.getPrincipal()).getUsername();
        String path = adminProfileService.updateMyPhoto(email, file);
        return ResponseEntity.ok(Map.of("photoProfilPath", path));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = ((UserPrincipal) authentication.getPrincipal()).getUsername();
        adminProfileService.changePassword(email, request);
        return ResponseEntity.ok().build();
    }
}
