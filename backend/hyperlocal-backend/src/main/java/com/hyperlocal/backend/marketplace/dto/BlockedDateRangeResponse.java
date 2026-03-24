package com.hyperlocal.backend.marketplace.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class BlockedDateRangeResponse {

    private Long requestId;
    private LocalDate startDate;
    private LocalDate endDate;
}

