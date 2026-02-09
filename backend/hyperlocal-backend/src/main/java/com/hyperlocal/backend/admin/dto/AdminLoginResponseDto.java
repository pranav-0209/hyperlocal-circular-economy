package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.admin.enums.AdminRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponseDto {
    private String token;
    private Long id;
    private String email;
    private String name;
    private AdminRole role;
}