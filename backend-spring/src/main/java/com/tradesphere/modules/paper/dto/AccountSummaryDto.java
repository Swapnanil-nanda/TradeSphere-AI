package com.tradesphere.modules.paper.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class AccountSummaryDto {
    private Long id;
    private Long userId;
    private String currency;
    private BigDecimal startingCapital;
    private BigDecimal currentCash;
    private BigDecimal netLiquidation;
    private BigDecimal dayStartEquity;
    private BigDecimal dailyRealizedPnl;
    private BigDecimal dailyUnrealizedPnl;
    private BigDecimal dailyTotalPnl;
    private BigDecimal dailyDrawdownPct;
    private BigDecimal maxRiskPerTradePct;
    private BigDecimal dailyDrawdownLimitPct;
    private boolean tradingLocked;
    private String lockReason;
    private Instant updatedAt;

    public AccountSummaryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getStartingCapital() { return startingCapital; }
    public void setStartingCapital(BigDecimal startingCapital) { this.startingCapital = startingCapital; }
    public BigDecimal getCurrentCash() { return currentCash; }
    public void setCurrentCash(BigDecimal currentCash) { this.currentCash = currentCash; }
    public BigDecimal getNetLiquidation() { return netLiquidation; }
    public void setNetLiquidation(BigDecimal netLiquidation) { this.netLiquidation = netLiquidation; }
    public BigDecimal getDayStartEquity() { return dayStartEquity; }
    public void setDayStartEquity(BigDecimal dayStartEquity) { this.dayStartEquity = dayStartEquity; }
    public BigDecimal getDailyRealizedPnl() { return dailyRealizedPnl; }
    public void setDailyRealizedPnl(BigDecimal dailyRealizedPnl) { this.dailyRealizedPnl = dailyRealizedPnl; }
    public BigDecimal getDailyUnrealizedPnl() { return dailyUnrealizedPnl; }
    public void setDailyUnrealizedPnl(BigDecimal dailyUnrealizedPnl) { this.dailyUnrealizedPnl = dailyUnrealizedPnl; }
    public BigDecimal getDailyTotalPnl() { return dailyTotalPnl; }
    public void setDailyTotalPnl(BigDecimal dailyTotalPnl) { this.dailyTotalPnl = dailyTotalPnl; }
    public BigDecimal getDailyDrawdownPct() { return dailyDrawdownPct; }
    public void setDailyDrawdownPct(BigDecimal dailyDrawdownPct) { this.dailyDrawdownPct = dailyDrawdownPct; }
    public BigDecimal getMaxRiskPerTradePct() { return maxRiskPerTradePct; }
    public void setMaxRiskPerTradePct(BigDecimal maxRiskPerTradePct) { this.maxRiskPerTradePct = maxRiskPerTradePct; }
    public BigDecimal getDailyDrawdownLimitPct() { return dailyDrawdownLimitPct; }
    public void setDailyDrawdownLimitPct(BigDecimal dailyDrawdownLimitPct) { this.dailyDrawdownLimitPct = dailyDrawdownLimitPct; }
    public boolean isTradingLocked() { return tradingLocked; }
    public void setTradingLocked(boolean tradingLocked) { this.tradingLocked = tradingLocked; }
    public String getLockReason() { return lockReason; }
    public void setLockReason(String lockReason) { this.lockReason = lockReason; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
