package com.hyperlocal.backend.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Lean DTO returned for GET /api/profile/{userId} (public view of another user).
 * Only exposes fields that are safe / relevant for other users to see.
 */
@Getter
@Builder
public class PublicProfileResponseDto {

    private Long userId;
    private String name;
    private String profilePhotoUrl;
    private boolean verified;
    private LocalDateTime memberSince;
    private Integer trustIndex;
    private Integer trustXp;
    private long listingsPosted;
}
