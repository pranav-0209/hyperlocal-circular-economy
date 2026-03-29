package com.hyperlocal.backend.common.storage;

import com.hyperlocal.backend.common.exception.CustomExceptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.DirectoryStream;
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

    public String storeListingImage(MultipartFile file, Long userId, int index) throws IOException {
        validateFile(file, ALLOWED_IMAGE_EXTENSIONS, "Listing image");

        Path uploadPath = Paths.get(uploadDir, "listings");
        Files.createDirectories(uploadPath);

        String extension = getExtension(file.getOriginalFilename());
        String fileName = "listing_" + userId + "_" + System.currentTimeMillis() + "_" + index + extension;
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/listings/" + fileName;
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

    public void deleteVerificationDocuments(Long userId) {
        Path documentsDir = Paths.get(uploadDir, "documents");
        if (!Files.exists(documentsDir)) {
            return;
        }

        String govIdPrefix = "gov_id_" + userId + "_";
        String addressPrefix = "address_proof_" + userId + "_";

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(documentsDir)) {
            for (Path filePath : stream) {
                if (!Files.isRegularFile(filePath)) {
                    continue;
                }

                String fileName = filePath.getFileName().toString();
                if (fileName.startsWith(govIdPrefix) || fileName.startsWith(addressPrefix)) {
                    Files.deleteIfExists(filePath);
                }
            }
        } catch (IOException e) {
            throw new CustomExceptions.DocumentCleanupException(
                    "Failed to cleanup verification documents for user " + userId, e);
        }
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
