package com.tradesphere.modules.portfolio.dto;

import java.math.BigDecimal;
import java.util.List;

public class EquityHistoryResponseDto {
    private String currency;
    private BigDecimal initialEquity;
    private BigDecimal currentEquity;
    private String dataStatus;
    private String benchmark;
    private List<EquityPointDto> points;
    private PortfolioAnalyticsDto analytics;

    public EquityHistoryResponseDto() {}

    public EquityHistoryResponseDto(String currency, BigDecimal initialEquity, BigDecimal currentEquity,
                                    String dataStatus, String benchmark, List<EquityPointDto> points,
                                    PortfolioAnalyticsDto analytics) {
        this.currency = currency;
        this.initialEquity = initialEquity;
        this.currentEquity = currentEquity;
        this.dataStatus = dataStatus;
        this.benchmark = benchmark;
        this.points = points;
        this.analytics = analytics;
    }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getInitialEquity() { return initialEquity; }
    public void setInitialEquity(BigDecimal initialEquity) { this.initialEquity = initialEquity; }

    public BigDecimal getCurrentEquity() { return currentEquity; }
    public void setCurrentEquity(BigDecimal currentEquity) { this.currentEquity = currentEquity; }

    public String getDataStatus() { return dataStatus; }
    public void setDataStatus(String dataStatus) { this.dataStatus = dataStatus; }

    public String getBenchmark() { return benchmark; }
    public void setBenchmark(String benchmark) { this.benchmark = benchmark; }

    public List<EquityPointDto> getPoints() { return points; }
    public void setPoints(List<EquityPointDto> points) { this.points = points; }

    public PortfolioAnalyticsDto getAnalytics() { return analytics; }
    public void setAnalytics(PortfolioAnalyticsDto analytics) { this.analytics = analytics; }
}
