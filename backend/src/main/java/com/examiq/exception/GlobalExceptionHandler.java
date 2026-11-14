package com.examiq.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                                                           HttpServletRequest request) {
        BindingResult result = ex.getBindingResult();
        List<ErrorResponse.FieldError> fieldErrors = result.getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldError(fe.getField(), fe.getDefaultMessage()))
                .collect(Collectors.toList());

        String message = fieldErrors.isEmpty()
                ? "Validation failed"
                : fieldErrors.stream().map(ErrorResponse.FieldError::getMessage).collect(Collectors.joining(", "));

        ErrorResponse err = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(message)
                .path(request.getRequestURI())
                .fieldErrors(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(err);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex,
                                                         HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex,
                                                           HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex,
                                                                   HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, "Malformed JSON request: " + ex.getMostSpecificCause().getMessage(), request);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex,
                                                             HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex,
                                                         HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                             HttpServletRequest request) {
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            String jwtMsg = (String) request.getAttribute("jwt_error_message");
            String msg = (jwtMsg != null && !jwtMsg.isBlank()) ? jwtMsg : "Full authentication is required to access this resource";
            return buildError(HttpStatus.UNAUTHORIZED, msg, request);
        }
        return buildError(HttpStatus.FORBIDDEN, "Access denied: insufficient permissions", request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex,
                                                               HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", request);
    }

    private ResponseEntity<ErrorResponse> buildError(HttpStatus status, String message,
                                                      HttpServletRequest request) {
        ErrorResponse err = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();
        return ResponseEntity.status(status).body(err);
    }
}
