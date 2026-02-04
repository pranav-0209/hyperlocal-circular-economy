package com.hyperlocal.backend.verification.service;

import com.hyperlocal.backend.verification.dto.VerificationStatusResponse;
import com.hyperlocal.backend.verification.enums.VerificationStep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VerificationService {

    public VerificationStatusResponse getVerificationStatus() {
        // TODO: Get current user and calculate actual status
        return VerificationStatusResponse.builder()
                .currentStep(VerificationStep.PROFILE)
                .profileCompletion(0)
                .documentsUploaded(false)
                .message("Please complete your profile")
                .build();
    }
}