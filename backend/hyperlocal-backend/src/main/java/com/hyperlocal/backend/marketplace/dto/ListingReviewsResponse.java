package com.hyperlocal.backend.marketplace.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ListingReviewsResponse {
    private List<ListingReviewItemResponse> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private ListingReviewSummaryResponse summary;
}

