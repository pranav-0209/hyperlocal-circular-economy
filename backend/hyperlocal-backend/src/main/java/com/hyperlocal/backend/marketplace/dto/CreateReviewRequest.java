package com.hyperlocal.backend.marketplace.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewRequest {

    @NotNull(message = "transactionId is required")
    private Long transactionId;

    @NotNull(message = "listingId is required")
    private Long listingId;

    @NotNull(message = "revieweeUserId is required")
    private Long revieweeUserId;

    @NotNull(message = "rating is required")
    @Min(value = 1, message = "rating must be between 1 and 5")
    @Max(value = 5, message = "rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 1000, message = "comment can be at most 1000 characters")
    private String comment;

    @NotNull(message = "recommend is required")
    private Boolean recommend;
}

