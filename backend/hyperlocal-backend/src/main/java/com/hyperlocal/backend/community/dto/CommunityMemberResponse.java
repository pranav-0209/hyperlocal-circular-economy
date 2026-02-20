package com.hyperlocal.backend.community.dto;

import com.hyperlocal.backend.community.enums.CommunityRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommunityMemberResponse {

    private Long userId;
    private String name;
    private String email;
    private CommunityRole role;
    private LocalDateTime joinedAt;
    private String profilePhotoUrl;
}

