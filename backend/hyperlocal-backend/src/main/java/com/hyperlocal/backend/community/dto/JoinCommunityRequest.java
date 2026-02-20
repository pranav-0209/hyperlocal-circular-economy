package com.hyperlocal.backend.community.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinCommunityRequest {

    @NotBlank(message = "Community code is required")
    private String code;
}

