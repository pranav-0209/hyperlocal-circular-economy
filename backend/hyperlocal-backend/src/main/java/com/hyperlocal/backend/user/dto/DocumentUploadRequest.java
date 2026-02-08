package com.hyperlocal.backend.user.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DocumentUploadRequest {
    private MultipartFile governmentId;
    private MultipartFile addressProof; // Optional
}