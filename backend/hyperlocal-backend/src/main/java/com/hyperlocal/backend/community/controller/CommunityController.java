package com.hyperlocal.backend.community.controller;

import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.community.dto.CommunityMemberResponse;
import com.hyperlocal.backend.community.dto.CommunityResponse;
import com.hyperlocal.backend.community.dto.CreateCommunityRequest;
import com.hyperlocal.backend.community.dto.JoinCommunityRequest;
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
     * Returns paginated member list. Only members can access.
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
}

