package com.onmm.backend.service;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.dto.demande.RepriseDemandeResponse;
import com.onmm.backend.dto.demande.SuiviDossierResponse;
import com.onmm.backend.entity.DemandeAdhesion;
import org.springframework.http.ResponseEntity;

public interface DemandeAdhesionService {

    DemandeAdhesion createDemande(DemandeAdhesionRequest request);
    ResponseEntity<?> checkUnique(String nni, String email, String telephone);
    SuiviDossierResponse getSuiviByNumeroDossier(String numeroDossier);
    RepriseDemandeResponse getDemandePourReprise(String numeroDossier);

}