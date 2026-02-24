package com.hyperlocal.backend.community.dto;

import com.hyperlocal.backend.community.enums.MemberStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Represents a single community-join request shown to community admins.
 */
@Data
@Builder
public class PendingMemberResponse {

    private Long membershipId;
    private Long userId;
    private String name;
    private String email;
    private String profilePhotoUrl;
    private MemberStatus status;
    private LocalDateTime requestedAt;
}

