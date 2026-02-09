package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import lombok.Data;

@Data
public class UserFilterDto {
    private String email;
    private String name;
    private Role role;
    private Boolean verified;
    private ProfileStep currentStep;
}