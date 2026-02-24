package com.hyperlocal.backend.community.controller;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.community.dto.CommunityMemberResponse;
import com.hyperlocal.backend.community.dto.CommunityResponse;
import com.hyperlocal.backend.community.dto.CreateCommunityRequest;
import com.hyperlocal.backend.community.dto.JoinCommunityRequest;
import com.hyperlocal.backend.community.dto.PendingMemberResponse;
import com.hyperlocal.backend.community.dto.UpdateCommunityRequest;
import com.hyperlocal.backend.community.dto.UpdateCommunityStatusRequest;
import com.hyperlocal.backend.community.dto.UpdateJoinPolicyRequest;
import com.hyperlocal.backend.community.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
@Tag(name = "Communities", description = "Community management endpoints")
public class CommunityController {

    private final CommunityService communityService;

    /**
     * POST /api/communities
     * Create a new community. The authenticated user becomes the first ADMIN.
     */
    @Operation(summary = "Create a community")
    @PostMapping
    public ResponseEntity<CommunityResponse> createCommunity(
            @Valid @RequestBody CreateCommunityRequest request) {
        CommunityResponse response = communityService.createCommunity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/communities/{communityId}
     * Returns community details. Only members can access. Returns 403 if not a member.
     */
    @Operation(summary = "Get community by ID (members only)")
    @GetMapping("/{communityId}")
    public ResponseEntity<CommunityResponse> getCommunityById(
            @PathVariable Long communityId) {
        return ResponseEntity.ok(communityService.getCommunityById(communityId));
    }

    /**
     * POST /api/communities/join
     * Join a community using its invite code.
     * For OPEN communities the user is approved immediately.
     * For APPROVAL_REQUIRED communities a PENDING membership is created.
     */
    @Operation(summary = "Join a community by invite code")
    @PostMapping("/join")
    public ResponseEntity<CommunityResponse> joinCommunity(
            @Valid @RequestBody JoinCommunityRequest request) {
        return ResponseEntity.ok(communityService.joinCommunity(request));
    }

    /**
     * GET /api/communities/me
     * Returns all communities the authenticated user belongs to.
     */
    @Operation(summary = "Get communities the current user belongs to")
    @GetMapping("/me")
    public ResponseEntity<List<CommunityResponse>> getMyCommunities() {
        return ResponseEntity.ok(communityService.getMyCommunities());
    }

    /**
     * GET /api/communities/{communityId}/members?page=0&size=20
     * Returns paginated approved member list. Only approved members can access.
     */
    @Operation(summary = "Get paginated community members (members only)")
    @GetMapping("/{communityId}/members")
    public ResponseEntity<PagedResponseDto<CommunityMemberResponse>> getCommunityMembers(
            @PathVariable Long communityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("joinedAt").ascending());
        return ResponseEntity.ok(communityService.getCommunityMembers(communityId, pageable));
    }

    /**
     * GET /api/communities/{communityId}/pending
     * Returns all pending join requests. Only community ADMINs can access.
     */
    @Operation(summary = "Get pending join requests (admin only)")
    @GetMapping("/{communityId}/pending")
    public ResponseEntity<List<PendingMemberResponse>> getPendingMembers(
            @PathVariable Long communityId) {
        return ResponseEntity.ok(communityService.getPendingMembers(communityId));
    }

    /**
     * POST /api/communities/{communityId}/pending/{membershipId}/approve
     * Approve a pending join request. Only community ADMINs can access.
     */
    @Operation(summary = "Approve a pending join request (admin only)")
    @PostMapping("/{communityId}/pending/{membershipId}/approve")
    public ResponseEntity<Void> approveMember(
            @PathVariable Long communityId,
            @PathVariable Long membershipId) {
        communityService.approveMember(communityId, membershipId);
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/communities/{communityId}/pending/{membershipId}/reject
     * Reject (delete) a pending join request. Only community ADMINs can access.
     */
    @Operation(summary = "Reject a pending join request (admin only)")
    @PostMapping("/{communityId}/pending/{membershipId}/reject")
    public ResponseEntity<Void> rejectMember(
            @PathVariable Long communityId,
            @PathVariable Long membershipId) {
        communityService.rejectMember(communityId, membershipId);
        return ResponseEntity.ok().build();
    }

    // ── Join-Request aliases (canonical URL style) ────────────────────────────

    /** GET /api/communities/{id}/join-requests — alias for /pending */
    @Operation(summary = "Get pending join requests (admin only)")
    @GetMapping("/{communityId}/join-requests")
    public ResponseEntity<List<PendingMemberResponse>> getJoinRequests(
            @PathVariable Long communityId) {
        return ResponseEntity.ok(communityService.getPendingMembers(communityId));
    }

    /** POST /api/communities/{id}/join-requests/{requestId}/approve */
    @Operation(summary = "Approve a join request (admin only)")
    @PostMapping("/{communityId}/join-requests/{requestId}/approve")
    public ResponseEntity<Void> approveJoinRequest(
            @PathVariable Long communityId,
            @PathVariable Long requestId) {
        communityService.approveMember(communityId, requestId);
        return ResponseEntity.ok().build();
    }

    /** POST /api/communities/{id}/join-requests/{requestId}/reject */
    @Operation(summary = "Reject a join request (admin only)")
    @PostMapping("/{communityId}/join-requests/{requestId}/reject")
    public ResponseEntity<Void> rejectJoinRequest(
            @PathVariable Long communityId,
            @PathVariable Long requestId) {
        communityService.rejectMember(communityId, requestId);
        return ResponseEntity.ok().build();
    }

    // ── Member management ─────────────────────────────────────────────────────

    /** DELETE /api/communities/{id}/members/{memberId} — remove a member (admin only) */
    @Operation(summary = "Remove a member from the community (admin only)")
    @DeleteMapping("/{communityId}/members/{membershipId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long communityId,
            @PathVariable Long membershipId) {
        communityService.removeMember(communityId, membershipId);
        return ResponseEntity.noContent().build();
    }

    // ── Community editing ─────────────────────────────────────────────────────

    /** PUT /api/communities/{id} — edit name, description, category (admin only) */
    @Operation(summary = "Update community details (admin only)")
    @PutMapping("/{communityId}")
    public ResponseEntity<CommunityResponse> updateCommunity(
            @PathVariable Long communityId,
            @Valid @RequestBody UpdateCommunityRequest request) {
        return ResponseEntity.ok(communityService.updateCommunity(communityId, request));
    }

    /** PATCH /api/communities/{id}/join-policy — change join policy (admin only) */
    @Operation(summary = "Update community join policy (admin only)")
    @PatchMapping("/{communityId}/join-policy")
    public ResponseEntity<CommunityResponse> updateJoinPolicy(
            @PathVariable Long communityId,
            @Valid @RequestBody UpdateJoinPolicyRequest request) {
        return ResponseEntity.ok(communityService.updateJoinPolicy(communityId, request));
    }

    /** PATCH /api/communities/{id}/status — change community status (admin only) */
    @Operation(summary = "Update community status (admin only)")
    @PatchMapping("/{communityId}/status")
    public ResponseEntity<CommunityResponse> updateStatus(
            @PathVariable Long communityId,
            @Valid @RequestBody UpdateCommunityStatusRequest request) {
        return ResponseEntity.ok(communityService.updateStatus(communityId, request));
    }
}
