package com.hyperlocal.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<ErrorResponseDto> buildResponse(HttpStatus status, String message, String path) {
        ErrorResponseDto errorResponse = new ErrorResponseDto(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path
        );
        return new ResponseEntity<>(errorResponse, status);
    }

    @ExceptionHandler(CustomExceptions.EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponseDto> handleEmailExists(CustomExceptions.EmailAlreadyExistsException ex,
                                                              HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidCredentials(CustomExceptions.InvalidCredentialsException ex,
                                                                     HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.UserNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleUserNotFound(CustomExceptions.UserNotFoundException ex,
                                                               HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleAccessDenied(CustomExceptions.AccessDeniedException ex,
                                                               HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.UserNotVerifiedException.class)
    public ResponseEntity<ErrorResponseDto> handleUserNotVerified(CustomExceptions.UserNotVerifiedException ex,
                                                                  HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI());
    }


    // Fallback for Database constraints
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDto> handleDbViolation(DataIntegrityViolationException ex,
                                                              HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, "Database constraint violation", request.getRequestURI());
    }

    // Generic Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneric(Exception ex,
                                                          HttpServletRequest request) {
        log.error("Unhandled exception", ex); // Helpful for logs
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An internal error occurred", request.getRequestURI());
    }

}
