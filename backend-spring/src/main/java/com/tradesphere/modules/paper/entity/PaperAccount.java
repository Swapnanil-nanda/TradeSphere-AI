package com.tradesphere.modules.paper.entity;

import com.tradesphere.modules.auth.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "paper_accounts")
public class PaperAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(name = "starting_capital", nullable = false, precision = 19, scale = 4)
    private BigDecimal startingCapital = new BigDecimal("1000000.0000");

    @Column(name = "current_cash", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentCash = new BigDecimal("1000000.0000");

    @Column(name = "net_liquidation", nullable = false, precision = 19, scale = 4)
    private BigDecimal netLiquidation = new BigDecimal("1000000.0000");

    @Column(name = "day_start_equity", nullable = false, precision = 19, scale = 4)
    private BigDecimal dayStartEquity = new BigDecimal("1000000.0000");

    @Column(name = "daily_realized_pnl", nullable = false, precision = 19, scale = 4)
    private BigDecimal dailyRealizedPnl = BigDecimal.ZERO;

    @Column(name = "daily_unrealized_pnl", nullable = false, precision = 19, scale = 4)
    private BigDecimal dailyUnrealizedPnl = BigDecimal.ZERO;

    @Column(name = "trading_locked", nullable = false)
    private boolean tradingLocked = false;

    @Column(name = "lock_reason")
    private String lockReason;

    @Column(name = "slippage_rate", precision = 8, scale = 6)
    private BigDecimal slippageRate = new BigDecimal("0.000500");

    @Column(name = "fee_rate", precision = 8, scale = 6)
    private BigDecimal feeRate = new BigDecimal("0.000300");

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PaperAccount() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public BigDecimal getStartingCapital() { return startingCapital; }
    public void setStartingCapital(BigDecimal startingCapital) { this.startingCapital = startingCapital; }
    public BigDecimal getCurrentCash() { return currentCash; }
    public void setCurrentCash(BigDecimal currentCash) { this.currentCash = currentCash; }
    public BigDecimal getNetLiquidation() { return netLiquidation; }
    public void setNetLiquidation(BigDecimal netLiquidation) { this.netLiquidation = netLiquidation; }
    public BigDecimal getDayStartEquity() { return dayStartEquity; }
    public void setDayStartEquity(BigDecimal dayStartEquity) { this.dayStartEquity = dayStartEquity; }
    public BigDecimal getDailyRealizedPnl() { return dailyRealizedPnl; }
    public void setDailyRealizedPnl(BigDecimal dailyRealizedPnl) { this.dailyRealizedPnl = dailyRealizedPnl; }
    public BigDecimal getDailyUnrealizedPnl() { return dailyUnrealizedPnl; }
    public void setDailyUnrealizedPnl(BigDecimal dailyUnrealizedPnl) { this.dailyUnrealizedPnl = dailyUnrealizedPnl; }
    public boolean isTradingLocked() { return tradingLocked; }
    public void setTradingLocked(boolean tradingLocked) { this.tradingLocked = tradingLocked; }
    public String getLockReason() { return lockReason; }
    public void setLockReason(String lockReason) { this.lockReason = lockReason; }
    public BigDecimal getSlippageRate() { return slippageRate; }
    public void setSlippageRate(BigDecimal slippageRate) { this.slippageRate = slippageRate; }
    public BigDecimal getFeeRate() { return feeRate; }
    public void setFeeRate(BigDecimal feeRate) { this.feeRate = feeRate; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
