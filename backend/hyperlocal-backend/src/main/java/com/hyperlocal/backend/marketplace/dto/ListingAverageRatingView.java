package com.hyperlocal.backend.marketplace.dto;

public interface ListingAverageRatingView {
    Long getListingId();
    Double getAverageRating();
    Long getTotalReviews();
}

