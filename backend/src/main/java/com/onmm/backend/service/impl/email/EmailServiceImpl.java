package com.onmm.backend.service.impl.email;

import com.onmm.backend.service.email.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public void sendSubmissionEmail(String to, String name) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Demande reçue");
        message.setText(
                "Bonjour " + name + ",\n\n" +
                        "Votre demande a été reçue avec succès.\n" +
                        "Nous la traiterons bientôt.\n\n" +
                        "ONMM"
        );

        mailSender.send(message);
    }

    @Override
    @Async
    public void sendApprovalEmail(String to, String name, String link) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Demande approuvée");

        message.setText(
                "Bonjour " + name + ",\n\n" +
                        "Votre demande a été approuvée.\n" +
                        "Veuillez activer votre compte :\n\n" +
                        link + "\n\n" +
                        "ONMM"
        );

        mailSender.send(message);
    }

    @Override
    @Async
    public void sendRejectionEmail(String to, String name, String comment) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Demande rejetée");

        message.setText(
                "Bonjour " + name + ",\n\n" +
                        "Votre demande a été rejetée.\n" +
                        "Raison : " + comment + "\n\n" +
                        "ONMM"
        );

        mailSender.send(message);
    }
}