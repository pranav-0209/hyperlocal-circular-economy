package com.hyperlocal.backend.marketplace.dto;

import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import com.hyperlocal.backend.marketplace.enums.ListingCondition;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ListingSummaryResponse {

    private Long id;
    private String title;
    private ListingCategory category;
    private BigDecimal price;
    private ListingCondition condition;
    private String thumbnailUrl;
    private ListingStatus status;

    private Long communityId;
    private String communityName;

    private ListingOwnerDto owner;
    private Double averageRating;
    private Long totalReviews;
    private Boolean isFullyBooked;

    private LocalDateTime createdAt;
}

