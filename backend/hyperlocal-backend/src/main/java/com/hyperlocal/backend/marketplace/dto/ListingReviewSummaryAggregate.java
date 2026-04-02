package com.hyperlocal.backend.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ListingReviewSummaryAggregate {
    private double averageRating;
    private long totalRatings;
    private long recommendCount;
    private long oneStarCount;
    private long twoStarCount;
    private long threeStarCount;
    private long fourStarCount;
    private long fiveStarCount;
}
