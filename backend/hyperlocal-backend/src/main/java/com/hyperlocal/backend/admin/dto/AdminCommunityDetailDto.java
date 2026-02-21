package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.community.dto.CommunityMemberResponse;
import com.hyperlocal.backend.community.enums.CommunityCategory;
import com.hyperlocal.backend.community.enums.CommunityStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminCommunityDetailDto {

    private Long id;
    private String name;
    private String code;
    private String description;
    private CommunityCategory category;
    private CommunityStatus status;
    private long memberCount;
    private List<String> admins;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Full member list (non-paginated) for admin detail view. */
    private List<CommunityMemberResponse> members;
}

