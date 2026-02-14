package com.hyperlocal.backend.user.controller.user;

import com.hyperlocal.backend.user.dto.*;
import com.hyperlocal.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/secure")
    public ResponseEntity<String> secure() {
        return ResponseEntity.ok("You are authenticated");
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileUpdateResponse> updateProfile(
            @Valid @ModelAttribute ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentUploadResponse> uploadDocuments(
            @Valid @ModelAttribute DocumentUploadRequest request) {
        return ResponseEntity.ok(userService.uploadDocuments(request));
    }

    @GetMapping("/verification-status")
    public ResponseEntity<VerificationStatusDto> getVerificationStatus() {
        return ResponseEntity.ok(userService.getVerificationStatus());
    }
}
