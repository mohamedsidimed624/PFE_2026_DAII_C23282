package com.onmm.backend.service;

import com.onmm.backend.dto.reclamation.*;

import java.util.List;

public interface ReclamationService {

    ReclamationCreatedResponse createPublicReclamation(CreatePublicReclamationRequest request, String pieceJointePath);

    ReclamationCreatedResponse createMedecinReclamation(String userEmail, CreateMedecinReclamationRequest request, String pieceJointePath);

    List<ReclamationListResponse> getMedecinReclamations(String userEmail);

    List<ReclamationListResponse> getAllReclamations();

    ReclamationDetailResponse getReclamationDetail(Long id);

    ReclamationDetailResponse getMedecinReclamationDetail(Long id, String userEmail);

    void startReclamation(Long id);

    void closeReclamation(Long id, CloseReclamationRequest request);
}