package com.tradesphere.modules.watchlist.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ReorderItemsRequest {

    @NotEmpty(message = "Ordered symbols list cannot be empty")
    private List<String> symbols;

    public ReorderItemsRequest() {}

    public ReorderItemsRequest(List<String> symbols) {
        this.symbols = symbols;
    }

    public List<String> getSymbols() { return symbols; }
    public void setSymbols(List<String> symbols) { this.symbols = symbols; }
}
