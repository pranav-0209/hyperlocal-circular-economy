package com.hyperlocal.backend.admin.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Controller for serving user document files to super admins
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/files")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_SUPERADMIN')")
public class AdminFileController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Serve a user's file (profile photo, government ID, address proof)
     * GET /api/v1/admin/files/{userId}/{fileName}
     *
     * @param userId User ID whose file is being accessed
     * @param fileName Name of the file to serve
     * @param authentication The authenticated user (must be SUPER_ADMIN)
     * @return The requested file as a Resource
     */
    @GetMapping("/{userId}/{fileName}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable Long userId,
            @PathVariable String fileName,
            Authentication authentication
    ) {
        try {
            // 1. Security: Verify SUPER_ADMIN role (already handled by @PreAuthorize)
            log.info("File request from admin: {} for userId: {}, fileName: {}",
                    authentication.getName(), userId, fileName);

            // 2. Prevent path traversal attack
            if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
                log.warn("Potential path traversal attempt detected. FileName: {}", fileName);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            // 3. Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            // 4. Build file path
            // File structure: uploads/documents/{fileName} or uploads/profiles/{fileName}
            Path filePath = resolveFilePath(userId, fileName);

            if (filePath == null) {
                log.error("File not found: {} for user: {}", fileName, userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            // 5. Check if file exists and is readable
            if (!resource.exists() || !resource.isReadable()) {
                log.error("File not found or not readable: {}", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // 6. Determine content type
            String contentType = determineContentType(filePath);

            // 7. Serve file with security headers
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("X-Content-Type-Options", "nosniff")
                    .header("Content-Disposition", "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("Malformed URL exception for file: {}", fileName, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error serving file: {} for user: {}", fileName, userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Resolve the file path by searching in both documents and profiles directories
     */
    private Path resolveFilePath(Long userId, String fileName) {
        // Try documents directory first
        Path documentsPath = Paths.get(uploadDir, "documents", fileName);
        if (Files.exists(documentsPath)) {
            return documentsPath;
        }

        // Try profiles directory
        Path profilesPath = Paths.get(uploadDir, "profiles", fileName);
        if (Files.exists(profilesPath)) {
            return profilesPath;
        }

        // File not found in either directory
        return null;
    }

    /**
     * Determine content type of the file
     */
    private String determineContentType(Path filePath) {
        try {
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                // Fallback based on file extension
                String fileName = filePath.getFileName().toString().toLowerCase();
                if (fileName.endsWith(".pdf")) {
                    return "application/pdf";
                } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                    return "image/jpeg";
                } else if (fileName.endsWith(".png")) {
                    return "image/png";
                } else {
                    return "application/octet-stream";
                }
            }
            return contentType;
        } catch (IOException e) {
            log.warn("Could not determine content type for file: {}", filePath, e);
            return "application/octet-stream";
        }
    }
}


