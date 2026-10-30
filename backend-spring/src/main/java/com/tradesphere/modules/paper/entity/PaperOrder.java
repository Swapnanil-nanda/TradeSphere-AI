package com.tradesphere.modules.paper.entity;

import com.tradesphere.modules.instrument.entity.Instrument;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "paper_orders")
public class PaperOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private PaperAccount account;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(name = "order_type", nullable = false, length = 50)
    private String orderType; // MARKET, LIMIT, BRACKET

    @Column(nullable = false, length = 10)
    private String side; // BUY, SELL

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, FILLED, REJECTED, CANCELLED

    @Column(nullable = false)
    private int quantity;

    @Column(name = "limit_price", precision = 19, scale = 4)
    private BigDecimal limitPrice;

    @Column(name = "stop_loss_price", precision = 19, scale = 4)
    private BigDecimal stopLossPrice;

    @Column(name = "take_profit_price", precision = 19, scale = 4)
    private BigDecimal takeProfitPrice;

    @Column(name = "executed_price", precision = 19, scale = 4)
    private BigDecimal executedPrice;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "client_order_id", length = 100)
    private String clientOrderId;

    @Column(name = "fee_amount", precision = 19, scale = 4)
    private BigDecimal feeAmount = BigDecimal.ZERO;

    @Column(name = "slippage_amount", precision = 19, scale = 4)
    private BigDecimal slippageAmount = BigDecimal.ZERO;

    @Column(name = "parent_order_id")
    private Long parentOrderId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PaperOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PaperAccount getAccount() { return account; }
    public void setAccount(PaperAccount account) { this.account = account; }
    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getLimitPrice() { return limitPrice; }
    public void setLimitPrice(BigDecimal limitPrice) { this.limitPrice = limitPrice; }
    public BigDecimal getStopLossPrice() { return stopLossPrice; }
    public void setStopLossPrice(BigDecimal stopLossPrice) { this.stopLossPrice = stopLossPrice; }
    public BigDecimal getTakeProfitPrice() { return takeProfitPrice; }
    public void setTakeProfitPrice(BigDecimal takeProfitPrice) { this.takeProfitPrice = takeProfitPrice; }
    public BigDecimal getExecutedPrice() { return executedPrice; }
    public void setExecutedPrice(BigDecimal executedPrice) { this.executedPrice = executedPrice; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getClientOrderId() { return clientOrderId; }
    public void setClientOrderId(String clientOrderId) { this.clientOrderId = clientOrderId; }
    public BigDecimal getFeeAmount() { return feeAmount; }
    public void setFeeAmount(BigDecimal feeAmount) { this.feeAmount = feeAmount; }
    public BigDecimal getSlippageAmount() { return slippageAmount; }
    public void setSlippageAmount(BigDecimal slippageAmount) { this.slippageAmount = slippageAmount; }
    public Long getParentOrderId() { return parentOrderId; }
    public void setParentOrderId(Long parentOrderId) { this.parentOrderId = parentOrderId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
