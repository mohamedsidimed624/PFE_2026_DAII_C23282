package com.onmm.backend.service.impl.email;

import com.onmm.backend.service.email.EmailService;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendSubmissionEmail(String to, String nom) {

        System.out.println("EMAIL SUBMISSION envoyé à " + to);

    }

    @Override
    public void sendApprovalEmail(String to, String nom, String link) {

        System.out.println("EMAIL APPROVAL envoyé à " + to);

    }

    @Override
    public void sendRejectionEmail(String to, String nom, String comment) {

        System.out.println("EMAIL REJECT envoyé à " + to);

    }
}