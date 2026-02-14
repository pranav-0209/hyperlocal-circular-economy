package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
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
public class UserListDto {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String community;
    private Long communityId;
    private VerificationStatus status;
    private Role role;
    private ProfileStep currentStep;
    private Integer profileCompletionPercentage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method to convert User entity to lightweight DTO
    public static UserListDto from(User user) {
        return UserListDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .community(getCommunityName(user.getCommunityId()))
                .communityId(user.getCommunityId())
                .status(user.getVerificationStatus())
                .role(user.getRole())
                .currentStep(user.getCurrentStep())
                .profileCompletionPercentage(user.getProfileCompletionPercentage())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // Helper method to get community name - can be enhanced with actual community lookup
    private static String getCommunityName(Long communityId) {
        if (communityId == null) {
            return null;
        }
        // TODO: Replace with actual community service lookup
        // For now, return a placeholder based on ID
        return "Community-" + communityId;
    }
}

