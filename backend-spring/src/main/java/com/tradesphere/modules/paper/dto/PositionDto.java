package com.tradesphere.modules.paper.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class PositionDto {
    private Long id;
    private String symbol;
    private String side;
    private int quantity;
    private BigDecimal entryPrice;
    private BigDecimal currentPrice;
    private BigDecimal unrealizedPnL;
    private BigDecimal unrealizedPnLPct;
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    private Instant updatedAt;

    public PositionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getEntryPrice() { return entryPrice; }
    public void setEntryPrice(BigDecimal entryPrice) { this.entryPrice = entryPrice; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    public BigDecimal getUnrealizedPnL() { return unrealizedPnL; }
    public void setUnrealizedPnL(BigDecimal unrealizedPnL) { this.unrealizedPnL = unrealizedPnL; }
    public BigDecimal getUnrealizedPnLPct() { return unrealizedPnLPct; }
    public void setUnrealizedPnLPct(BigDecimal unrealizedPnLPct) { this.unrealizedPnLPct = unrealizedPnLPct; }
    public BigDecimal getStopLoss() { return stopLoss; }
    public void setStopLoss(BigDecimal stopLoss) { this.stopLoss = stopLoss; }
    public BigDecimal getTakeProfit() { return takeProfit; }
    public void setTakeProfit(BigDecimal takeProfit) { this.takeProfit = takeProfit; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
