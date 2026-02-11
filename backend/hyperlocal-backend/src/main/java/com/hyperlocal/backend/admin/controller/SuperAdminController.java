package com.hyperlocal.backend.admin.controller;

import com.hyperlocal.backend.admin.dto.UserFilterDto;
import com.hyperlocal.backend.admin.dto.UserListDto;
import com.hyperlocal.backend.admin.dto.UserDetailDto;
import com.hyperlocal.backend.admin.dto.VerificationRequestDto;
import com.hyperlocal.backend.admin.dto.VerificationResponseDto;
import com.hyperlocal.backend.admin.service.SuperAdminService;
import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_SUPERADMIN')")
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    /**
     * Get all users with lightweight response
     * GET /api/v1/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<PagedResponseDto<UserListDto>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean verified,
            @RequestParam(required = false) ProfileStep currentStep
    ) {
        UserFilterDto filter = new UserFilterDto();
        filter.setEmail(email);
        filter.setName(name);
        filter.setRole(role);
        filter.setVerified(verified);
        filter.setCurrentStep(currentStep);

        return ResponseEntity.ok(superAdminService.getAllUsers(page, size, sortBy, sortDir, filter));
    }

    /**
     * Get detailed user information by ID
     * GET /api/v1/admin/users/{userId}
     *
     * @param userId The ID of the user to retrieve
     * @return UserDetailDto with complete user information including document URLs
     *
     * @throws CustomExceptions.UserNotFoundException if user is not found
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDetailDto> getUserById(@PathVariable Long userId) {
        UserDetailDto userDetail = superAdminService.getUserById(userId);
        return ResponseEntity.ok(userDetail);
    }

    /**
     * Verify or reject user documents
     * POST /api/v1/admin/users/{userId}/verify
     *
     * @param userId The ID of the user whose documents are being verified
     * @param request The verification request containing approval status and optional rejection reason
     * @return VerificationResponseDto with verification result
     *
     * @throws CustomExceptions.UserNotFoundException if user is not found
     * @throws CustomExceptions.InvalidVerificationStateException if user is not ready for verification
     * @throws CustomExceptions.RejectionReasonRequiredException if rejection reason is missing when rejecting
     */
    @PostMapping("/users/{userId}/verify")
    public ResponseEntity<VerificationResponseDto> verifyUserDocuments(
            @PathVariable Long userId,
            @Valid @RequestBody VerificationRequestDto request
    ) {
        VerificationResponseDto response = superAdminService.verifyUserDocuments(userId, request);
        return ResponseEntity.ok(response);
    }
}