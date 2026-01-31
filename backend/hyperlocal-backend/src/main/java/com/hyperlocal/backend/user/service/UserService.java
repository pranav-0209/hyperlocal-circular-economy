package com.hyperlocal.backend.user.service;

import com.hyperlocal.backend.exception.CustomExceptions;
import com.hyperlocal.backend.security.JwtService;
import com.hyperlocal.backend.user.Role;
import com.hyperlocal.backend.user.User;
import com.hyperlocal.backend.user.UserRepository;
import com.hyperlocal.backend.user.dto.LoginRequestDto;
import com.hyperlocal.backend.user.dto.LoginResponseDto;
import com.hyperlocal.backend.user.dto.RegisterRequestDto;
import com.hyperlocal.backend.user.dto.RegisterResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ProfileCompletionService profileCompletionService;

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
                "Registration successful.Please login to continue"
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

}
