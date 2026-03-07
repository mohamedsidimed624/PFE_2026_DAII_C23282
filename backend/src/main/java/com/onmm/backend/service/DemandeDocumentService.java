package com.onmm.backend.service;

import com.onmm.backend.dto.DemandeDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

public interface DemandeDocumentService {

    DemandeDocumentResponse uploadDocument(
            Long demandeId,
            String typeDocument,
            String categorie,
            MultipartFile file
    );
}
