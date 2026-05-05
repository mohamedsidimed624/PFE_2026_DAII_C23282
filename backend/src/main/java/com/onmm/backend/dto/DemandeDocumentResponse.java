package com.onmm.backend.dto;

import com.onmm.backend.entity.enums.TypeDocument;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DemandeDocumentResponse {

    private Long id;

    private String typeDocument;

    private String categorie;

    private String fileName;

    private String filePath;

    private Long size;

    private LocalDateTime uploadDate;


}
