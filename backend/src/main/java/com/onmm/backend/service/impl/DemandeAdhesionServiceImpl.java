package com.onmm.backend.service.impl;

import com.onmm.backend.dto.DemandeAdhesionRequest;
import com.onmm.backend.entity.DemandeAdhesion;
import com.onmm.backend.entity.enums.ApplicationStatus;
import com.onmm.backend.repository.DemandeAdhesionRepository;
import com.onmm.backend.service.DemandeAdhesionService;
import com.onmm.backend.service.email.EmailService;
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
    private final EmailService emailService;

    public DemandeAdhesionServiceImpl(DemandeAdhesionRepository demandeAdhesionRepository, EmailService emailService) {
        this.demandeAdhesionRepository = demandeAdhesionRepository;
        this.emailService = emailService;
    }

    @Override
    public DemandeAdhesion createDemande(DemandeAdhesionRequest request) {

        boolean NNIConflit = demandeAdhesionRepository
                .existsByNNIAndStatut(request.getNni(), ApplicationStatus.PENDING);

        boolean EmailConflit = demandeAdhesionRepository
                .existsByEmailAndStatut(request.getEmail(), ApplicationStatus.PENDING);

        boolean TelephoneConflit = demandeAdhesionRepository
                .existsByTelephoneAndStatut(request.getTelephone(), ApplicationStatus.PENDING);


        if (NNIConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour ce NNI"
            );
        }

        if (EmailConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour cet email"
            );
        }

        if (TelephoneConflit) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Une demande existe déjà pour ce numéro de téléphone"
            );
        }

        DemandeAdhesion demande = new DemandeAdhesion();

        demande.setNNI(request.getNni());
        demande.setNom(request.getNom());
        demande.setPrenom(request.getPrenom());
        demande.setSexe(request.getSexe());
        demande.setNationalite(request.getNationalite());
        demande.setDateNaissance(request.getDateNaissance());
        demande.setEmail(request.getEmail());
        demande.setTelephone(request.getTelephone());
        demande.setAdresse(request.getAdresse());

        demande.setStatut(ApplicationStatus.PENDING);
        demande.setSubmissionDate(LocalDateTime.now());

        DemandeAdhesion saved = demandeAdhesionRepository.save(demande);

        // Email accusé de réception
        emailService.sendSubmissionEmail(
                saved.getEmail(),
                saved.getNom()
        );

        return saved;
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