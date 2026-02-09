package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean verified;
    private String phone;
    private String address;
    private String aboutMe;
    private String profilePhotoUrl;
    private String governmentIdUrl;
    private String addressProofUrl;
    private Integer profileCompletionPercentage;
    private ProfileStep currentStep;
    private Long communityId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method to convert User entity to DTO
    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .verified(user.isVerified())
                .phone(user.getPhone())
                .address(user.getAddress())
                .aboutMe(user.getAboutMe())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .governmentIdUrl(user.getGovernmentIdUrl())
                .addressProofUrl(user.getAddressProofUrl())
                .profileCompletionPercentage(user.getProfileCompletionPercentage())
                .currentStep(user.getCurrentStep())
                .communityId(user.getCommunityId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
