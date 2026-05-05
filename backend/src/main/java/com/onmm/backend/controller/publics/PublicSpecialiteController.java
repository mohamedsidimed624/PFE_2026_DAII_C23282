package com.onmm.backend.controller.publics;

import com.onmm.backend.dto.publics.PublicSpecialiteResponse;
import com.onmm.backend.service.publics.PublicSpecialiteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/specialites")
public class PublicSpecialiteController {

    private final PublicSpecialiteService publicSpecialiteService;

    public PublicSpecialiteController(PublicSpecialiteService publicSpecialiteService) {
        this.publicSpecialiteService = publicSpecialiteService;
    }

    @GetMapping
    public List<PublicSpecialiteResponse> getActiveSpecialites() {
        return publicSpecialiteService.getActiveSpecialites();
    }
}