package com.hyperlocal.backend.community.dto;

import com.hyperlocal.backend.community.enums.JoinPolicy;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateJoinPolicyRequest {

    @NotNull(message = "joinPolicy is required")
    private JoinPolicy joinPolicy;
}

