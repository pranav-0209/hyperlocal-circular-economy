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
    private String currentStep; // PROFILE, VERIFICATION, REVIEW, COMPLETE
    private List<String> pendingSteps;
}
