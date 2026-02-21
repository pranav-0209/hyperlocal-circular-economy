package com.hyperlocal.backend.common.exception;

public class CustomExceptions {

    private CustomExceptions() {
    }

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException() {
            super("Email already exists");
        }
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException() {
            super("Invalid email or password");
        }
    }

    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException() {
            super("User not found");
        }
    }

    public static class AccessDeniedException extends RuntimeException {
        public AccessDeniedException() {
            super("You are not allowed to perform this action");
        }
    }

    public static class UserNotVerifiedException extends RuntimeException {
        public UserNotVerifiedException() {
            super("User is not verified by admin");
        }
    }

    public static class FileUploadException extends RuntimeException {
        public FileUploadException() { super("Failed to upload file"); }

        public FileUploadException(Throwable cause) { super("Failed to upload file", cause); }
    }

    public static class UnauthorizedAccessException extends RuntimeException {
        public UnauthorizedAccessException() { super("User is not authenticated"); }
    }

    public static class InvalidFileTypeException extends RuntimeException {
        public InvalidFileTypeException(String message) { super(message); }
        public InvalidFileTypeException() { super("Invalid file type"); }
    }

    public static class EmptyFileException extends RuntimeException {
        public EmptyFileException() { super("File cannot be empty"); }
    }

    public static class DocumentRequiredException extends RuntimeException {
        public DocumentRequiredException(String documentType) {
            super(documentType + " is required");
        }
    }

    public static class VerificationException extends RuntimeException {
        public VerificationException(String message) { super(message); }
    }

    public static class InvalidVerificationStateException extends RuntimeException {
        public InvalidVerificationStateException(String message) { super(message); }
    }

    public static class RejectionReasonRequiredException extends RuntimeException {
        public RejectionReasonRequiredException() {
            super("Rejection reason is required when rejecting documents");
        }
    }

    // ── Community exceptions ─────────────────────────────────────────────────

    public static class CommunityNotFoundException extends RuntimeException {
        public CommunityNotFoundException() {
            super("Community not found");
        }
        public CommunityNotFoundException(String message) {
            super(message);
        }
    }

    public static class InvalidCommunityCodeException extends RuntimeException {
        public InvalidCommunityCodeException() {
            super("Invalid community code. Please check and try again.");
        }
    }

    public static class AlreadyMemberException extends RuntimeException {
        public AlreadyMemberException() {
            super("You are already a member of this community.");
        }
    }

    public static class NotCommunityMemberException extends RuntimeException {
        public NotCommunityMemberException() {
            super("You are not a member of this community.");
        }
    }

    public static class CommunityNameAlreadyExistsException extends RuntimeException {
        public CommunityNameAlreadyExistsException(String name) {
            super("A community with the name \"" + name + "\" already exists. Please choose a different name.");
        }
    }
}
