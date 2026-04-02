package com.onmm.backend.service.email;

public interface EmailService {

    void sendSubmissionEmail(String to, String nom, String numeroDossier);

    void sendApprovalEmail(String to, String nom, String activationLink);

    void sendRejectionEmail(String to, String nom, String comment);

    void sendSuspensionEmail(String to, String name, String comment);

}