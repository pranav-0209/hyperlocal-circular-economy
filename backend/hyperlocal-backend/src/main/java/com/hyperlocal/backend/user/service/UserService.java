package com.hyperlocal.backend.user.service;

import com.hyperlocal.backend.common.exception.CustomExceptions;
import com.hyperlocal.backend.common.storage.FileStorageService;
import com.hyperlocal.backend.security.JwtService;
import com.hyperlocal.backend.user.dto.*;
import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import com.hyperlocal.backend.user.entity.User;
import com.hyperlocal.backend.user.UserRepository;
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
                .verified(false)
                .build();

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

    private String extractAuthenticatedEmail() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null ||
                "anonymousUser".equals(authentication.getName())) {
            throw new CustomExceptions.UnauthorizedAccessException();
        }

        return authentication.getName();
    }
}
