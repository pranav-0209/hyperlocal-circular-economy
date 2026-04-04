package com.hyperlocal.backend.marketplace.controller;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.marketplace.dto.*;
import com.hyperlocal.backend.marketplace.enums.ListingAvailabilityFilter;
import com.hyperlocal.backend.marketplace.enums.ListingCategory;
import com.hyperlocal.backend.marketplace.enums.ListingStatus;
import com.hyperlocal.backend.marketplace.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/listings")
@RequiredArgsConstructor
@Tag(name = "Marketplace", description = "Marketplace listing endpoints")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    /**
     * GET /api/marketplace/listings/categories
     * Returns all valid listing categories. No auth required — useful for dropdowns.
     */
    @Operation(summary = "Get all listing categories")
    @GetMapping("/categories")
    public ResponseEntity<ListingCategory[]> getCategories() {
        return ResponseEntity.ok(ListingCategory.values());
    }

    /**
     * POST /api/marketplace/listings
     * Create a new listing. Multipart form (images + fields).
     */
    @Operation(summary = "Create a listing")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponse> createListing(
                @Valid @ModelAttribute CreateListingRequest request) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(marketplaceService.createListing(request));
        }

        /**
         * GET /api/marketplace/listings
         * Browse listings scoped to the current user's communities.
         * Optional filters: search, category, filter, communityId, page, size.
         */
        @Operation(summary = "Browse listings (scoped to user's communities)")
        @GetMapping
        public ResponseEntity<PagedResponseDto<ListingSummaryResponse>> getListings(
                @RequestParam(required = false) String search,
                @RequestParam(required = false) ListingCategory category,
                @RequestParam(required = false) ListingAvailabilityFilter filter,
                @RequestParam(required = false) Long communityId,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "20") int size) {

            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            return ResponseEntity.ok(
                    marketplaceService.getListings(search, category, filter, communityId, pageable));
        }

        /**
     * GET /api/marketplace/listings/me
     * Get current user's own listings. Optional status filter.
     * NOTE: this must be declared BEFORE /{listingId} to avoid path ambiguity.
     */
    @Operation(summary = "Get my listings")
    @GetMapping("/me")
    public ResponseEntity<List<ListingResponse>> getMyListings(
            @RequestParam(required = false) ListingStatus status) {
        return ResponseEntity.ok(marketplaceService.getMyListings(status));
    }

    /**
     * GET /api/marketplace/listings/{listingId}
     * Get a single listing by ID. User must be a member of its community.
     */
    @Operation(summary = "Get listing by ID")
    @GetMapping("/{listingId}")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable Long listingId) {
        return ResponseEntity.ok(marketplaceService.getListingById(listingId));
    }

    /**
     * PUT /api/marketplace/listings/{listingId}
     * Update a listing. Only the owner can update.
     */
    @Operation(summary = "Update a listing (owner only)")
    @PutMapping(value = "/{listingId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long listingId,
            @Valid @ModelAttribute UpdateListingRequest request) {
        return ResponseEntity.ok(marketplaceService.updateListing(listingId, request));
    }

    /**
     * PATCH /api/marketplace/listings/{listingId}/toggle
     * Toggle listing status: AVAILABLE ↔ UNAVAILABLE. Owner only.
     */
    @Operation(summary = "Toggle listing availability (owner only)")
    @PatchMapping("/{listingId}/toggle")
    public ResponseEntity<ListingStatusResponse> toggleAvailability(@PathVariable Long listingId) {
        return ResponseEntity.ok(marketplaceService.toggleAvailability(listingId));
    }

    /**
     * DELETE /api/marketplace/listings/{listingId}
     * Delete a listing. Owner only.
     */
    @Operation(summary = "Delete a listing (owner only)")
    @DeleteMapping("/{listingId}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long listingId) {
        marketplaceService.deleteListing(listingId);
        return ResponseEntity.noContent().build();
    }
}

