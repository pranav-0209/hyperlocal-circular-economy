package com.hyperlocal.backend.common.exception;

public class CustomExceptions {

    private CustomExceptions() {}

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
}
