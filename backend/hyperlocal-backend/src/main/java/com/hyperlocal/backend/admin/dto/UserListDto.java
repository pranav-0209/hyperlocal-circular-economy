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
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListDto {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private VerificationStatus status;
    private Role role;
    private ProfileStep currentStep;
    private Integer profileCompletionPercentage;

    /** IDs of communities the user has joined (approved membership). */
    private List<Long> joinedCommunityIds;

    /** IDs of communities the user has created. */
    private List<Long> createdCommunityIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method to convert User entity to lightweight DTO
    public static UserListDto from(User user) {
        return UserListDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .joinedCommunityIds(user.getJoinedCommunityIds())
                .createdCommunityIds(user.getCreatedCommunityIds())
                .status(user.getVerificationStatus())
                .role(user.getRole())
                .currentStep(user.getCurrentStep())
                .profileCompletionPercentage(user.getProfileCompletionPercentage())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

