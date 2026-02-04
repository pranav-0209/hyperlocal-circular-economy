package com.hyperlocal.backend.verification.dto;

import com.hyperlocal.backend.verification.enums.VerificationStep;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerificationStatusResponse {
    private VerificationStep currentStep;
    private int profileCompletion;
    private boolean documentsUploaded;
    private String message;
}