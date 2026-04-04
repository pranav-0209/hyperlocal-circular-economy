package com.hyperlocal.backend.user.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ProfileResponseDto {

    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String bio;
    private String profilePhotoUrl;
    private boolean verified;
    private LocalDateTime memberSince;

    private Integer trustIndex;
    private Integer trustXp;

    private ProfileStatsDto stats;

    /** Communities the user has joined (approved member). */
    private List<Long> joinedCommunityIds;

    /** Communities the user created. */
    private List<Long> createdCommunityIds;

    @Getter
    @Builder
    public static class ProfileStatsDto {
        private long listingsPosted;
    }
}
