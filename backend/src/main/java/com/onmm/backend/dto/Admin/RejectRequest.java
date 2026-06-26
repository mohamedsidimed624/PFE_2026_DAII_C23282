package com.onmm.backend.dto.Admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectRequest {

    @NotBlank(message = "Le motif de rejet est obligatoire")
    private String adminComment;

}
