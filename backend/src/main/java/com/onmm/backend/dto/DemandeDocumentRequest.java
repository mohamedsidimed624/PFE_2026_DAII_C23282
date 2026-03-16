package com.onmm.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DemandeDocumentRequest {

    private List<String> diplomes;
    private List<String> certificats;
    private List<String> autres;

}