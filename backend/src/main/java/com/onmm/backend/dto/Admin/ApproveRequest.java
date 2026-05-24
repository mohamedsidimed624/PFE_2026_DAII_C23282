package com.onmm.backend.dto.Admin;

import com.onmm.backend.entity.enums.SectionOrdre;

public class ApproveRequest {
    private SectionOrdre sectionValidee;

    public SectionOrdre getSectionValidee() { return sectionValidee; }
    public void setSectionValidee(SectionOrdre sectionValidee) { this.sectionValidee = sectionValidee; }
}
