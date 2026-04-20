package com.onmm.backend.service;

import com.onmm.backend.dto.SpecialiteResponse;
import com.onmm.backend.dto.SousSpecialiteResponse;

import java.util.List;

public interface SpecialiteService {

    List<SpecialiteResponse> getAllActiveSpecialites();

    List<SousSpecialiteResponse> getSousSpecialitesBySpecialite(Long specialiteId);
}