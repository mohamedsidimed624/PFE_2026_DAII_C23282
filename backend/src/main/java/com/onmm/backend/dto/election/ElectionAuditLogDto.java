package com.onmm.backend.dto.election;

import java.time.LocalDateTime;

public class ElectionAuditLogDto {

    private Long id;
    private String action;
    private String acteurEmail;
    private String acteurRole;
    private String severity;
    private String entityType;
    private Long entityId;
    private String details;
    private LocalDateTime dateAction;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getActeurEmail() { return acteurEmail; }
    public void setActeurEmail(String acteurEmail) { this.acteurEmail = acteurEmail; }

    public String getActeurRole() { return acteurRole; }
    public void setActeurRole(String acteurRole) { this.acteurRole = acteurRole; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getDateAction() { return dateAction; }
    public void setDateAction(LocalDateTime dateAction) { this.dateAction = dateAction; }
}