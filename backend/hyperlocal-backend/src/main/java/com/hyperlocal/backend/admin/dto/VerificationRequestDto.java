package com.hyperlocal.backend.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRequestDto {

    @NotNull(message = "Approval status is required")
    private Boolean approved;

    // Reason for rejection (required if approved = false, validated in service layer)
    private String rejectionReason;

    public boolean isApproved() {
        return approved != null && approved;
    }
}
