package com.hyperlocal.backend.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DocumentUploadRequest {
    @NotNull(message = "Government ID is required")
    private MultipartFile governmentId;

    private MultipartFile addressProof; // Optional
}