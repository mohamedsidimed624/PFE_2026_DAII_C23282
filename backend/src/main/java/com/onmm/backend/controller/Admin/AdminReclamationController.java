package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.reclamation.CloseReclamationRequest;
import com.onmm.backend.dto.reclamation.ReclamationDetailResponse;
import com.onmm.backend.dto.reclamation.ReclamationListResponse;
import com.onmm.backend.service.ReclamationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reclamations")
public class AdminReclamationController {

    private final ReclamationService reclamationService;

    public AdminReclamationController(ReclamationService reclamationService) {
        this.reclamationService = reclamationService;
    }

    @GetMapping
    public List<ReclamationListResponse> getAllReclamations() {
        return reclamationService.getAllReclamations();
    }

    @GetMapping("/{id}")
    public ReclamationDetailResponse getReclamationDetail(@PathVariable Long id) {
        return reclamationService.getReclamationDetail(id);
    }

    @PutMapping("/{id}/start")
    public void startReclamation(@PathVariable Long id) {
        reclamationService.startReclamation(id);
    }

    @PutMapping("/{id}/close")
    public void closeReclamation(@PathVariable Long id,
                                 @Valid @RequestBody CloseReclamationRequest request) {
        reclamationService.closeReclamation(id, request);
    }
}