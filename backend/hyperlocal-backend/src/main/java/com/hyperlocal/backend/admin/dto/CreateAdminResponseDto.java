package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.admin.enums.AdminRole;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CreateAdminResponseDto {
    private Long id;
    private String email;
    private String name;
    private AdminRole role;
    private boolean active;
    private LocalDateTime createdAt;
}
