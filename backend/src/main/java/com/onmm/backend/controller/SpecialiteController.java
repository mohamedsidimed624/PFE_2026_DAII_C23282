package com.onmm.backend.controller;

import com.onmm.backend.dto.SpecialiteResponse;
import com.onmm.backend.dto.SousSpecialiteResponse;
import com.onmm.backend.service.SpecialiteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference")
public class SpecialiteController {

    private final SpecialiteService specialiteService;

    public SpecialiteController(SpecialiteService specialiteService) {
        this.specialiteService = specialiteService;
    }

    @GetMapping("/specialites")
    public List<SpecialiteResponse> getSpecialites() {
        return specialiteService.getAllActiveSpecialites();
    }

    @GetMapping("/specialites/{id}/sous-specialites")
    public List<SousSpecialiteResponse> getSousSpecialites(@PathVariable Long id) {
        return specialiteService.getSousSpecialitesBySpecialite(id);
    }
}