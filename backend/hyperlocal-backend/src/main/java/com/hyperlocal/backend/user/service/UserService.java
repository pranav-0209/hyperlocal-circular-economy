package com.hyperlocal.backend.user.service;

import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.common.storage.FileStorageService;
import com.hyperlocal.backend.community.repository.CommunityMemberRepository;
import com.hyperlocal.backend.security.JwtService;
import com.hyperlocal.backend.user.dto.*;
import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import com.hyperlocal.backend.user.enums.VerificationStatus;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ProfileCompletionService profileCompletionService;
    private final FileStorageService fileStorageService;
    private final CommunityMemberRepository communityMemberRepository;

    @Transactional
    public RegisterResponseDto registerUser(RegisterRequestDto dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new CustomExceptions.EmailAlreadyExistsException();
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(Role.ROLE_USER)
                .verificationStatus(VerificationStatus.NOT_VERIFIED)
                .build();

        // Set initial profile completion percentage and step
        int percentage = profileCompletionService.calculatePercentage(user);
        user.setProfileCompletionPercentage(percentage);

        String currentStep = profileCompletionService.getCurrentStep(user);
        user.setCurrentStep(ProfileStep.valueOf(currentStep));

        User savedUser = userRepository.save(user);

        return new RegisterResponseDto(
                savedUser.getId(),
                savedUser.getEmail(),
                "Registration successful. Please login to continue"
        );
    }

    public LoginResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(CustomExceptions.InvalidCredentialsException::new);

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new CustomExceptions.InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user);

        int communityCount = (int) communityMemberRepository.countByUserId(user.getId());

        return LoginResponseDto.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .profileCompleted(profileCompletionService.isProfileComplete(user))
                .profileCompletionPercentage(profileCompletionService.calculatePercentage(user))
                .currentStep(profileCompletionService.getCurrentStep(user))
                .pendingSteps(profileCompletionService.getPendingSteps(user))
                .status(user.getVerificationStatus().name())
                .rejectionReason(user.getRejectionReason())
                .communityCount(communityCount)
                .build();
    }

    @Transactional
    public ProfileUpdateResponse updateProfile(ProfileUpdateRequest request) {
        String email = extractAuthenticatedEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(CustomExceptions.InvalidCredentialsException::new);

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getBio() != null) {
            user.setAboutMe(request.getBio());
        }
        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isEmpty()) {
            try {
                String photoUrl = fileStorageService.storeProfilePhoto(request.getProfilePhoto(), user.getId());
                user.setProfilePhotoUrl(photoUrl);
            } catch (IOException e) {
                throw new CustomExceptions.FileUploadException(e);
            }
        }

        int percentage = profileCompletionService.calculatePercentage(user);
        user.setProfileCompletionPercentage(percentage);

        String currentStep = profileCompletionService.getCurrentStep(user);
        user.setCurrentStep(ProfileStep.valueOf(currentStep));

        userRepository.save(user);

        return new ProfileUpdateResponse(
                "Profile updated successfully",
                percentage,
                currentStep,
                profileCompletionService.getPendingSteps(user)
        );
    }

    @Transactional
    public DocumentUploadResponse uploadDocuments(DocumentUploadRequest request) {
        String email = extractAuthenticatedEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(CustomExceptions.UserNotFoundException::new);

        // Validate government ID is present and not empty
        if (request.getGovernmentId() == null || request.getGovernmentId().isEmpty()) {
            throw new CustomExceptions.DocumentRequiredException("Government ID");
        }

        try {
            // Store government ID (required)
            String govIdUrl = fileStorageService.storeDocument(request.getGovernmentId(), user.getId(), "gov_id");
            user.setGovernmentIdUrl(govIdUrl);

            // Store address proof if provided (optional)
            if (request.getAddressProof() != null && !request.getAddressProof().isEmpty()) {
                String addressProofUrl = fileStorageService.storeDocument(request.getAddressProof(), user.getId(), "address_proof");
                user.setAddressProofUrl(addressProofUrl);
            }
        } catch (IOException e) {
            throw new CustomExceptions.FileUploadException(e);
        }

        // If user was previously rejected and is now re-uploading, reset verification status
        if (user.getVerificationStatus() == VerificationStatus.REJECTED) {
            user.setVerificationStatus(VerificationStatus.NOT_VERIFIED);
            user.setRejectionReason(null);
        }

        // Update profile completion
        int percentage = profileCompletionService.calculatePercentage(user);
        user.setProfileCompletionPercentage(percentage);

        String currentStep = profileCompletionService.getCurrentStep(user);
        user.setCurrentStep(ProfileStep.valueOf(currentStep));

        userRepository.save(user);

        return new DocumentUploadResponse(
                "Documents uploaded successfully",
                percentage,
                currentStep,
                profileCompletionService.getPendingSteps(user)
        );
    }

    public VerificationStatusDto getVerificationStatus() {
        String email = extractAuthenticatedEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(CustomExceptions.UserNotFoundException::new);

        // Determine status message based on verification status
        String statusMessage;
        switch (user.getVerificationStatus()) {
            case VERIFIED:
                statusMessage = "Your account has been verified successfully!";
                break;
            case REJECTED:
                statusMessage = "Your documents were rejected. Please upload new documents.";
                break;
            case NOT_VERIFIED:
            default:
                statusMessage = "Your documents are currently being reviewed by our admin team.";
                break;
        }

        return VerificationStatusDto.builder()
                .status(user.getVerificationStatus())
                .profileCompletionPercentage(user.getProfileCompletionPercentage())
                .statusMessage(statusMessage)
                .rejectionReason(user.getRejectionReason())
                .verifiedAt(user.getVerificationStatus() == VerificationStatus.VERIFIED ? user.getUpdatedAt() : null)
                .build();
    }

    private String extractAuthenticatedEmail() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null ||
                "anonymousUser".equals(authentication.getName())) {
            throw new CustomExceptions.UnauthorizedAccessException();
        }

        return authentication.getName();
    }
}
