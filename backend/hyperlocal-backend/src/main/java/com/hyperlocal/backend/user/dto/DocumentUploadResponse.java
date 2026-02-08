package com.hyperlocal.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DocumentUploadResponse {
    private String message;
    private int profileCompletionPercentage;
    private String currentStep;
    private List<String> pendingSteps;
}