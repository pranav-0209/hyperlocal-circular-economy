package com.hyperlocal.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;

    private boolean profileCompleted;
    private int profileCompletionPercentage;
    private String currentStep;
    private List<String> pendingSteps;
    private String status;
    private String rejectionReason;

    /** IDs of all communities the user has joined (approved membership). */
    private List<Long> joinedCommunityIds;

    /** IDs of all communities the user has created. */
    private List<Long> createdCommunityIds;
}
