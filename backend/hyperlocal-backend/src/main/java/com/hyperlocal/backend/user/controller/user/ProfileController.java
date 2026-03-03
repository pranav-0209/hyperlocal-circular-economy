package com.hyperlocal.backend.user.controller.user;

import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.marketplace.repository.ListingRepository;
import com.hyperlocal.backend.user.dto.ProfileResponseDto;
import com.hyperlocal.backend.user.dto.ProfileUpdateRequest;
import com.hyperlocal.backend.user.dto.ProfileUpdateResponse;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.VerificationStatus;
import com.hyperlocal.backend.user.repository.UserRepository;
import com.hyperlocal.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User profile endpoints")
public class ProfileController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ListingRepository listingRepository;

    /**
     * GET /api/profile/me
     * Returns the authenticated user's full profile with stats.
     */
    @Operation(summary = "Get my profile")
    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDto> getMyProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(buildProfileResponse(user));
    }

    /**
     * GET /api/profile/{userId}
     * Returns another user's public profile.
     */
    @Operation(summary = "Get user profile by ID")
    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDto> getUserProfile(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(CustomExceptions.UserNotFoundException::new);
        return ResponseEntity.ok(buildProfileResponse(user));
    }

    /**
     * PUT /api/profile/me
     * Alias for PUT /api/v1/users/profile — delegates to the same service method.
     */
    @Operation(summary = "Update my profile")
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileUpdateResponse> updateMyProfile(
            @Valid @ModelAttribute ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ProfileResponseDto buildProfileResponse(User user) {
        long listingsPosted = listingRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId()).size();

        return ProfileResponseDto.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .bio(user.getAboutMe())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .verified(user.getVerificationStatus() == VerificationStatus.VERIFIED)
                .memberSince(user.getCreatedAt())
                .averageRating(user.getAverageRating())
                .totalReviews(user.getTotalReviews())
                .stats(ProfileResponseDto.ProfileStatsDto.builder()
                        .listingsPosted(listingsPosted)
                        .build())
                .joinedCommunityIds(user.getJoinedCommunityIds())
                .createdCommunityIds(user.getCreatedCommunityIds())
                .build();
    }

    private User getAuthenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || "anonymousUser".equals(auth.getName())) {
            throw new CustomExceptions.UnauthorizedAccessException();
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(CustomExceptions.UserNotFoundException::new);
    }
}

