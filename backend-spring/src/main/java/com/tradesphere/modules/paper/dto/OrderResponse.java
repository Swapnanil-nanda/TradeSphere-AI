package com.tradesphere.modules.paper.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class OrderResponse {
    private Long id;
    private String clientOrderId;
    private String symbol;
    private String side;
    private String orderType;
    private String status;
    private int quantity;
    private BigDecimal limitPrice;
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    private BigDecimal executedPrice;
    private BigDecimal feeAmount;
    private BigDecimal slippageAmount;
    private String message;
    private boolean isSimulated = true;
    private String disclaimer = "PAPER TRADING – NO REAL MONEY";
    private Instant createdAt;

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClientOrderId() { return clientOrderId; }
    public void setClientOrderId(String clientOrderId) { this.clientOrderId = clientOrderId; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getLimitPrice() { return limitPrice; }
    public void setLimitPrice(BigDecimal limitPrice) { this.limitPrice = limitPrice; }
    public BigDecimal getStopLoss() { return stopLoss; }
    public void setStopLoss(BigDecimal stopLoss) { this.stopLoss = stopLoss; }
    public BigDecimal getTakeProfit() { return takeProfit; }
    public void setTakeProfit(BigDecimal takeProfit) { this.takeProfit = takeProfit; }
    public BigDecimal getExecutedPrice() { return executedPrice; }
    public void setExecutedPrice(BigDecimal executedPrice) { this.executedPrice = executedPrice; }
    public BigDecimal getFeeAmount() { return feeAmount; }
    public void setFeeAmount(BigDecimal feeAmount) { this.feeAmount = feeAmount; }
    public BigDecimal getSlippageAmount() { return slippageAmount; }
    public void setSlippageAmount(BigDecimal slippageAmount) { this.slippageAmount = slippageAmount; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isSimulated() { return isSimulated; }
    public void setSimulated(boolean simulated) { isSimulated = simulated; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
