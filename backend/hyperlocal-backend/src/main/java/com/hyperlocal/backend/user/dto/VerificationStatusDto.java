package com.hyperlocal.backend.user.dto;

import com.hyperlocal.backend.user.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationStatusDto {

    private VerificationStatus status; // NOT_VERIFIED, VERIFIED, REJECTED
    private Integer profileCompletionPercentage;
    private String statusMessage;
    private String rejectionReason;
    private LocalDateTime verifiedAt;
}


