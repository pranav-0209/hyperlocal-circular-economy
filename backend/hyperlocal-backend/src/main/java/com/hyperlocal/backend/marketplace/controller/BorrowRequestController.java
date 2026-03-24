package com.hyperlocal.backend.marketplace.controller;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.marketplace.dto.*;
import com.hyperlocal.backend.marketplace.enums.BorrowRequestStatus;
import com.hyperlocal.backend.marketplace.service.BorrowRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marketplace/requests")
@RequiredArgsConstructor
@Tag(name = "Borrow Requests", description = "Borrow request lifecycle endpoints")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    @Operation(summary = "Create a borrow request")
    @PostMapping
    public ResponseEntity<BorrowRequestResponse> createRequest(@Valid @RequestBody CreateBorrowRequestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(borrowRequestService.createRequest(request));
    }

    @Operation(summary = "Get my sent borrow requests")
    @GetMapping("/me")
    public ResponseEntity<PagedResponseDto<BorrowRequestResponse>> getMyRequests(
            @RequestParam(required = false) BorrowRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(borrowRequestService.getMyRequests(status, page, size));
    }

    @Operation(summary = "Get incoming borrow requests for my listings")
    @GetMapping("/incoming")
    public ResponseEntity<PagedResponseDto<BorrowRequestResponse>> getIncomingRequests(
            @RequestParam(required = false) BorrowRequestStatus status,
            @RequestParam(required = false) Long listingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(borrowRequestService.getIncomingRequests(status, listingId, page, size));
    }

    @Operation(summary = "Get listing availability and blocked approved ranges")
    @GetMapping("/listings/{listingId}/availability")
    public ResponseEntity<ListingAvailabilityResponse> getListingAvailability(
            @PathVariable Long listingId,
            @RequestParam(required = false) java.time.LocalDate fromDate,
            @RequestParam(required = false) java.time.LocalDate toDate) {
        return ResponseEntity.ok(borrowRequestService.getListingAvailability(listingId, fromDate, toDate));
    }

    @Operation(summary = "Get borrow request details")
    @GetMapping("/{requestId}")
    public ResponseEntity<BorrowRequestResponse> getRequestById(@PathVariable Long requestId) {
        return ResponseEntity.ok(borrowRequestService.getRequestById(requestId));
    }

    @Operation(summary = "Approve a pending borrow request (owner only)")
    @PatchMapping("/{requestId}/approve")
    public ResponseEntity<BorrowRequestResponse> approveRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(borrowRequestService.approveRequest(requestId));
    }

    @Operation(summary = "Reject a pending borrow request (owner only)")
    @PatchMapping("/{requestId}/reject")
    public ResponseEntity<BorrowRequestResponse> rejectRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) RequestDecisionRequest requestBody) {
        return ResponseEntity.ok(borrowRequestService.rejectRequest(requestId, requestBody));
    }

    @Operation(summary = "Cancel my borrow request")
    @PatchMapping("/{requestId}/cancel")
    public ResponseEntity<BorrowRequestResponse> cancelRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(borrowRequestService.cancelRequest(requestId));
    }

    @Operation(summary = "Complete approved borrow and mark returned (owner only)")
    @PatchMapping("/{requestId}/complete")
    public ResponseEntity<BorrowRequestResponse> completeRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(borrowRequestService.completeRequest(requestId));
    }
}

