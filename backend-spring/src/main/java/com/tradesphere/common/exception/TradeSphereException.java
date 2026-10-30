package com.tradesphere.common.exception;

public class TradeSphereException extends RuntimeException {
    public TradeSphereException(String message) {
        super(message);
    }

    public TradeSphereException(String message, Throwable cause) {
        super(message, cause);
    }
}
