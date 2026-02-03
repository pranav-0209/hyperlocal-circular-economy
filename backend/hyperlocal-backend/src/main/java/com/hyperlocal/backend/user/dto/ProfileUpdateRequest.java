package com.hyperlocal.backend.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProfileUpdateRequest {

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid phone number")
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    private MultipartFile profilePhoto;
}
