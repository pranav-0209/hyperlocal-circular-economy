package com.hyperlocal.backend.common.storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    public String uploadDir;

    public String storeProfilePhoto(MultipartFile file, Long userID) throws IOException {
        Path uploadPath = Paths.get(uploadDir, "profiles");
        Files.createDirectories(uploadPath);

        String extension = getExtension(file.getOriginalFilename());
        String fileName = "profile_" + userID + "_" + System.currentTimeMillis() + extension;
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/profiles/" + fileName;
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return ".jpg";
        int dotIndex = fileName.lastIndexOf('.');
        return dotIndex > 0 ? fileName.substring(dotIndex) : ".jpg";
    }
}

