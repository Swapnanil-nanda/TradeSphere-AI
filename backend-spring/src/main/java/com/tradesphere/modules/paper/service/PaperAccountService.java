package com.tradesphere.modules.paper.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.modules.audit.service.AuditEventService;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.instrument.dto.TickerQuoteDto;
import com.tradesphere.modules.instrument.service.MarketDataService;
import com.tradesphere.modules.paper.dto.AccountSummaryDto;
import com.tradesphere.modules.paper.dto.ConfigureAccountRequest;
import com.tradesphere.modules.paper.dto.ReconciliationReportDto;
import com.tradesphere.modules.paper.entity.CashLedgerEntry;
import com.tradesphere.modules.paper.entity.PaperAccount;
import com.tradesphere.modules.paper.entity.Position;
import com.tradesphere.modules.paper.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
public class PaperAccountService {

    private final PaperAccountRepository paperAccountRepository;
    private final CashLedgerEntryRepository ledgerRepository;
    private final PositionRepository positionRepository;
    private final PaperOrderRepository paperOrderRepository;
    private final PaperTradeRepository paperTradeRepository;
    private final MarketDataService marketDataService;
    private final AuditEventService auditEventService;

    public PaperAccountService(
            PaperAccountRepository paperAccountRepository,
            CashLedgerEntryRepository ledgerRepository,
            PositionRepository positionRepository,
            PaperOrderRepository paperOrderRepository,
            PaperTradeRepository paperTradeRepository,
            MarketDataService marketDataService,
            AuditEventService auditEventService) {
        this.paperAccountRepository = paperAccountRepository;
        this.ledgerRepository = ledgerRepository;
        this.positionRepository = positionRepository;
        this.paperOrderRepository = paperOrderRepository;
        this.paperTradeRepository = paperTradeRepository;
        this.marketDataService = marketDataService;
        this.auditEventService = auditEventService;
    }

    @Transactional
    public PaperAccount provisionDefaultAccount(User user) {
        return paperAccountRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    BigDecimal initialEquity = new BigDecimal("1000000.0000");
                    PaperAccount act = new PaperAccount();
                    act.setUser(user);
                    act.setCurrency("INR");
                    act.setStartingCapital(initialEquity);
                    act.setCurrentCash(initialEquity);
                    act.setNetLiquidation(initialEquity);
                    act.setDayStartEquity(initialEquity);
                    act.setSlippageRate(new BigDecimal("0.000500")); // 0.05%
                    act.setFeeRate(new BigDecimal("0.000300"));      // 0.03%
                    PaperAccount saved = paperAccountRepository.save(act);

                    CashLedgerEntry ledger = new CashLedgerEntry(
                            saved,
                            "INITIAL_DEPOSIT",
                            initialEquity,
                            initialEquity,
                            "SYS_INIT_" + user.getId(),
                            "Initial simulated paper capital seed"
                    );
                    ledgerRepository.save(ledger);

                    return saved;
                });
    }

    @Transactional(readOnly = true)
    public PaperAccount getAccountEntity(Long userId) {
        return paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));
    }

    @Transactional(readOnly = true)
    public AccountSummaryDto getAccountSummary(Long userId) {
        PaperAccount act = getAccountEntity(userId);
        User user = act.getUser();

        BigDecimal dayStart = act.getDayStartEquity();
        BigDecimal dailyTotalPnl = act.getDailyRealizedPnl().add(act.getDailyUnrealizedPnl());
        BigDecimal drawdownPct = BigDecimal.ZERO;

        if (dailyTotalPnl.compareTo(BigDecimal.ZERO) < 0 && dayStart.compareTo(BigDecimal.ZERO) > 0) {
            drawdownPct = dailyTotalPnl.abs().divide(dayStart, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
        }

        AccountSummaryDto dto = new AccountSummaryDto();
        dto.setId(act.getId());
        dto.setUserId(userId);
        dto.setCurrency(act.getCurrency());
        dto.setStartingCapital(act.getStartingCapital().setScale(2, RoundingMode.HALF_UP));
        dto.setCurrentCash(act.getCurrentCash().setScale(2, RoundingMode.HALF_UP));
        dto.setNetLiquidation(act.getNetLiquidation().setScale(2, RoundingMode.HALF_UP));
        dto.setDayStartEquity(act.getDayStartEquity().setScale(2, RoundingMode.HALF_UP));
        dto.setDailyRealizedPnl(act.getDailyRealizedPnl().setScale(2, RoundingMode.HALF_UP));
        dto.setDailyUnrealizedPnl(act.getDailyUnrealizedPnl().setScale(2, RoundingMode.HALF_UP));
        dto.setDailyTotalPnl(dailyTotalPnl.setScale(2, RoundingMode.HALF_UP));
        dto.setDailyDrawdownPct(drawdownPct);
        dto.setMaxRiskPerTradePct(user.getRiskCapPct());
        dto.setDailyDrawdownLimitPct(user.getDailyDrawdownLimitPct());
        dto.setTradingLocked(act.isTradingLocked());
        dto.setLockReason(act.getLockReason());
        dto.setUpdatedAt(act.getUpdatedAt());

        return dto;
    }

    @Transactional
    public AccountSummaryDto configureAccount(Long userId, ConfigureAccountRequest req) {
        PaperAccount act = getAccountEntity(userId);

        if (req.getStartingCapital() != null) {
            act.setStartingCapital(req.getStartingCapital().setScale(4, RoundingMode.HALF_UP));
        }
        if (req.getCurrency() != null && !req.getCurrency().isBlank()) {
            act.setCurrency(req.getCurrency().trim().toUpperCase());
        }
        if (req.getSlippageRate() != null) {
            act.setSlippageRate(req.getSlippageRate());
        }
        if (req.getFeeRate() != null) {
            act.setFeeRate(req.getFeeRate());
        }
        act.setUpdatedAt(Instant.now());
        paperAccountRepository.save(act);

        auditEventService.logEvent(userId, "ACCOUNT_CONFIGURED",
                String.format("Configured paper account: startingCapital=%s, currency=%s, slippage=%s, fee=%s",
                        act.getStartingCapital(), act.getCurrency(), act.getSlippageRate(), act.getFeeRate()));

        return getAccountSummary(userId);
    }

    @Transactional
    public AccountSummaryDto resetAccount(Long userId, BigDecimal customCapital) {
        PaperAccount act = getAccountEntity(userId);
        BigDecimal resetCapital = (customCapital != null && customCapital.compareTo(BigDecimal.ZERO) > 0)
                ? customCapital.setScale(4, RoundingMode.HALF_UP)
                : act.getStartingCapital();

        // Clear all open positions
        positionRepository.deleteAll(positionRepository.findByAccountId(act.getId()));

        // Cancel any pending open limit orders
        paperOrderRepository.findByAccountIdAndStatusOrderByCreatedAtDesc(act.getId(), "OPEN").forEach(order -> {
            order.setStatus("CANCELLED");
            order.setRejectionReason("Cancelled due to account reset");
            order.setUpdatedAt(Instant.now());
            paperOrderRepository.save(order);
        });

        act.setStartingCapital(resetCapital);
        act.setCurrentCash(resetCapital);
        act.setNetLiquidation(resetCapital);
        act.setDayStartEquity(resetCapital);
        act.setDailyRealizedPnl(BigDecimal.ZERO);
        act.setDailyUnrealizedPnl(BigDecimal.ZERO);
        act.setTradingLocked(false);
        act.setLockReason(null);
        act.setUpdatedAt(Instant.now());

        PaperAccount saved = paperAccountRepository.save(act);

        // Record reset event in cash ledger
        CashLedgerEntry entry = new CashLedgerEntry(
                saved,
                "ACCOUNT_RESET",
                resetCapital,
                resetCapital,
                "RESET_" + System.currentTimeMillis(),
                "Account balance re-initialized to virtual paper capital: " + resetCapital
        );
        ledgerRepository.save(entry);

        auditEventService.logEvent(userId, "ACCOUNT_RESET",
                "User reset paper trading balance back to initial capital: " + resetCapital);

        return getAccountSummary(userId);
    }

    @Transactional(readOnly = true)
    public ReconciliationReportDto reconcileAccount(Long userId) {
        PaperAccount act = getAccountEntity(userId);
        List<CashLedgerEntry> entries = ledgerRepository.findByAccountIdOrderByCreatedAtDesc(act.getId());

        // Find the most recent baseline entry (INITIAL_DEPOSIT or ACCOUNT_RESET)
        BigDecimal baselineCapital = BigDecimal.ZERO;
        int baselineIndex = -1;
        for (int i = 0; i < entries.size(); i++) {
            CashLedgerEntry e = entries.get(i);
            if ("INITIAL_DEPOSIT".equalsIgnoreCase(e.getEntryType()) || "ACCOUNT_RESET".equalsIgnoreCase(e.getEntryType())) {
                baselineCapital = e.getAmount();
                baselineIndex = i;
                break;
            }
        }

        BigDecimal debits = BigDecimal.ZERO;
        BigDecimal credits = BigDecimal.ZERO;

        // Sum entries since baseline
        int startIndex = baselineIndex >= 0 ? baselineIndex - 1 : entries.size() - 1;
        for (int i = startIndex; i >= 0; i--) {
            CashLedgerEntry e = entries.get(i);
            if (e.getAmount().compareTo(BigDecimal.ZERO) < 0) {
                debits = debits.add(e.getAmount().abs());
            } else {
                credits = credits.add(e.getAmount());
            }
        }

        BigDecimal computedCash = baselineCapital.subtract(debits).add(credits);
        BigDecimal variance = act.getCurrentCash().subtract(computedCash).abs();

        // Calculate positions market value
        List<Position> positions = positionRepository.findByAccountId(act.getId());
        BigDecimal positionsMtm = BigDecimal.ZERO;
        for (Position p : positions) {
            TickerQuoteDto quote = marketDataService.getQuote(p.getInstrument().getSymbol());
            positionsMtm = positionsMtm.add(quote.getLtp().multiply(BigDecimal.valueOf(p.getQuantity())));
        }

        BigDecimal netLiquidation = act.getCurrentCash().add(positionsMtm);

        ReconciliationReportDto r = new ReconciliationReportDto();
        r.setAccountId(act.getId());
        r.setCurrentCash(act.getCurrentCash().setScale(2, RoundingMode.HALF_UP));
        r.setStartingCapital(act.getStartingCapital().setScale(2, RoundingMode.HALF_UP));
        r.setTotalLedgerDebits(debits.setScale(2, RoundingMode.HALF_UP));
        r.setTotalLedgerCredits(credits.setScale(2, RoundingMode.HALF_UP));
        r.setComputedCashFromLedger(computedCash.setScale(2, RoundingMode.HALF_UP));
        r.setCashVariance(variance.setScale(2, RoundingMode.HALF_UP));
        r.setReconciled(variance.compareTo(new BigDecimal("0.01")) <= 0);
        r.setTotalPositionsMarketValue(positionsMtm.setScale(2, RoundingMode.HALF_UP));
        r.setNetLiquidation(netLiquidation.setScale(2, RoundingMode.HALF_UP));
        r.setTotalOrders(paperOrderRepository.findByAccountIdOrderByCreatedAtDesc(act.getId()).size());
        r.setTotalTrades(paperTradeRepository.findByAccountIdOrderByExecutedAtDesc(act.getId()).size());
        r.setTotalLedgerEntries(entries.size());

        return r;
    }
}
