package com.hyperlocal.backend.common.storage;

import com.hyperlocal.backend.common.exception.CustomExceptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".gif");
    private static final List<String> ALLOWED_DOCUMENT_EXTENSIONS = Arrays.asList(".pdf", ".jpg", ".jpeg", ".png");
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024; // 5MB

    public String storeProfilePhoto(MultipartFile file, Long userId) throws IOException {
        validateFile(file, ALLOWED_IMAGE_EXTENSIONS, "Profile photo");

        Path uploadPath = Paths.get(uploadDir, "profiles");
        Files.createDirectories(uploadPath);

        String extension = getExtension(file.getOriginalFilename());
        String fileName = "profile_" + userId + "_" + System.currentTimeMillis() + extension;
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/profiles/" + fileName;
    }

    public String storeDocument(MultipartFile file, Long userId, String documentType) throws IOException {
        validateFile(file, ALLOWED_DOCUMENT_EXTENSIONS, documentType);

        Path uploadPath = Paths.get(uploadDir, "documents");
        Files.createDirectories(uploadPath);

        String extension = getExtension(file.getOriginalFilename());
        String fileName = documentType + "_" + userId + "_" + System.currentTimeMillis() + extension;
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/documents/" + fileName;
    }

    private void validateFile(MultipartFile file, List<String> allowedExtensions, String fileType) {
        if (file == null || file.isEmpty()) {
            throw new CustomExceptions.EmptyFileException();
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new CustomExceptions.InvalidFileTypeException(
                fileType + " must be one of: " + String.join(", ", allowedExtensions)
            );
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new CustomExceptions.InvalidFileTypeException("File must have a valid extension");
        }
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex > 0 ? fileName.substring(dotIndex) : "";
    }
}

