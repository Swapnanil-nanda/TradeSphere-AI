package com.tradesphere.common.exception;

import java.time.Instant;
import java.util.List;

public class ErrorResponse {
    private boolean success = false;
    private int status;
    private String error;
    private String message;
    private Instant timestamp = Instant.now();
    private List<String> validationErrors;

    public ErrorResponse() {}

    public ErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public ErrorResponse(int status, String error, String message, List<String> validationErrors) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.validationErrors = validationErrors;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public List<String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(List<String> validationErrors) { this.validationErrors = validationErrors; }
}
