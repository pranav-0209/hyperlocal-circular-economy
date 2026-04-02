package com.hyperlocal.backend.marketplace.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {
    private Long id;
    private Long transactionId;
    private Long listingId;
    private Long reviewerUserId;
    private String reviewerName;
    private Long revieweeUserId;
    private String revieweeName;
    private Integer rating;
    private String comment;
    private Boolean recommend;
    private LocalDateTime createdAt;
}

