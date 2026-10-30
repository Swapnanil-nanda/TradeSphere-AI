package com.tradesphere.modules.paper.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class OrderRequest {

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotBlank(message = "Side is required (BUY or SELL)")
    private String side; // BUY, SELL

    @NotBlank(message = "Order type is required (MARKET, LIMIT, BRACKET)")
    private String orderType = "MARKET";

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal limitPrice;
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    private String clientOrderId;

    public OrderRequest() {}

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getLimitPrice() { return limitPrice; }
    public void setLimitPrice(BigDecimal limitPrice) { this.limitPrice = limitPrice; }
    public BigDecimal getStopLoss() { return stopLoss; }
    public void setStopLoss(BigDecimal stopLoss) { this.stopLoss = stopLoss; }
    public BigDecimal getStopLossPrice() { return stopLoss; }
    public void setStopLossPrice(BigDecimal stopLossPrice) { this.stopLoss = stopLossPrice; }

    public BigDecimal getTakeProfit() { return takeProfit; }
    public void setTakeProfit(BigDecimal takeProfit) { this.takeProfit = takeProfit; }
    public BigDecimal getTakeProfitPrice() { return takeProfit; }
    public void setTakeProfitPrice(BigDecimal takeProfitPrice) { this.takeProfit = takeProfitPrice; }

    public String getClientOrderId() { return clientOrderId; }
    public void setClientOrderId(String clientOrderId) { this.clientOrderId = clientOrderId; }
}
