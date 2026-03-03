package com.hyperlocal.backend.marketplace.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ListingOwnerDto {
    private Long userId;
    private String name;
    private String profilePhotoUrl;
    private Double averageRating;
    private Integer totalReviews;
    private boolean verified;
}

