package com.onmm.backend.dto.auth;

import lombok.Data;

@Data
public class LoginResponse {

    private String token;

    private String role;

    private String email;

    public LoginResponse() {

    }



    public LoginResponse(
            String token,
            String role, String email) {
        this.token = token;
        this.role = role;
        this.email = email;


    }
}
