package com.hyperlocal.backend.user.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDto {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    @NotNull(message = "You must agree to terms")
    @AssertTrue(message = "You must agree to terms and conditions")
    private Boolean agreeToTerms;
}
