package com.tradesphere.modules.paper.dto;

import jakarta.validation.constraints.NotBlank;

public class ClosePositionRequest {

    @NotBlank(message = "Symbol is required")
    private String symbol;

    public ClosePositionRequest() {}

    public ClosePositionRequest(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
}
