package com.tradesphere.modules.paper.dto;

import java.math.BigDecimal;

public class PositionSizeResponse {

    private String symbol;
    private BigDecimal entryPrice;
    private BigDecimal stopLossPrice;
    private int recommendedQuantity;
    private BigDecimal riskPerShare;
    private BigDecimal maxAllowedRisk;
    private BigDecimal totalCapitalAtRisk;
    private boolean riskBreached;
    private String message;

    public PositionSizeResponse() {}

    public PositionSizeResponse(
            String symbol,
            BigDecimal entryPrice,
            BigDecimal stopLossPrice,
            int recommendedQuantity,
            BigDecimal riskPerShare,
            BigDecimal maxAllowedRisk,
            BigDecimal totalCapitalAtRisk,
            boolean riskBreached,
            String message) {
        this.symbol = symbol;
        this.entryPrice = entryPrice;
        this.stopLossPrice = stopLossPrice;
        this.recommendedQuantity = recommendedQuantity;
        this.riskPerShare = riskPerShare;
        this.maxAllowedRisk = maxAllowedRisk;
        this.totalCapitalAtRisk = totalCapitalAtRisk;
        this.riskBreached = riskBreached;
        this.message = message;
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

    public int getRecommendedQuantity() {
        return recommendedQuantity;
    }

    public void setRecommendedQuantity(int recommendedQuantity) {
        this.recommendedQuantity = recommendedQuantity;
    }

    public BigDecimal getRiskPerShare() {
        return riskPerShare;
    }

    public void setRiskPerShare(BigDecimal riskPerShare) {
        this.riskPerShare = riskPerShare;
    }

    public BigDecimal getMaxAllowedRisk() {
        return maxAllowedRisk;
    }

    public void setMaxAllowedRisk(BigDecimal maxAllowedRisk) {
        this.maxAllowedRisk = maxAllowedRisk;
    }

    public BigDecimal getTotalCapitalAtRisk() {
        return totalCapitalAtRisk;
    }

    public void setTotalCapitalAtRisk(BigDecimal totalCapitalAtRisk) {
        this.totalCapitalAtRisk = totalCapitalAtRisk;
    }

    public boolean isRiskBreached() {
        return riskBreached;
    }

    public void setRiskBreached(boolean riskBreached) {
        this.riskBreached = riskBreached;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
