package com.onmm.backend.service.impl.email;

import com.onmm.backend.service.email.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail-from:}")
    private String mailFrom;

    @Value("${app.contact-email:contact@ordre-medecins.mr}")
    private String contactEmail;

    private final RestClient restClient = RestClient.create();

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private void send(String to, String subject, String text) {
        send(to, subject, text, null);
    }

    private void send(String to, String subject, String text, String replyTo) {
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevoApi(to, subject, text, replyTo);
        } else {
            sendViaSmtp(to, subject, text, replyTo);
        }
    }

    private void sendViaBrevoApi(String to, String subject, String text, String replyTo) {
        String from = (mailFrom != null && !mailFrom.isBlank()) ? mailFrom : "noreply@onmm.mr";

        LinkedHashMap<String, Object> body = new LinkedHashMap<>();
        body.put("sender", Map.of("name", "ONMM", "email", from));
        body.put("to", List.of(Map.of("email", to)));
        body.put("subject", subject);
        body.put("textContent", text);
        if (replyTo != null && !replyTo.isBlank()) {
            body.put("replyTo", Map.of("email", replyTo));
        }

        restClient.post()
                .uri("https://api.brevo.com/v3/smtp/email")
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    private void sendViaSmtp(String to, String subject, String text, String replyTo) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (mailFrom != null && !mailFrom.isBlank()) message.setFrom(mailFrom);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        if (replyTo != null && !replyTo.isBlank()) message.setReplyTo(replyTo);
        mailSender.send(message);
    }

    @Override
    @Async
    public void sendSubmissionEmail(String to, String name, String numeroDossier) {
        send(to, "Demande reçue",
                "Bonjour " + name + ",\n\n" +
                "Votre demande a été reçue avec succès.\n" +
                "Numéro de dossier : " + numeroDossier + "\n" +
                "Veuillez conserver ce numéro pour suivre l'état de votre dossier.\n" +
                "Nous la traiterons bientôt.\n\n" +
                "ONMM");
    }

    @Override
    @Async
    public void sendApprovalEmail(String to, String name, String link) {
        send(to, "Demande approuvée",
                "Bonjour " + name + ",\n\n" +
                "Votre demande a été approuvée.\n" +
                "Veuillez activer votre compte :\n\n" +
                link + "\n\n" +
                "ONMM");
    }

    @Override
    @Async
    public void sendRejectionEmail(String to, String name, String comment) {
        send(to, "Demande rejetée",
                "Bonjour " + name + ",\n\n" +
                "Votre demande a été rejetée.\n" +
                "Raison : " + comment + "\n\n" +
                "ONMM");
    }

    @Override
    @Async
    public void sendSuspensionEmail(String to, String name, String comment) {
        send(to, "Suspension de votre compte médecin",
                "Bonjour " + name + ",\n\n" +
                "Votre compte médecin a été suspendu par l'administration.\n\n" +
                "Motif : " + comment + "\n\n" +
                "Pour toute information complémentaire, veuillez contacter l'administration.\n\n" +
                "ONMM");
    }

    @Override
    @Async
    public void sendPublicReclamationSubmissionEmail(
            String to, String name, String numeroReclamation, String objet) {
        send(to, "Accusé de réception de votre réclamation",
                "Bonjour " + name + ",\n\n" +
                "Votre réclamation a bien été reçue par l'administration.\n\n" +
                "Numéro de réclamation : " + numeroReclamation + "\n" +
                "Objet : " + objet + "\n\n" +
                "Veuillez conserver ce numéro pour toute référence future.\n" +
                "Votre demande sera examinée dans les meilleurs délais.\n\n" +
                "Cordialement,\n" +
                "ONMM");
    }

    @Override
    @Async
    public void sendReclamationClosedEmail(
            String to, String name, String numeroReclamation, String objet, String adminResponse) {
        send(to, "Clôture de votre réclamation",
                "Bonjour " + name + ",\n\n" +
                "Votre réclamation a été clôturée.\n\n" +
                "Numéro de réclamation : " + numeroReclamation + "\n" +
                "Objet : " + objet + "\n\n" +
                "Réponse de l'administration :\n" +
                adminResponse + "\n\n" +
                "Cordialement,\n" +
                "ONMM");
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String name, String resetLink) {
        send(to, "Réinitialisation de votre mot de passe - ONMM",
                "Bonjour " + name + ",\n\n" +
                "Vous avez demandé la réinitialisation de votre mot de passe.\n" +
                "Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :\n\n" +
                resetLink + "\n\n" +
                "Ce lien est valable pendant 1 heure.\n" +
                "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n" +
                "Cordialement,\n" +
                "ONMM");
    }

    @Override
    @Async
    public void sendContactMessage(String fromName, String fromEmail, String fromPhone, String sujet, String messageBody) {
        send(contactEmail, sujet,
                "Nouveau message de contact reçu via le site de l'ONMM.\n\n" +
                "De : " + fromName + "\n" +
                "Email : " + fromEmail + "\n" +
                (fromPhone != null && !fromPhone.isBlank() ? "Téléphone : " + fromPhone + "\n" : "") +
                "\nMessage :\n" + messageBody + "\n\n" +
                "---\nCe message a été envoyé depuis le formulaire de contact du site ONMM.",
                fromEmail);
    }
}
