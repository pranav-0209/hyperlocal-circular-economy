package com.hyperlocal.backend.marketplace.controller;

import com.hyperlocal.backend.marketplace.dto.*;
import com.hyperlocal.backend.marketplace.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Marketplace review endpoints")
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Create review for a completed borrow transaction")
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(request));
    }

    @Operation(summary = "Get paginated reviews for a listing with summary")
    @GetMapping("/listings/{listingId}")
    public ResponseEntity<ListingReviewsResponse> getListingReviews(
            @PathVariable Long listingId,
            @PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getListingReviews(listingId, pageable));
    }

    @Operation(summary = "Get my completed transactions pending review")
    @GetMapping("/me/pending")
    public ResponseEntity<List<PendingReviewResponse>> getMyPendingReviews() {
        return ResponseEntity.ok(reviewService.getMyPendingReviews());
    }
}

