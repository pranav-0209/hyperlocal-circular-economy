package com.hyperlocal.backend.marketplace.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestDecisionRequest {

    @Size(max = 500, message = "Reason can be at most 500 characters")
    private String reason;
}

