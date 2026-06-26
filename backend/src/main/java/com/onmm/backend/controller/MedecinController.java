package com.onmm.backend.controller;

import com.onmm.backend.dto.medecin.*;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.MedecinService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medecin")
public class MedecinController {

    private final MedecinService medecinService;

    public MedecinController(MedecinService medecinService) {
        this.medecinService = medecinService;
    }

    private String currentEmail(Authentication auth) {
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return principal.getUser().getEmail();
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public MedecinProfileResponse getMyProfile(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return medecinService.getMyProfile(principal.getUser().getEmail());
    }

    @PutMapping("/me")
    public ResponseEntity<MedecinProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateMedecinProfileRequest request
    ) {
        return ResponseEntity.ok(medecinService.updateMyProfile(currentEmail(authentication), request));
    }

    @PostMapping("/me/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        String photoPath = medecinService.updateMyPhoto(currentEmail(authentication), file);
        Map<String, String> response = new HashMap<>();
        response.put("photoProfilPath", photoPath);
        return ResponseEntity.ok(response);
    }

    // ── Educations ────────────────────────────────────────────────────────────

    @GetMapping("/me/educations")
    public List<MedecinEducationDto> getEducations(Authentication authentication) {
        return medecinService.getEducations(currentEmail(authentication));
    }

    @PostMapping("/me/educations")
    public ResponseEntity<MedecinEducationDto> addEducation(
            Authentication authentication,
            @RequestBody AddMedecinEducationRequest request
    ) {
        return ResponseEntity.ok(medecinService.addEducation(currentEmail(authentication), request));
    }

    @DeleteMapping("/me/educations/{id}")
    public ResponseEntity<Void> deleteEducation(
            Authentication authentication,
            @PathVariable Long id
    ) {
        medecinService.deleteEducation(currentEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    // ── Experiences ───────────────────────────────────────────────────────────

    @GetMapping("/me/experiences")
    public List<MedecinExperienceDto> getExperiences(Authentication authentication) {
        return medecinService.getExperiences(currentEmail(authentication));
    }

    @PostMapping("/me/experiences")
    public ResponseEntity<MedecinExperienceDto> addExperience(
            Authentication authentication,
            @RequestBody AddMedecinExperienceRequest request
    ) {
        return ResponseEntity.ok(medecinService.addExperience(currentEmail(authentication), request));
    }

    @DeleteMapping("/me/experiences/{id}")
    public ResponseEntity<Void> deleteExperience(
            Authentication authentication,
            @PathVariable Long id
    ) {
        medecinService.deleteExperience(currentEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    // ── Documents ─────────────────────────────────────────────────────────────

    @GetMapping("/me/documents")
    public List<MedecinDocumentDto> getDocuments(Authentication authentication) {
        return medecinService.getDocuments(currentEmail(authentication));
    }

    @PostMapping("/me/documents")
    public ResponseEntity<MedecinDocumentDto> uploadDocument(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "typeDocument", defaultValue = "AUTRE") String typeDocument,
            @RequestParam(value = "categorie", defaultValue = "AUTRE") String categorie
    ) {
        return ResponseEntity.ok(
                medecinService.uploadDocument(currentEmail(authentication), typeDocument, categorie, file)
        );
    }

    @DeleteMapping("/me/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            Authentication authentication,
            @PathVariable Long id
    ) {
        medecinService.deleteDocument(currentEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }

    // ── Certificate ───────────────────────────────────────────────────────────

    @GetMapping(value = "/me/certificat", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadCertificat(Authentication authentication) {
        byte[] pdf = medecinService.generateCertificat(currentEmail(authentication));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "certificat-onmm.pdf");
        headers.setContentLength(pdf.length);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    // ── Sécurité ──────────────────────────────────────────────────────────────

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        medecinService.changePassword(currentEmail(authentication), request);
        return ResponseEntity.ok().build();
    }
}
