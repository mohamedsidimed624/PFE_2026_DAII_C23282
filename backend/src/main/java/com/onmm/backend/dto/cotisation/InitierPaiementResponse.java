package com.onmm.backend.dto.cotisation;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class InitierPaiementResponse {
    private Long cotisationId;
    private String codeTransaction;
    private String referenceBankily;
    private BigDecimal montant;
    private String message;
}
