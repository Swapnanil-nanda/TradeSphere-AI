package com.tradesphere.modules.paper.entity;

import com.tradesphere.modules.instrument.entity.Instrument;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "paper_trades")
public class PaperTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private PaperAccount account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private PaperOrder order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(nullable = false, length = 10)
    private String side; // BUY, SELL

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "realized_pnl", precision = 19, scale = 4)
    private BigDecimal realizedPnl;

    @Column(name = "r_multiple", precision = 10, scale = 2)
    private BigDecimal rMultiple;

    @Column(name = "exit_reason", length = 100)
    private String exitReason;

    @Column(name = "fee_amount", precision = 19, scale = 4)
    private BigDecimal feeAmount = BigDecimal.ZERO;

    @Column(name = "executed_at", nullable = false, updatable = false)
    private Instant executedAt = Instant.now();

    public PaperTrade() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PaperAccount getAccount() { return account; }
    public void setAccount(PaperAccount account) { this.account = account; }
    public PaperOrder getOrder() { return order; }
    public void setOrder(PaperOrder order) { this.order = order; }
    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getRealizedPnl() { return realizedPnl; }
    public void setRealizedPnl(BigDecimal realizedPnl) { this.realizedPnl = realizedPnl; }
    public BigDecimal getRMultiple() { return rMultiple; }
    public void setRMultiple(BigDecimal rMultiple) { this.rMultiple = rMultiple; }
    public String getExitReason() { return exitReason; }
    public void setExitReason(String exitReason) { this.exitReason = exitReason; }
    public BigDecimal getFeeAmount() { return feeAmount; }
    public void setFeeAmount(BigDecimal feeAmount) { this.feeAmount = feeAmount; }
    public Instant getExecutedAt() { return executedAt; }
    public void setExecutedAt(Instant executedAt) { this.executedAt = executedAt; }
}
