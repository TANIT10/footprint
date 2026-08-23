package com.footprint.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.footprint.backend.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(LoginFailedException.class)
    public ResponseEntity<ErrorResponse> handleLoginFailedException(
            LoginFailedException e) {

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException e) {

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                e.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errorResponse);
    }

    @ExceptionHandler(
        org.springframework.web.bind.MethodArgumentNotValidException.class
)
public ResponseEntity<ErrorResponse> handleValidationException(
        org.springframework.web.bind.MethodArgumentNotValidException e) {

    ErrorResponse errorResponse =
            new ErrorResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    e.getBindingResult()
                    .getFieldErrors()
                    .get(0)
                    .getDefaultMessage()
            );

    return ResponseEntity
            .badRequest()
            .body(errorResponse);
}
}