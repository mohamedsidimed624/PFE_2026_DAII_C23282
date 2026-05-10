package com.onmm.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titre")
    private String titre;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "type")
    private String type;

    @Column(name = "lu")
    private boolean lu = false;

    @Column(name = "lien")
    private String lien;

    @Column(name = "action_requise")
    private boolean actionRequise = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }

    public String getLien() { return lien; }
    public void setLien(String lien) { this.lien = lien; }

    public boolean isActionRequise() { return actionRequise; }
    public void setActionRequise(boolean actionRequise) { this.actionRequise = actionRequise; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
