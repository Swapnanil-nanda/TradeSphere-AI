package com.tradesphere.modules.paper.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class ConfigureAccountRequest {

    @DecimalMin(value = "1000.00", message = "Starting capital must be at least 1,000")
    private BigDecimal startingCapital;

    private String currency; // INR, USD

    private BigDecimal slippageRate; // e.g. 0.0005 for 0.05%

    private BigDecimal feeRate; // e.g. 0.0003 for 0.03%

    public ConfigureAccountRequest() {}

    public ConfigureAccountRequest(BigDecimal startingCapital, String currency) {
        this.startingCapital = startingCapital;
        this.currency = currency;
    }

    public BigDecimal getStartingCapital() { return startingCapital; }
    public void setStartingCapital(BigDecimal startingCapital) { this.startingCapital = startingCapital; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getSlippageRate() { return slippageRate; }
    public void setSlippageRate(BigDecimal slippageRate) { this.slippageRate = slippageRate; }
    public BigDecimal getFeeRate() { return feeRate; }
    public void setFeeRate(BigDecimal feeRate) { this.feeRate = feeRate; }
}
