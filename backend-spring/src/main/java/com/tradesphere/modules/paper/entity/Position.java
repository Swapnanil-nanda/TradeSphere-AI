package com.tradesphere.modules.paper.entity;

import com.tradesphere.modules.instrument.entity.Instrument;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "positions", uniqueConstraints = {
        @UniqueConstraint(name = "uq_account_instrument", columnNames = {"account_id", "instrument_id"})
})
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private PaperAccount account;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(nullable = false, length = 10)
    private String side = "BUY";

    @Column(nullable = false)
    private int quantity;

    @Column(name = "entry_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal entryPrice;

    @Column(name = "current_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "unrealized_pnl", nullable = false, precision = 19, scale = 4)
    private BigDecimal unrealizedPnl = BigDecimal.ZERO;

    @Column(name = "unrealized_pnl_pct", nullable = false, precision = 10, scale = 4)
    private BigDecimal unrealizedPnlPct = BigDecimal.ZERO;

    @Column(name = "stop_loss_price", precision = 19, scale = 4)
    private BigDecimal stopLossPrice;

    @Column(name = "take_profit_price", precision = 19, scale = 4)
    private BigDecimal takeProfitPrice;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Position() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PaperAccount getAccount() { return account; }
    public void setAccount(PaperAccount account) { this.account = account; }
    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }
    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getEntryPrice() { return entryPrice; }
    public void setEntryPrice(BigDecimal entryPrice) { this.entryPrice = entryPrice; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    public BigDecimal getUnrealizedPnl() { return unrealizedPnl; }
    public void setUnrealizedPnl(BigDecimal unrealizedPnl) { this.unrealizedPnl = unrealizedPnl; }
    public BigDecimal getUnrealizedPnlPct() { return unrealizedPnlPct; }
    public void setUnrealizedPnlPct(BigDecimal unrealizedPnlPct) { this.unrealizedPnlPct = unrealizedPnlPct; }
    public BigDecimal getStopLossPrice() { return stopLossPrice; }
    public void setStopLossPrice(BigDecimal stopLossPrice) { this.stopLossPrice = stopLossPrice; }
    public BigDecimal getTakeProfitPrice() { return takeProfitPrice; }
    public void setTakeProfitPrice(BigDecimal takeProfitPrice) { this.takeProfitPrice = takeProfitPrice; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
