package com.hyperlocal.backend.community.dto;

import com.hyperlocal.backend.community.enums.CommunityCategory;
import com.hyperlocal.backend.community.enums.CommunityStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommunityResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private CommunityCategory category;
    private CommunityStatus status;

    /** Display names of all ADMIN members. */
    private List<String> admins;

    private long memberCount;
    private LocalDateTime createdAt;

    /**
     * Only present when the authenticated user is an ADMIN of this community.
     * Useful so admins can share the code without an extra API call.
     */
    private String inviteCode;

    /**
     * True when the authenticated user holds the ADMIN role in this community.
     * Allows the frontend to conditionally render admin controls (e.g., delete
     * community, manage members) without a separate "check role" API call.
     */
    private boolean isAdmin;
}
