package com.hyperlocal.backend.marketplace.dto;

import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Lightweight response for create/toggle/delete confirmations.
 */
@Getter
@Builder
public class ListingStatusResponse {
    private Long id;
    private ListingStatus status;
    private LocalDateTime updatedAt;
}

