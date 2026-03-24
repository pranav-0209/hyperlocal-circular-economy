package com.hyperlocal.backend.user.controller.user;

import com.hyperlocal.backend.user.dto.ProfileResponseDto;
import com.hyperlocal.backend.user.dto.ProfileUpdateRequest;
import com.hyperlocal.backend.user.dto.ProfileUpdateResponse;
import com.hyperlocal.backend.user.dto.PublicProfileResponseDto;
import com.hyperlocal.backend.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "User profile endpoints")
public class ProfileController {

    private final UserService userService;

    /**
     * GET /api/profile/me
     * Returns the authenticated user's full profile with stats.
     */
    @Operation(summary = "Get my profile")
    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDto> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    /**
     * GET /api/profile/{userId}
     * Returns another user's lean public profile (name, photo, rating, listings count).
     */
    @Operation(summary = "Get public profile by user ID")
    @GetMapping("/{userId}")
    public ResponseEntity<PublicProfileResponseDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getPublicProfile(userId));
    }

    /**
     * PUT /api/profile/me
     * Alias for PUT /api/users/profile — delegates to the same service method.
     */
    @Operation(summary = "Update my profile")
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileUpdateResponse> updateMyProfile(
            @Valid @ModelAttribute ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }
}
