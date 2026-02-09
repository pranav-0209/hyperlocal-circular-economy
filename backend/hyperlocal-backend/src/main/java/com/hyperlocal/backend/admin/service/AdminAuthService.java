package com.hyperlocal.backend.admin.service;

import com.hyperlocal.backend.admin.dto.AdminLoginRequestDto;
import com.hyperlocal.backend.admin.dto.AdminLoginResponseDto;
import com.hyperlocal.backend.admin.dto.CreateAdminRequestDto;
import com.hyperlocal.backend.admin.dto.CreateAdminResponseDto;
import com.hyperlocal.backend.admin.entity.Admin;
import com.hyperlocal.backend.admin.enums.AdminRole;
import com.hyperlocal.backend.admin.repository.AdminRepository;

import com.hyperlocal.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminLoginResponseDto login(AdminLoginRequestDto request) {
        Admin admin  = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!admin.isActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        adminRepository.save(admin);

        String token = jwtService.generateToken(admin.getEmail(), admin.getRole().name());

        return AdminLoginResponseDto.builder()
                .token(token)
                .id(admin.getId())
                .email(admin.getEmail())
                .name(admin.getName())
                .role(admin.getRole())
                .build();
    }

    public CreateAdminResponseDto createSuperAdmin(CreateAdminRequestDto request) {
        // Check if admin with email already exists
        if (adminRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Admin with this email already exists");
        }

        Admin admin = Admin.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(AdminRole.ROLE_SUPERADMIN)
                .active(true)
                .build();

        Admin savedAdmin = adminRepository.save(admin);

        return CreateAdminResponseDto.builder()
                .id(savedAdmin.getId())
                .email(savedAdmin.getEmail())
                .name(savedAdmin.getName())
                .role(savedAdmin.getRole())
                .active(savedAdmin.isActive())
                .createdAt(savedAdmin.getCreatedAt())
                .build();
    }
}