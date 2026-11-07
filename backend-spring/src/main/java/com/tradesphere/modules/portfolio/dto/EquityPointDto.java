package com.tradesphere.modules.portfolio.dto;

import java.math.BigDecimal;

public class EquityPointDto {
    private long timestamp;
    private String dateStr;
    private BigDecimal equity;
    private BigDecimal cash;
    private BigDecimal unrealizedPnl;
    private BigDecimal realizedPnl;
    private BigDecimal benchmark;

    public EquityPointDto() {}

    public EquityPointDto(long timestamp, String dateStr, BigDecimal equity, BigDecimal cash,
                          BigDecimal unrealizedPnl, BigDecimal realizedPnl, BigDecimal benchmark) {
        this.timestamp = timestamp;
        this.dateStr = dateStr;
        this.equity = equity;
        this.cash = cash;
        this.unrealizedPnl = unrealizedPnl;
        this.realizedPnl = realizedPnl;
        this.benchmark = benchmark;
    }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public String getDateStr() { return dateStr; }
    public void setDateStr(String dateStr) { this.dateStr = dateStr; }

    public BigDecimal getEquity() { return equity; }
    public void setEquity(BigDecimal equity) { this.equity = equity; }

    public BigDecimal getCash() { return cash; }
    public void setCash(BigDecimal cash) { this.cash = cash; }

    public BigDecimal getUnrealizedPnl() { return unrealizedPnl; }
    public void setUnrealizedPnl(BigDecimal unrealizedPnl) { this.unrealizedPnl = unrealizedPnl; }

    public BigDecimal getRealizedPnl() { return realizedPnl; }
    public void setRealizedPnl(BigDecimal realizedPnl) { this.realizedPnl = realizedPnl; }

    public BigDecimal getBenchmark() { return benchmark; }
    public void setBenchmark(BigDecimal benchmark) { this.benchmark = benchmark; }
}
