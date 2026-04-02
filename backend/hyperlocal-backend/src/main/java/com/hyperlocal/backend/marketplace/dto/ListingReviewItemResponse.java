package com.hyperlocal.backend.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ListingReviewItemResponse {
    private String reviewerName;
    private Integer rating;
    private String comment;
    private Boolean recommend;
    private LocalDateTime createdAt;
}

