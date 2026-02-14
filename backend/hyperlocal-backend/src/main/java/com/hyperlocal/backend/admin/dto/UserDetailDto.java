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
public class UserDetailDto {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private VerificationStatus status;
    private String phone;
    private String address;
    private String aboutMe;
    private String profilePhotoUrl;
    private String governmentIdUrl;
    private String addressProofUrl;
    private Integer profileCompletionPercentage;
    private ProfileStep currentStep;
    private Long communityId;
    private String community;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Static factory method to convert User entity to detailed DTO with file URLs
    public static UserDetailDto from(User user, String baseUrl) {
        UserDetailDto dto = UserDetailDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getVerificationStatus())
                .phone(user.getPhone())
                .address(user.getAddress())
                .aboutMe(user.getAboutMe())
                .profileCompletionPercentage(user.getProfileCompletionPercentage())
                .currentStep(user.getCurrentStep())
                .communityId(user.getCommunityId())
                .community(getCommunityName(user.getCommunityId()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();

        // Build full URLs for document files
        if (user.getProfilePhotoUrl() != null && !user.getProfilePhotoUrl().trim().isEmpty()) {
            dto.setProfilePhotoUrl(buildFileUrl(baseUrl, user.getId(), user.getProfilePhotoUrl()));
        }
        if (user.getGovernmentIdUrl() != null && !user.getGovernmentIdUrl().trim().isEmpty()) {
            dto.setGovernmentIdUrl(buildFileUrl(baseUrl, user.getId(), user.getGovernmentIdUrl()));
        }
        if (user.getAddressProofUrl() != null && !user.getAddressProofUrl().trim().isEmpty()) {
            dto.setAddressProofUrl(buildFileUrl(baseUrl, user.getId(), user.getAddressProofUrl()));
        }

        return dto;
    }

    private static String buildFileUrl(String baseUrl, Long userId, String fileName) {
        // Extract just the filename if it's a full path
        String filename = fileName.contains("/") || fileName.contains("\\")
            ? fileName.substring(Math.max(fileName.lastIndexOf("/"), fileName.lastIndexOf("\\")) + 1)
            : fileName;
        return baseUrl + "/api/v1/admin/files/" + userId + "/" + filename;
    }

    private static String getCommunityName(Long communityId) {
        if (communityId == null) {
            return null;
        }
        // TODO: Replace with actual community service lookup
        return "Community-" + communityId;
    }
}

