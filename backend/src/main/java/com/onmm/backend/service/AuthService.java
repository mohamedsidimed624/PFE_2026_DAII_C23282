package com.onmm.backend.service;

import com.onmm.backend.dto.auth.SetPasswordRequest;

public interface AuthService {

    String activateAccount(String token);

    void setPassword(SetPasswordRequest request);
}
