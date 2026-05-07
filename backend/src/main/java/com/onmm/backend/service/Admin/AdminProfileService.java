package com.onmm.backend.service.Admin;

import com.onmm.backend.dto.Admin.AdminProfileResponse;
import com.onmm.backend.dto.Admin.ChangePasswordRequest;
import com.onmm.backend.dto.Admin.UpdateAdminProfileRequest;
import org.springframework.web.multipart.MultipartFile;

public interface AdminProfileService {

    AdminProfileResponse getMyProfile(String email);

    AdminProfileResponse updateMyProfile(String email, UpdateAdminProfileRequest request);

    String updateMyPhoto(String email, MultipartFile file);

    void changePassword(String email, ChangePasswordRequest request);
}
