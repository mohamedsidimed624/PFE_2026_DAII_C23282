package com.onmm.backend.service.impl;

import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.service.DemandeAdhesionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class DemandeAdhesionServiceImpl implements DemandeAdhesionService {

    private final DemandeAdhesionRepository demandeAdhesionRepository;

    public DemandeAdhesionServiceImpl(DemandeAdhesionRepository demandeAdhesionRepository) {
        this.demandeAdhesionRepository = demandeAdhesionRepository;
    }

    @Override
    public DemandeAdhesion createDemande(DemandeAdhesion demande) {

        boolean NNIConflit = demandeAdhesionRepository
                .existsByNNIAndStatut(demande.getNNI(), ApplicationStatus.PENDING);

        boolean EmailConflit = demandeAdhesionRepository
                .existsByEmailAndStatut(demande.getEmail(), ApplicationStatus.PENDING);

        boolean TelephoneConflit = demandeAdhesionRepository
                .existsByTelephoneAndStatut(demande.getTelephone(), ApplicationStatus.PENDING);
        if (NNIConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour ce NNI"
            );
        }
        if (EmailConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour ce email"
            );
        }

        if (TelephoneConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour cette numero du telephone"
            );
        }

        demande.setStatut(ApplicationStatus.PENDING);
        demande.setSubmissionDate(LocalDateTime.now());

        return demandeAdhesionRepository.save(demande);
    }

    @Override
    public ResponseEntity<?> checkUnique(String nni, String email, String telephone) {

        Map<String,String> errors = new HashMap<>();

        if(demandeAdhesionRepository.existsByNNIAndStatut(nni, ApplicationStatus.PENDING)){
            errors.put("nni","NNI déjà utilisé");
        }

        if(demandeAdhesionRepository.existsByEmailAndStatut(email, ApplicationStatus.PENDING)){
            errors.put("email","Email déjà utilisé");
        }

        if(demandeAdhesionRepository.existsByTelephoneAndStatut(telephone, ApplicationStatus.PENDING)){
            errors.put("telephone","Téléphone déjà utilisé");
        }

        if(!errors.isEmpty()){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errors);
        }

        return ResponseEntity.ok("OK");
    }


}