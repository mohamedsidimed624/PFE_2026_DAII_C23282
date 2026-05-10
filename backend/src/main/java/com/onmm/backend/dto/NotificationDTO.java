package com.onmm.backend.dto;

import java.time.LocalDateTime;

public class NotificationDTO {

    private Long id;
    private String titre;
    private String message;
    private String type;
    private boolean lu;
    private String lien;
    private boolean actionRequise;
    private LocalDateTime createdAt;

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
