package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.community.enums.CommunityCategory;
import com.hyperlocal.backend.community.enums.CommunityStatus;
import com.hyperlocal.backend.community.enums.JoinPolicy;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminCommunityListDto {

    private Long id;
    private String name;
    private String code;
    private String description;
    private CommunityCategory category;
    private CommunityStatus status;
    private JoinPolicy joinPolicy;
    private long memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

