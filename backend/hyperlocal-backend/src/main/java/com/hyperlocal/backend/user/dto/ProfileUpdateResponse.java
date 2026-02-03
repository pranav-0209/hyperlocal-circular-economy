package com.hyperlocal.backend.user.dto;

import java.util.List;

public record ProfileUpdateResponse(
        String message,
        int profileCompletionPercentage,
        String currentStep,
        List<String> pendingSteps
) {
}
