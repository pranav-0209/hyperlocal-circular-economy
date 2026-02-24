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
public class UserResponseDto {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private VerificationStatus verificationStatus;
    private String phone;
    private String address;
    private String aboutMe;
    private String profilePhotoUrl;
    private String governmentIdUrl;
    private String addressProofUrl;
    private Integer profileCompletionPercentage;
    private ProfileStep currentStep;

    /** IDs of communities the user has joined (approved membership). */
    private List<Long> joinedCommunityIds;

    /** IDs of communities the user has created. */
    private List<Long> createdCommunityIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method to convert User entity to DTO
    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .verificationStatus(user.getVerificationStatus())
                .phone(user.getPhone())
                .address(user.getAddress())
                .aboutMe(user.getAboutMe())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .governmentIdUrl(user.getGovernmentIdUrl())
                .addressProofUrl(user.getAddressProofUrl())
                .profileCompletionPercentage(user.getProfileCompletionPercentage())
                .currentStep(user.getCurrentStep())
                .joinedCommunityIds(user.getJoinedCommunityIds())
                .createdCommunityIds(user.getCreatedCommunityIds())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
