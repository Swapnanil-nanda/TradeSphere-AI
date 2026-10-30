package com.tradesphere.common.exception;

public class ResourceNotFoundException extends TradeSphereException {
    public ResourceNotFoundException(String resource, String field, Object value) {
        super(String.format("%s not found with %s: '%s'", resource, field, value));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
