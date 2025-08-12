package com.aefstathiou.crm.exception;

import com.aefstathiou.crm.model.ApiError;
import com.aefstathiou.crm.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler{

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleIEntityNotFoundException(EntityNotFoundException ex) {
        logger.trace("Entity not found", ex);
        ApiError error = new ApiError("ENTITY_NOT_FOUND",ex.getMessage());
        return new ResponseEntity<>(error,HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.trace("Invalid arguments", ex);
        ApiError error = new ApiError("ILLEGAL_ARGUMENT",ex.getMessage());
        return new ResponseEntity<>(error,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalStateException(IllegalStateException ex) {
        logger.trace("Invalid state", ex);
        ApiError error = new ApiError("ILLEGAL_STATE",ex.getMessage());
        return new ResponseEntity<>(error,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiError> handleAuthorizationDeniedException(AuthorizationDeniedException ex) {
        logger.trace("Unexpected error", ex);
        ApiError error = new ApiError("UNAUTHORIZED","The user is not authorized to access the resource.");
        return new ResponseEntity<>(error,HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentialsException(BadCredentialsException ex) {
        logger.trace("Bad Credentials", ex);
        ApiError error = new ApiError("UNAUTHORIZED","Invalid credentials");
        return new ResponseEntity<>(error,HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> handleForbiddenException(ForbiddenException ex) {
        logger.warn("Access denied: {}", ex.getMessage());
        ApiError error = new ApiError("ACCESS_DENIED", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(FileValidationException.class)
    public ResponseEntity<ApiError> handleFileValidationException(FileValidationException ex) {
        logger.warn("Invalid file upload: {}", ex.getMessage());
        ApiError error = new ApiError("INVALID_FILE", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiError> handleFileStorageException(FileStorageException ex) {
        logger.warn("Error on file upload: {}", ex.getMessage());
        ApiError error = new ApiError("INTERNAL_SERVER_ERROR", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiError> handleUnauthorizedException(UnauthorizedException ex) {
        logger.warn("Unauthorized exception: {}", ex.getMessage());
        ApiError error = new ApiError("UNAUTHORIZED", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneralException(Exception ex) {
        logger.trace("Unexpected error", ex);
        ApiError error = new ApiError("INTERNAL_ERROR","An unexpected error occurred.");
        return new ResponseEntity<>(error,HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
