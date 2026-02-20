package com.hyperlocal.backend.common.exception;

import com.hyperlocal.backend.common.dto.ErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

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

    @ExceptionHandler(CustomExceptions.FileUploadException.class)
    public ResponseEntity<ErrorResponseDto> handleFileUpload(CustomExceptions.FileUploadException ex,
                                                             HttpServletRequest request) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponseDto> handleUnauthorized(CustomExceptions.UnauthorizedAccessException ex,
                                                               HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.InvalidFileTypeException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidFileType(CustomExceptions.InvalidFileTypeException ex,
                                                                  HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.EmptyFileException.class)
    public ResponseEntity<ErrorResponseDto> handleEmptyFile(CustomExceptions.EmptyFileException ex,
                                                            HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.DocumentRequiredException.class)
    public ResponseEntity<ErrorResponseDto> handleDocumentRequired(CustomExceptions.DocumentRequiredException ex,
                                                                   HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleEntityNotFound(jakarta.persistence.EntityNotFoundException ex,
                                                                 HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalState(IllegalStateException ex,
                                                               HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.VerificationException.class)
    public ResponseEntity<ErrorResponseDto> handleVerificationError(CustomExceptions.VerificationException ex,
                                                                    HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.InvalidVerificationStateException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidVerificationState(CustomExceptions.InvalidVerificationStateException ex,
                                                                           HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.RejectionReasonRequiredException.class)
    public ResponseEntity<ErrorResponseDto> handleRejectionReasonRequired(CustomExceptions.RejectionReasonRequiredException ex,
                                                                          HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    // ── Community exception handlers ─────────────────────────────────────────

    @ExceptionHandler(CustomExceptions.CommunityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleCommunityNotFound(CustomExceptions.CommunityNotFoundException ex,
                                                                    HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.InvalidCommunityCodeException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidCommunityCode(CustomExceptions.InvalidCommunityCodeException ex,
                                                                       HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.AlreadyMemberException.class)
    public ResponseEntity<ErrorResponseDto> handleAlreadyMember(CustomExceptions.AlreadyMemberException ex,
                                                                HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(CustomExceptions.NotCommunityMemberException.class)
    public ResponseEntity<ErrorResponseDto> handleNotCommunityMember(CustomExceptions.NotCommunityMemberException ex,
                                                                     HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request.getRequestURI());
    }

    // Handle validation errors for request DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidation(MethodArgumentNotValidException ex,
                                                             HttpServletRequest request) {
        StringBuilder message = new StringBuilder("Validation failed: ");
        ex.getBindingResult().getFieldErrors().forEach(error ->
            message.append(error.getField()).append(" - ").append(error.getDefaultMessage()).append("; ")
        );
        return buildResponse(HttpStatus.BAD_REQUEST, message.toString(), request.getRequestURI());
    }

    // Handle illegal argument exceptions (e.g., missing required files)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgument(IllegalArgumentException ex,
                                                                  HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    // Handle file size exceeded exceptions
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleFileSizeExceeded(MaxUploadSizeExceededException ex,
                                                                   HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST,
            "File size exceeds maximum allowed limit", request.getRequestURI());
    }

    // Generic Fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneric(Exception ex,
                                                          HttpServletRequest request) {
        log.error("Unhandled exception", ex); // Helpful for logs
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An internal error occurred", request.getRequestURI());
    }

}
