package com.hyperlocal.backend.admin.controller;

import com.hyperlocal.backend.admin.dto.AdminCommunityDetailDto;
import com.hyperlocal.backend.admin.dto.AdminCommunityListDto;
import com.hyperlocal.backend.admin.dto.UpdateCommunityStatusRequest;
import com.hyperlocal.backend.admin.service.AdminCommunityService;
import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.community.dto.CommunityMemberResponse;
import com.hyperlocal.backend.community.enums.CommunityStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/communities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_SUPERADMIN')")
@Tag(name = "Admin – Communities", description = "Super-admin community management endpoints")
public class AdminCommunityController {

    private final AdminCommunityService adminCommunityService;

    /**
     * GET /api/v1/admin/communities?page=&size=&status=&search=
     * Paginated list of all communities with optional status filter and search.
     */
    @Operation(summary = "List all communities (paginated, filterable)")
    @GetMapping
    public ResponseEntity<PagedResponseDto<AdminCommunityListDto>> getAllCommunities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) CommunityStatus status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminCommunityService.getAllCommunities(page, size, status, search));
    }

    /**
     * GET /api/v1/admin/communities/{id}
     * Full community detail including complete member list.
     */
    @Operation(summary = "Get community detail with member list")
    @GetMapping("/{id}")
    public ResponseEntity<AdminCommunityDetailDto> getCommunityDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminCommunityService.getCommunityDetail(id));
    }

    /**
     * PATCH /api/v1/admin/communities/{id}/status
     * Activate or deactivate a community.
     */
    @Operation(summary = "Activate or deactivate a community")
    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminCommunityListDto> updateCommunityStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommunityStatusRequest request) {
        return ResponseEntity.ok(adminCommunityService.updateCommunityStatus(id, request));
    }

    /**
     * DELETE /api/v1/admin/communities/{id}
     * Permanently remove a community and all its members.
     */
    @Operation(summary = "Delete a community permanently")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommunity(@PathVariable Long id) {
        adminCommunityService.deleteCommunity(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/admin/communities/{id}/members?page=&size=
     * Paginated member list for a community.
     */
    @Operation(summary = "Get paginated member list for a community")
    @GetMapping("/{id}/members")
    public ResponseEntity<PagedResponseDto<CommunityMemberResponse>> getCommunityMembers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminCommunityService.getCommunityMembers(id, page, size));
    }
}

