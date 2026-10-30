package com.tradesphere.modules.screener.dto;

import java.math.BigDecimal;

public class ScreenerFilterRequest {
    private String market; // ALL, IN, US
    private String sector;
    private String trend; // ALL, BULLISH, BEARISH, CONSOLIDATION
    private BigDecimal maxPe;
    private BigDecimal minRsi;
    private BigDecimal maxRsi;

    public ScreenerFilterRequest() {}

    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
    public BigDecimal getMaxPe() { return maxPe; }
    public void setMaxPe(BigDecimal maxPe) { this.maxPe = maxPe; }
    public BigDecimal getMinRsi() { return minRsi; }
    public void setMinRsi(BigDecimal minRsi) { this.minRsi = minRsi; }
    public BigDecimal getMaxRsi() { return maxRsi; }
    public void setMaxRsi(BigDecimal maxRsi) { this.maxRsi = maxRsi; }
}
