package com.hyperlocal.backend.admin.dto;

import com.hyperlocal.backend.user.enums.ProfileStep;
import com.hyperlocal.backend.user.enums.Role;
import com.hyperlocal.backend.user.enums.VerificationStatus;
import lombok.Data;

@Data
public class UserFilterDto {
    private String email;
    private String name;
    private Role role;
    private VerificationStatus verificationStatus;
    private ProfileStep currentStep;
}