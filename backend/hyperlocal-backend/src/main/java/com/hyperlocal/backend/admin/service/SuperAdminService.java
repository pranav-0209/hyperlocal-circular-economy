package com.hyperlocal.backend.admin.service;

import com.hyperlocal.backend.admin.dto.UserFilterDto;
import com.hyperlocal.backend.admin.dto.UserResponseDto;
import com.hyperlocal.backend.admin.dto.VerificationRequestDto;
import com.hyperlocal.backend.admin.dto.VerificationResponseDto;
import com.hyperlocal.backend.common.dto.PagedResponseDto;
import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.repository.UserRepository;
import com.hyperlocal.backend.user.repository.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final UserRepository userRepository;

    public PagedResponseDto<UserResponseDto> getAllUsers(
            int page,
            int size,
            String sortBy,
            String sortDir,
            UserFilterDto filter
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> userPage = userRepository.findAll(
                UserSpecification.withFilters(filter),
                pageable
        );

        // Convert User entities to UserResponseDto (excludes password)
        Page<UserResponseDto> dtoPage = userPage.map(UserResponseDto::from);

        return PagedResponseDto.from(dtoPage);
    }

    /**
     * Verify or reject a user's documents
     * - If approved: user.verified = true, currentStep = COMPLETE, profileCompletionPercentage = 100
     * - If rejected: user stays at DOCUMENT_VERIFICATION step, can re-upload documents
     */
    @Transactional
    public VerificationResponseDto verifyUserDocuments(Long userId, VerificationRequestDto request) {
        // Validate userId
        if (userId == null || userId <= 0) {
            throw new CustomExceptions.VerificationException("Invalid user ID provided");
        }

        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(CustomExceptions.UserNotFoundException::new);

        // Check if user is in REVIEW step (ready for verification)
        if (user.getCurrentStep() != ProfileStep.REVIEW) {
            throw new CustomExceptions.InvalidVerificationStateException(
                "User is not ready for verification. Current step: " + user.getCurrentStep() +
                ". User must be in REVIEW step.");
        }

        // Check if user has uploaded required documents
        if (user.getGovernmentIdUrl() == null || user.getGovernmentIdUrl().trim().isEmpty()) {
            throw new CustomExceptions.InvalidVerificationStateException(
                "User has not uploaded government ID document");
        }

        // Validate rejection reason if documents are being rejected
        if (!request.isApproved() &&
            (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty())) {
            throw new CustomExceptions.RejectionReasonRequiredException();
        }

        if (request.isApproved()) {
            return approveUserDocuments(user);
        } else {
            return rejectUserDocuments(user, request.getRejectionReason());
        }
    }

    private VerificationResponseDto approveUserDocuments(User user) {
        // Approve: Set verified = true, move to COMPLETE step
        user.setVerified(true);
        user.setCurrentStep(ProfileStep.COMPLETE);
        user.setProfileCompletionPercentage(100);

        userRepository.save(user);

        return VerificationResponseDto.builder()
                .userId(user.getId())
                .message("User documents verified successfully. User can now access the platform.")
                .verified(true)
                .currentStep(ProfileStep.COMPLETE)
                .profileCompletionPercentage(100)
                .build();
    }

    private VerificationResponseDto rejectUserDocuments(User user, String rejectionReason) {
        // Reject: Move back to DOCUMENT_VERIFICATION step so user can re-upload
        user.setVerified(false);
        user.setCurrentStep(ProfileStep.DOCUMENT_VERIFICATION);
        user.setProfileCompletionPercentage(ProfileStep.DOCUMENT_VERIFICATION.getPercentage());

        // Clear the uploaded documents so user can re-upload
        user.setGovernmentIdUrl(null);
        user.setAddressProofUrl(null);

        userRepository.save(user);

        return VerificationResponseDto.builder()
                .userId(user.getId())
                .message("User documents rejected. User needs to re-upload documents.")
                .verified(false)
                .currentStep(ProfileStep.DOCUMENT_VERIFICATION)
                .profileCompletionPercentage(ProfileStep.DOCUMENT_VERIFICATION.getPercentage())
                .rejectionReason(rejectionReason)
                .build();
    }
}