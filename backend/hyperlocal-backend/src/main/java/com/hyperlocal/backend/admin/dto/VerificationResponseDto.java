package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.user.enums.ProfileStep;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationResponseDto {

    private Long userId;
    private String message;
    private boolean verified;
    private ProfileStep currentStep;
    private Integer profileCompletionPercentage;
    private String rejectionReason;
}
