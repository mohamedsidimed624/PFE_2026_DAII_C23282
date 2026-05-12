package com.onmm.backend.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyEmailRequest {
    private String token;
    private String email;
}
