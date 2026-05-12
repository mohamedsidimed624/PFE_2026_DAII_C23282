package com.onmm.backend.service;

import com.onmm.backend.dto.cotisation.CotisationDto;
import com.onmm.backend.dto.cotisation.InitierPaiementResponse;

import java.util.List;

public interface CotisationService {

    List<CotisationDto> getMyCotisations(String email);

    CotisationDto getCotisationCourante(String email);

    InitierPaiementResponse initierPaiement(String email, Long cotisationId);

    CotisationDto confirmerPaiement(String email, Long cotisationId, String codeTransaction);

    void createAnnualCotisations();

    void sendReminderNotifications();
}
