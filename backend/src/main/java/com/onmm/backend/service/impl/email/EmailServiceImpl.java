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
    public void sendSubmissionEmail(String to, String name, String numeroDossier) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Demande reçue");
        message.setText(
                "Bonjour " + name + ",\n\n" +
                        "Votre demande a été reçue avec succès.\n" +
                        "Numéro de dossier : " + numeroDossier + "\n" +
                        "Veuillez conserver ce numéro pour suivre l’état de votre dossier.\n" +
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

    @Override
    @Async
    public void sendSuspensionEmail(String to, String name, String comment) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Suspension de votre compte médecin");
        message.setText(
                "Bonjour " + name + ",\n\n" +
                        "Votre compte médecin a été suspendu par l’administration.\n\n" +
                        "Motif : " + comment + "\n\n" +
                        "Pour toute information complémentaire, veuillez contacter l’administration.\n\n" +
                        "ONMM"
        );

        mailSender.send(message);
    }

    @Override
    @Async
    public void sendPublicReclamationSubmissionEmail(
            String to,
            String name,
            String numeroReclamation,
            String objet
    ) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Accusé de réception de votre réclamation");
        message.setText(
                "Bonjour " + name + ",\n\n" +
                        "Votre réclamation a bien été reçue par l’administration.\n\n" +
                        "Numéro de réclamation : " + numeroReclamation + "\n" +
                        "Objet : " + objet + "\n\n" +
                        "Veuillez conserver ce numéro pour toute référence future.\n" +
                        "Votre demande sera examinée dans les meilleurs délais.\n\n" +
                        "Cordialement,\n" +
                        "ONMM"
        );

        mailSender.send(message);
    }

    @Override
    @Async
    public void sendReclamationClosedEmail(
            String to,
            String name,
            String numeroReclamation,
            String objet,
            String adminResponse
    ) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Clôture de votre réclamation");
        message.setText(
                "Bonjour " + name + ",\n\n" +
                        "Votre réclamation a été clôturée.\n\n" +
                        "Numéro de réclamation : " + numeroReclamation + "\n" +
                        "Objet : " + objet + "\n\n" +
                        "Réponse de l’administration :\n" +
                        adminResponse + "\n\n" +
                        "Cordialement,\n" +
                        "ONMM"
        );

        mailSender.send(message);
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String name, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Réinitialisation de votre mot de passe - ONMM");
        message.setText(
                "Bonjour " + name + ",\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe.\n" +
                "Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :\n\n" +
                resetLink + "\n\n" +
                "Ce lien est valable pendant 1 heure.\n" +
                "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n" +
                "Cordialement,\n" +
                "ONMM"
        );
        mailSender.send(message);
    }
}