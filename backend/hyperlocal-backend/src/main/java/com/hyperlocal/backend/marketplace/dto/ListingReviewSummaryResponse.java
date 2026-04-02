package com.hyperlocal.backend.marketplace.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListingReviewSummaryResponse {
    private Double averageRating;
    private Long totalReviews;
}
