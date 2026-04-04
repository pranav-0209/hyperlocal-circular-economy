package com.hyperlocal.backend.marketplace.dto;

import com.hyperlocal.backend.marketplace.enums.BorrowRequestStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class BorrowRequestResponse {

    private Long id;
    private Long listingId;
    private Long requesterId;
    private Integer requesterTrustIndex;
    private Integer requesterTrustXp;
    private Long ownerId;
    private String ownerName;
    private String requesterName;
    private String listingTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private String message;
    private BorrowRequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime returnedAt;
    private String rejectionReason;
}

