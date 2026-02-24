package com.hyperlocal.backend.community.dto;

import com.hyperlocal.backend.community.enums.CommunityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateCommunityStatusRequest {

    @NotNull(message = "status is required")
    private CommunityStatus status;
}

