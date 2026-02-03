package com.hyperlocal.backend.user.controller.auth;

import com.hyperlocal.backend.user.dto.*;
import com.hyperlocal.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

}

