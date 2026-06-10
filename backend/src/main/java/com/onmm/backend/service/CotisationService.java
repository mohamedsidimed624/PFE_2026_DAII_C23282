//package com.onmm.backend.service;
//
//import com.onmm.backend.dto.cotisation.BankilyPaymentResult;
//import com.onmm.backend.dto.cotisation.CotisationDto;
//import com.onmm.backend.dto.cotisation.InitierPaiementResponse;
//import com.onmm.backend.dto.cotisation.PaiementHistoriqueDto;
//import com.onmm.backend.dto.cotisation.ReceiptDto;
//
//import java.util.List;
//
//public interface CotisationService {
//
//    List<CotisationDto> getMyCotisations(String email);
//
//    CotisationDto getCotisationCourante(String email);
//
//    InitierPaiementResponse initierPaiement(String email, Long cotisationId);
//
//    BankilyPaymentResult confirmerPaiement(String email, Long cotisationId, String clientPhone, String passcode);
//
//    List<PaiementHistoriqueDto> getHistoriquePaiements(String email);
//
//    ReceiptDto getReceipt(String email, Long cotisationId);
//
//    void createAnnualCotisations();
//
//    void sendReminderNotifications();
//}
