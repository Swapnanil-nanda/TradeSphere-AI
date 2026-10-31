package com.tradesphere.modules.watchlist.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateAlertRequest {

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotBlank(message = "Alert type is required")
    private String alertType; // PRICE_ABOVE, PRICE_BELOW, VOLUME_SPIKE, RSI_OVERBOUGHT, RSI_OVERSOLD

    @NotNull(message = "Target value is required")
    @DecimalMin(value = "0.0001", message = "Target value must be positive")
    private BigDecimal targetValue;

    private String notes;

    public CreateAlertRequest() {}

    public CreateAlertRequest(String symbol, String alertType, BigDecimal targetValue, String notes) {
        this.symbol = symbol;
        this.alertType = alertType;
        this.targetValue = targetValue;
        this.notes = notes;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }
    public BigDecimal getTargetValue() { return targetValue; }
    public void setTargetValue(BigDecimal targetValue) { this.targetValue = targetValue; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
