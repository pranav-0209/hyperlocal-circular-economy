package com.hyperlocal.backend.user;

import com.hyperlocal.backend.user.dto.LoginRequestDto;
import com.hyperlocal.backend.user.dto.LoginResponseDto;
import com.hyperlocal.backend.user.dto.RegisterRequestDto;
import com.hyperlocal.backend.user.dto.RegisterResponseDto;
import com.hyperlocal.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        RegisterResponseDto response = userService.registerUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    @GetMapping("/secure")
    public ResponseEntity<String> secure() {
        return ResponseEntity.ok("You are authenticated");
    }

}
