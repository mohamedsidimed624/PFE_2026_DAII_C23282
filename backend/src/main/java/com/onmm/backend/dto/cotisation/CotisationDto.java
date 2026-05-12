package com.onmm.backend.dto.cotisation;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CotisationDto {
    private Long id;
    private Integer annee;
    private BigDecimal montant;
    private String statut;
    private String dateEcheance;
    private String datePaiement;
    private String referenceBankily;
    private Long joursRestants;
}
