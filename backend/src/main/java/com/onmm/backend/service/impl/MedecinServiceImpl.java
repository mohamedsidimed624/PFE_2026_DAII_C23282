package com.onmm.backend.service.impl;

import com.onmm.backend.dto.medecin.MedecinProfileResponse;
import com.onmm.backend.entity.Medecin;
import com.onmm.backend.entity.User;
import com.onmm.backend.repository.MedecinRepository;
import com.onmm.backend.repository.UserRepository;
import com.onmm.backend.service.MedecinService;
import org.springframework.stereotype.Service;

@Service
public class MedecinServiceImpl implements MedecinService {

    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;

    public MedecinServiceImpl(UserRepository userRepository,
                              MedecinRepository medecinRepository) {
        this.userRepository = userRepository;
        this.medecinRepository = medecinRepository;
    }

    @Override
    public MedecinProfileResponse getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Medecin medecin = medecinRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profil médecin introuvable"));

        MedecinProfileResponse response = new MedecinProfileResponse();
        response.setId(medecin.getId());
        response.setNom(medecin.getNom());
        response.setPrenom(medecin.getPrenom());
        response.setEmail(medecin.getEmail());
        response.setTelephone(medecin.getTelephone());
        response.setNni(medecin.getNni());
        response.setSexe(medecin.getSexe());
        response.setNationalite(medecin.getNationalite());
        response.setAdresse(medecin.getAdresse());
        response.setNumeroInscription(medecin.getNumeroInscription());
        response.setSpecialite(medecin.getSpecialite());
        response.setStatut(medecin.getStatut());

        return response;
    }
}