package com.onmm.backend.dto.medecin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedecinDocumentDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String typeDocument;
    private String categorie;
    private Long size;
    private String uploadDate;
}
