package com.tradesphere.modules.portfolio.dto;

import java.math.BigDecimal;

public class PortfolioAnalyticsDto {
    private Double sharpeRatio;
    private Double sortinoRatio;
    private Double maxDrawdownPct;
    private Double annualizedReturnPct;
    private Double annualizedVolatilityPct;
    private Double profitFactor;
    private Double winRatePct;
    private Double averageRMultiple;
    private Double expectancy;
    private Double alpha;
    private Double beta;
    private Double fxRateInrUsd;
    private String fxSource;
    private long fxTimestamp;

    public PortfolioAnalyticsDto() {}

    public Double getSharpeRatio() { return sharpeRatio; }
    public void setSharpeRatio(Double sharpeRatio) { this.sharpeRatio = sharpeRatio; }

    public Double getSortinoRatio() { return sortinoRatio; }
    public void setSortinoRatio(Double sortinoRatio) { this.sortinoRatio = sortinoRatio; }

    public Double getMaxDrawdownPct() { return maxDrawdownPct; }
    public void setMaxDrawdownPct(Double maxDrawdownPct) { this.maxDrawdownPct = maxDrawdownPct; }

    public Double getAnnualizedReturnPct() { return annualizedReturnPct; }
    public void setAnnualizedReturnPct(Double annualizedReturnPct) { this.annualizedReturnPct = annualizedReturnPct; }

    public Double getAnnualizedVolatilityPct() { return annualizedVolatilityPct; }
    public void setAnnualizedVolatilityPct(Double annualizedVolatilityPct) { this.annualizedVolatilityPct = annualizedVolatilityPct; }

    public Double getProfitFactor() { return profitFactor; }
    public void setProfitFactor(Double profitFactor) { this.profitFactor = profitFactor; }

    public Double getWinRatePct() { return winRatePct; }
    public void setWinRatePct(Double winRatePct) { this.winRatePct = winRatePct; }

    public Double getAverageRMultiple() { return averageRMultiple; }
    public void setAverageRMultiple(Double averageRMultiple) { this.averageRMultiple = averageRMultiple; }

    public Double getExpectancy() { return expectancy; }
    public void setExpectancy(Double expectancy) { this.expectancy = expectancy; }

    public Double getAlpha() { return alpha; }
    public void setAlpha(Double alpha) { this.alpha = alpha; }

    public Double getBeta() { return beta; }
    public void setBeta(Double beta) { this.beta = beta; }

    public Double getFxRateInrUsd() { return fxRateInrUsd; }
    public void setFxRateInrUsd(Double fxRateInrUsd) { this.fxRateInrUsd = fxRateInrUsd; }

    public String getFxSource() { return fxSource; }
    public void setFxSource(String fxSource) { this.fxSource = fxSource; }

    public long getFxTimestamp() { return fxTimestamp; }
    public void setFxTimestamp(long fxTimestamp) { this.fxTimestamp = fxTimestamp; }
}
