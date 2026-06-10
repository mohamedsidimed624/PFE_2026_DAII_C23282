package com.onmm.backend.controller.publics;

import com.onmm.backend.dto.contact.ContactMessageRequest;
import com.onmm.backend.service.email.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/contact")
public class PublicContactController {

    private final EmailService emailService;

    public PublicContactController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<Void> sendContactMessage(@Valid @RequestBody ContactMessageRequest request) {
        emailService.sendContactMessage(
                request.getNom(),
                request.getEmail(),
                request.getTelephone(),
                request.getSujet(),
                request.getMessage()
        );
        return ResponseEntity.ok().build();
    }
}
