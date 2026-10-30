package com.tradesphere.modules.auth.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class UpdateProfileRequest {
    private String fullName;
    private String tier;

    @DecimalMin(value = "0.20", message = "Risk cap cannot be lower than 0.20%")
    @DecimalMax(value = "5.00", message = "Risk cap cannot exceed 5.00%")
    private BigDecimal riskCapPct;

    @DecimalMin(value = "1.00", message = "Daily drawdown limit cannot be lower than 1.00%")
    @DecimalMax(value = "10.00", message = "Daily drawdown limit cannot exceed 10.00%")
    private BigDecimal dailyDrawdownLimitPct;

    public UpdateProfileRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public BigDecimal getRiskCapPct() { return riskCapPct; }
    public void setRiskCapPct(BigDecimal riskCapPct) { this.riskCapPct = riskCapPct; }
    public BigDecimal getDailyDrawdownLimitPct() { return dailyDrawdownLimitPct; }
    public void setDailyDrawdownLimitPct(BigDecimal dailyDrawdownLimitPct) { this.dailyDrawdownLimitPct = dailyDrawdownLimitPct; }
}
