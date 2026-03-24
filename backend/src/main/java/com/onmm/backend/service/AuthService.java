package com.onmm.backend.service;

import com.onmm.backend.dto.auth.LoginRequest;
import com.onmm.backend.dto.auth.LoginResponse;
import com.onmm.backend.dto.auth.SetPasswordRequest;

public interface AuthService {

    String activateAccount(String token);

    void setPassword(SetPasswordRequest request);

    LoginResponse login(LoginRequest request);
}
