package com.hyperlocal.backend.marketplace.dto;

import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import com.hyperlocal.backend.marketplace.enums.ListingCondition;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ListingResponse {

    private Long id;
    private String title;
    private String description;
    private ListingCategory category;
    private BigDecimal price;
    private ListingCondition condition;
    private List<String> images;
    private ListingStatus status;

    private Long communityId;
    private String communityName;

    private ListingOwnerDto owner;

    private LocalDate availableFrom;
    private LocalDate availableTo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

