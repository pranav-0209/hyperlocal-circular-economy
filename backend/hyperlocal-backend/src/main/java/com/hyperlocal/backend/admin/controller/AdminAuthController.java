package com.hyperlocal.backend.admin.controller;

import com.hyperlocal.backend.admin.dto.AdminLoginRequestDto;
import com.hyperlocal.backend.admin.dto.AdminLoginResponseDto;
import com.hyperlocal.backend.admin.dto.CreateAdminRequestDto;
import com.hyperlocal.backend.admin.dto.CreateAdminResponseDto;
import com.hyperlocal.backend.admin.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponseDto> login(@Valid @RequestBody AdminLoginRequestDto request) {
        return ResponseEntity.ok(adminAuthService.login(request));
    }

    @PostMapping("/create-superadmin")
    public ResponseEntity<CreateAdminResponseDto> createSuperAdmin(@Valid @RequestBody CreateAdminRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminAuthService.createSuperAdmin(request));
    }
}