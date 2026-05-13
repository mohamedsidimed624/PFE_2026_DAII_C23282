package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.contenu.*;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface ContenuService {

    ContenuResponseDTO create(ContenuRequestDTO dto, MultipartFile image, Long userId);

    ContenuResponseDTO update(Long id, ContenuRequestDTO dto, MultipartFile image);

    void delete(Long id);

    ContenuResponseDTO publish(Long id);

    ContenuResponseDTO unpublish(Long id);

    Page<ContenuResponseDTO> getAdminContenus(int page, int size);

    Page<ContenuResponseDTO> getPublicContenus(Long categorieId, int page, int size);

    void expireContenus();

    Page<ContenuResponseDTO> getMedecinContenus(Long medecinId, int page, int size);
}