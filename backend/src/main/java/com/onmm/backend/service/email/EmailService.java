package com.onmm.backend.service.email;

public interface EmailService {

    void sendSubmissionEmail(String to, String nom);

    void sendApprovalEmail(String to, String nom, String activationLink);

    void sendRejectionEmail(String to, String nom, String comment);

}