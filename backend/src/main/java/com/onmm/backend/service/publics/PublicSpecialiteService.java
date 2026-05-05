package com.onmm.backend.service.publics;

import com.onmm.backend.dto.publics.PublicSpecialiteResponse;
import java.util.List;

public interface PublicSpecialiteService {

    List<PublicSpecialiteResponse> getActiveSpecialites();
}