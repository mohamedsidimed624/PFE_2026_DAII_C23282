//package com.onmm.backend.controller;
//
//import com.onmm.backend.entity.SousSpecialite;
//import com.onmm.backend.entity.Specialite;
//import com.onmm.backend.service.ReferenceService;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/reference")
//@CrossOrigin(origins="http://localhost:5173")
//public class ReferenceController {
//
//    private final ReferenceService referenceService;
//
//    public ReferenceController(ReferenceService referenceService) {
//        this.referenceService = referenceService;
//    }
//
//    @GetMapping("/specialites")
//    public List<Specialite> getSpecialites() {
//        return referenceService.getSpecialite();
//    }
//
//    @GetMapping("/sous_specialites")
//    public List<SousSpecialite> getSousSpecialites(@RequestParam Long specialiteId) {
//        return referenceService.getSousSpecialites(specialiteId);
//    }
//}
