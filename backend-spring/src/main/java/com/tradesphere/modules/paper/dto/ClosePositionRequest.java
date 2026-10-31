package com.tradesphere.modules.paper.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class ClosePositionRequest {

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @Positive(message = "Quantity to close must be positive")
    private Integer quantity;

    public ClosePositionRequest() {}

    public ClosePositionRequest(String symbol) {
        this.symbol = symbol;
    }

    public ClosePositionRequest(String symbol, Integer quantity) {
        this.symbol = symbol;
        this.quantity = quantity;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
