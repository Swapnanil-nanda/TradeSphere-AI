package com.tradesphere.modules.paper.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class TradeDto {
    private Long id;
    private Long orderId;
    private String symbol;
    private String side;
    private int quantity;
    private BigDecimal price;
    private BigDecimal realizedPnL;
    private BigDecimal rMultiple;
    private String exitReason;
    private Instant executedAt;

    public TradeDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getRealizedPnL() { return realizedPnL; }
    public void setRealizedPnL(BigDecimal realizedPnL) { this.realizedPnL = realizedPnL; }
    public BigDecimal getRMultiple() { return rMultiple; }
    public void setRMultiple(BigDecimal rMultiple) { this.rMultiple = rMultiple; }
    public String getExitReason() { return exitReason; }
    public void setExitReason(String exitReason) { this.exitReason = exitReason; }
    public Instant getExecutedAt() { return executedAt; }
    public void setExecutedAt(Instant executedAt) { this.executedAt = executedAt; }
}
