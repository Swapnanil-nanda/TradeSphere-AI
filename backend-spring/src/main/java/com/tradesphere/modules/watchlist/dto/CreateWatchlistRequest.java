package com.tradesphere.modules.watchlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateWatchlistRequest {

    @NotBlank(message = "Watchlist name is required")
    @Size(min = 2, max = 100, message = "Watchlist name must be between 2 and 100 characters")
    private String name;

    public CreateWatchlistRequest() {}

    public CreateWatchlistRequest(String name) {
        this.name = name;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
