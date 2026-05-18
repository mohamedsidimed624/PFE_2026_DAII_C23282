package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.sondage.*;
import com.onmm.backend.entity.UserPrincipal;
import com.onmm.backend.service.Admin.SondageService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/sondages")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminSondageController {

    private final SondageService sondageService;

    public AdminSondageController(SondageService sondageService) {
        this.sondageService = sondageService;
    }

    private String currentEmail(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getEmail();
    }

    @GetMapping
    public Page<SondageListDto> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String statut,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        System.out.println(">>> ADMIN SONDAGES CONTROLLER APPELÉ");
        return sondageService.getAllSondages(type, statut, page, size);
    }

    @GetMapping("/{id}")
    public SondageDetailDto getById(@PathVariable Long id) {
        return sondageService.getSondageById(id);
    }

    @PostMapping
    public ResponseEntity<SondageDetailDto> create(
            @RequestBody SondageCreateRequest req,
            Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sondageService.createSondage(req, currentEmail(auth)));
    }

    @PutMapping("/{id}")
    public SondageDetailDto update(@PathVariable Long id, @RequestBody SondageCreateRequest req) {
        return sondageService.updateSondage(id, req);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<Void> publish(
            @PathVariable Long id,
            @RequestBody(required = false) PublishRequest req
    ) {
        sondageService.publishSondage(
                id,
                req != null ? req.getDateDebut() : null,
                req != null ? req.getDateFin() : null
        );
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Void> close(@PathVariable Long id) {
        sondageService.closeSondage(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Void> archive(@PathVariable Long id) {
        sondageService.archiveSondage(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sondageService.deleteSondage(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    public SondageStatsDto getStats(@PathVariable Long id) {
        return sondageService.getSondageStats(id);
    }
}
