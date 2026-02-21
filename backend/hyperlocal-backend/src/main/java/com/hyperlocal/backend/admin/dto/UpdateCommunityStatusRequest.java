package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.community.enums.CommunityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCommunityStatusRequest {

    @NotNull(message = "Status is required")
    private CommunityStatus status;
}

