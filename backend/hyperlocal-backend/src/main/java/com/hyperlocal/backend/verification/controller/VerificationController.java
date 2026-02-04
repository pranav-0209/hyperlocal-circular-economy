package com.hyperlocal.backend.verification.controller;

import com.hyperlocal.backend.verification.dto.VerificationStatusResponse;
import com.hyperlocal.backend.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/verification")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/status")
    public ResponseEntity<VerificationStatusResponse> getStatus() {
        return ResponseEntity.ok(verificationService.getVerificationStatus());
    }
}