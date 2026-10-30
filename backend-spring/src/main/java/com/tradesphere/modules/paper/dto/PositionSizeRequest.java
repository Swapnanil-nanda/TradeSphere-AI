package com.tradesphere.modules.paper.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PositionSizeRequest {

    @NotBlank(message = "Symbol is required")
    private String symbol;

    private BigDecimal entryPrice;

    @NotNull(message = "Stop-Loss price is required")
    private BigDecimal stopLossPrice;

    private BigDecimal riskPct;

    public PositionSizeRequest() {}

    public PositionSizeRequest(String symbol, BigDecimal entryPrice, BigDecimal stopLossPrice, BigDecimal riskPct) {
        this.symbol = symbol;
        this.entryPrice = entryPrice;
        this.stopLossPrice = stopLossPrice;
        this.riskPct = riskPct;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public BigDecimal getEntryPrice() {
        return entryPrice;
    }

    public void setEntryPrice(BigDecimal entryPrice) {
        this.entryPrice = entryPrice;
    }

    public BigDecimal getStopLossPrice() {
        return stopLossPrice;
    }

    public void setStopLossPrice(BigDecimal stopLossPrice) {
        this.stopLossPrice = stopLossPrice;
    }

    public BigDecimal getRiskPct() {
        return riskPct;
    }

    public void setRiskPct(BigDecimal riskPct) {
        this.riskPct = riskPct;
    }
}
