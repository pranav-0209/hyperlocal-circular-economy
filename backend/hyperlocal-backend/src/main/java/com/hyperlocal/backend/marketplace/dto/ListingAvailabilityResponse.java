package com.hyperlocal.backend.marketplace.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class ListingAvailabilityResponse {

    private Long listingId;
    private LocalDate availableFrom;
    private LocalDate availableTo;
    private Boolean requestedRangeAvailable;
    private List<BlockedDateRangeResponse> blockedRanges;
}

