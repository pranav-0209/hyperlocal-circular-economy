package com.hyperlocal.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterResponseDto {
    private Long userId;
    private String email;
    private String message;
}
