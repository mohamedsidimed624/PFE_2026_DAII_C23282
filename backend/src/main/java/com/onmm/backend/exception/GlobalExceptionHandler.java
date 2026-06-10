package com.onmm.backend.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * ResponseStatusException — levée intentionnellement dans les services.
     * Le message métier (ex: "Médecin introuvable") est exposé car il est délibéré.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
        String message = ex.getReason() != null ? ex.getReason() : "Erreur";
        log.warn("[HTTP {}] {}", ex.getStatusCode().value(), message);
        return ResponseEntity.status(ex.getStatusCode())
                .body(new ErrorResponse(ex.getStatusCode().value(), message));
    }

    /**
     * AccessDeniedException — rôle insuffisant.
     * Message générique, aucun détail d'infrastructure.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("[403] Accès refusé : {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse(403, "Accès refusé."));
    }

    /**
     * AuthenticationException — token absent ou invalide.
     * Message générique, aucun détail sur la structure interne.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        log.warn("[401] Authentification échouée : {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "Authentification requise."));
    }

    /**
     * MethodArgumentNotValidException — validation @Valid échouée.
     * Retourne la liste structurée des champs invalides, sans détail technique.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach((FieldError fe) ->
                errors.put(fe.getField(), fe.getDefaultMessage())
        );
        log.warn("[400] Validation échouée : {}", errors);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("message", "Données invalides");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * JSON malformé dans le body de la requête.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        log.warn("[400] Corps de requête invalide : {}", ex.getClass().getSimpleName());
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Le corps de la requête est invalide ou malformé."));
    }

    /**
     * Mauvais type de paramètre dans l'URL (ex: /elections/abc au lieu de /elections/42).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String type = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valide";
        String message = "Paramètre invalide : '" + ex.getName() + "' doit être de type " + type;
        log.warn("[400] Type mismatch : {}", message);
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, message));
    }

    /**
     * Fichier uploadé dépasse spring.servlet.multipart.max-file-size.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("[413] Fichier trop volumineux");
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ErrorResponse(413, "Le fichier dépasse la taille maximale autorisée (10 Mo)."));
    }

    /**
     * Violation de contrainte Bean Validation hors @RequestBody.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v ->
                errors.put(v.getPropertyPath().toString(), v.getMessage())
        );
        log.warn("[400] Constraint violation : {}", errors);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("message", "Données invalides");
        body.put("errors", errors);
        return ResponseEntity.badRequest().body(body);
    }

    /**
     * IllegalStateException — erreur de configuration (ex: JWT secret absent).
     * Ne pas exposer le détail de configuration au client.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        log.error("[500] Erreur de configuration : {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Erreur de configuration du serveur."));
    }

    /**
     * RuntimeException — exceptions non typées dans les services.
     * Dans ce projet elles contiennent des messages métier intentionnels → exposés.
     * La stack trace est loguée côté serveur, jamais envoyée au client.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
        log.warn("[500] RuntimeException : {}", ex.getMessage(), ex);
        String clientMessage = ex.getMessage() != null
                ? ex.getMessage()
                : "Une erreur interne est survenue.";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, clientMessage));
    }

    /**
     * Fallback absolu — toute exception non catchée par les handlers précédents.
     * Message générique, log complet côté serveur.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("[500] Exception inattendue : {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(500, "Une erreur interne est survenue."));
    }
}
