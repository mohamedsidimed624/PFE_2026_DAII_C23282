package com.onmm.backend.controller.Admin;

import com.onmm.backend.dto.contenu.*;
import com.onmm.backend.service.Admin.ContenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/contenus")
@RequiredArgsConstructor
public class ContenuAdminController {

    private final ContenuService contenuService;

    @GetMapping
    public Page<ContenuResponseDTO> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return contenuService.getAdminContenus(page, size);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ContenuResponseDTO create(
            @RequestPart("data") ContenuRequestDTO dto,
            @RequestPart("image") MultipartFile image,
            @RequestParam Long userId
    ) {
        return contenuService.create(dto, image, userId);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ContenuResponseDTO update(
            @PathVariable Long id,
            @RequestPart("data") ContenuRequestDTO dto,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return contenuService.update(id, dto, image);
    }

    @PutMapping("/{id}/publish")
    public ContenuResponseDTO publish(@PathVariable Long id) {
        return contenuService.publish(id);
    }

    @PutMapping("/{id}/unpublish")
    public ContenuResponseDTO unpublish(@PathVariable Long id) {
        return contenuService.unpublish(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        contenuService.delete(id);
    }
}