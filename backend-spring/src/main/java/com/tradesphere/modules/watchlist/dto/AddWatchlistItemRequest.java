package com.tradesphere.modules.watchlist.dto;

import jakarta.validation.constraints.NotBlank;

public class AddWatchlistItemRequest {

    @NotBlank(message = "Instrument symbol is required")
    private String symbol;

    public AddWatchlistItemRequest() {}

    public AddWatchlistItemRequest(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
}
