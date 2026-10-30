package com.tradesphere.modules.paper.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class ReconciliationReportDto {
    private Long accountId;
    private BigDecimal currentCash;
    private BigDecimal startingCapital;
    private BigDecimal totalLedgerDebits;
    private BigDecimal totalLedgerCredits;
    private BigDecimal computedCashFromLedger;
    private BigDecimal cashVariance;
    private boolean isReconciled;
    private BigDecimal totalPositionsMarketValue;
    private BigDecimal netLiquidation;
    private int totalOrders;
    private int totalTrades;
    private int totalLedgerEntries;
    private boolean isSimulated = true;
    private String disclaimer = "PAPER TRADING – NO REAL MONEY";
    private Instant generatedAt = Instant.now();

    public ReconciliationReportDto() {}

    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public BigDecimal getCurrentCash() { return currentCash; }
    public void setCurrentCash(BigDecimal currentCash) { this.currentCash = currentCash; }
    public BigDecimal getStartingCapital() { return startingCapital; }
    public void setStartingCapital(BigDecimal startingCapital) { this.startingCapital = startingCapital; }
    public BigDecimal getTotalLedgerDebits() { return totalLedgerDebits; }
    public void setTotalLedgerDebits(BigDecimal totalLedgerDebits) { this.totalLedgerDebits = totalLedgerDebits; }
    public BigDecimal getTotalLedgerCredits() { return totalLedgerCredits; }
    public void setTotalLedgerCredits(BigDecimal totalLedgerCredits) { this.totalLedgerCredits = totalLedgerCredits; }
    public BigDecimal getComputedCashFromLedger() { return computedCashFromLedger; }
    public void setComputedCashFromLedger(BigDecimal computedCashFromLedger) { this.computedCashFromLedger = computedCashFromLedger; }
    public BigDecimal getCashVariance() { return cashVariance; }
    public void setCashVariance(BigDecimal cashVariance) { this.cashVariance = cashVariance; }
    public boolean isReconciled() { return isReconciled; }
    public void setReconciled(boolean reconciled) { isReconciled = reconciled; }
    public BigDecimal getTotalPositionsMarketValue() { return totalPositionsMarketValue; }
    public void setTotalPositionsMarketValue(BigDecimal totalPositionsMarketValue) { this.totalPositionsMarketValue = totalPositionsMarketValue; }
    public BigDecimal getNetLiquidation() { return netLiquidation; }
    public void setNetLiquidation(BigDecimal netLiquidation) { this.netLiquidation = netLiquidation; }
    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
    public int getTotalTrades() { return totalTrades; }
    public void setTotalTrades(int totalTrades) { this.totalTrades = totalTrades; }
    public int getTotalLedgerEntries() { return totalLedgerEntries; }
    public void setTotalLedgerEntries(int totalLedgerEntries) { this.totalLedgerEntries = totalLedgerEntries; }
    public boolean isSimulated() { return isSimulated; }
    public void setSimulated(boolean simulated) { isSimulated = simulated; }
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
}
