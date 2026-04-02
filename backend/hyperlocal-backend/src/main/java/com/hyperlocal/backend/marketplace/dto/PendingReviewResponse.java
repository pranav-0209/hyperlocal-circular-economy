package com.hyperlocal.backend.marketplace.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PendingReviewResponse {
    private Long transactionId;
    private Long listingId;
    private String listingTitle;
    private Long ownerUserId;
    private String ownerName;
}

