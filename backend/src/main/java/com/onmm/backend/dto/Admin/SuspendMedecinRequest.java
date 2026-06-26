package com.onmm.backend.dto.Admin;

import jakarta.validation.constraints.NotBlank;

public class SuspendMedecinRequest {

    @NotBlank(message = "Le motif de suspension est obligatoire")
    private String adminComment;

    public String getAdminComment() {
        return adminComment;
    }

    public void setAdminComment(String adminComment) {
        this.adminComment = adminComment;
    }
}
