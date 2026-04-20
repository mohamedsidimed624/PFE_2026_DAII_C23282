package com.onmm.backend.dto.reference;

import lombok.Data;

@Data
public class ReferenceSousSpecialiteResponse {

    private Long id;

    private String code;

    private String libelle;

    private Long specialiteId;
}
