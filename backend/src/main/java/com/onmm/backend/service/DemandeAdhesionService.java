package com.onmm.backend.service;

import com.onmm.backend.entity.DemandeAdhesion;
import org.springframework.http.ResponseEntity;

public interface DemandeAdhesionService {

    DemandeAdhesion createDemande(DemandeAdhesion demande);
    ResponseEntity<?> checkUnique(String nni, String email, String telephone);

}