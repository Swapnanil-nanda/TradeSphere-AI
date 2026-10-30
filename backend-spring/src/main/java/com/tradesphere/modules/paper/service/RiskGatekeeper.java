package com.tradesphere.modules.paper.service;

import com.tradesphere.common.exception.RiskGatekeeperException;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.paper.dto.OrderRequest;
import com.tradesphere.modules.paper.entity.PaperAccount;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class RiskGatekeeper {

    /**
     * Synchronously validates an incoming order against all Rule A risk invariants.
     */
    public void validateOrder(User user, PaperAccount account, OrderRequest order, BigDecimal currentPrice) {
        // Invariant 1: Circuit Breaker Check
        if (account.isTradingLocked()) {
            throw new RiskGatekeeperException("CIRCUIT_BREAKER_ACTIVE",
                    "Daily Drawdown Circuit Breaker is active (" + account.getLockReason() + "). All new opening orders locked.");
        }

        BigDecimal dayStart = account.getDayStartEquity();
        BigDecimal dailyTotalPnl = account.getDailyRealizedPnl().add(account.getDailyUnrealizedPnl());
        if (dailyTotalPnl.compareTo(BigDecimal.ZERO) < 0) {
            BigDecimal loss = dailyTotalPnl.abs();
            BigDecimal drawdownPct = loss.divide(dayStart, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            if (drawdownPct.compareTo(user.getDailyDrawdownLimitPct()) >= 0) {
                account.setTradingLocked(true);
                account.setLockReason(String.format("Daily drawdown %.2f%% breached limit of %.2f%%",
                        drawdownPct.doubleValue(), user.getDailyDrawdownLimitPct().doubleValue()));
                throw new RiskGatekeeperException("CIRCUIT_BREAKER_TRIPPED",
                        "Daily drawdown limit of " + user.getDailyDrawdownLimitPct() + "% breached. Trading locked for session.");
            }
        }

        // Invariant 2: Mandatory Hard Stop-Loss in Basic & Active modes
        String tier = user.getTier() != null ? user.getTier().toUpperCase() : "ACTIVE";
        boolean isBracketOrLimit = "BRACKET".equalsIgnoreCase(order.getOrderType()) || "LIMIT".equalsIgnoreCase(order.getOrderType());
        if (("BASIC".equals(tier) || "ACTIVE".equals(tier) || isBracketOrLimit) && order.getStopLoss() == null) {
            throw new RiskGatekeeperException("MANDATORY_STOP_LOSS_REQUIRED",
                    "Hard Stop-Loss price is mandatory before execution under " + tier + " tier guardrails.");
        }

        BigDecimal entryPrice = order.getLimitPrice() != null ? order.getLimitPrice() : currentPrice;

        // Invariant 3: Single-Trade Max Loss Cap
        if (order.getStopLoss() != null) {
            BigDecimal stopLoss = order.getStopLoss();
            BigDecimal riskDistance = entryPrice.subtract(stopLoss).abs();

            if (riskDistance.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RiskGatekeeperException("INVALID_STOP_LOSS",
                        "Stop-Loss price cannot equal entry price (" + entryPrice + ").");
            }

            BigDecimal totalTradeRisk = riskDistance.multiply(BigDecimal.valueOf(order.getQuantity()));
            BigDecimal maxAllowedRisk = account.getNetLiquidation()
                    .multiply(user.getRiskCapPct())
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            if (totalTradeRisk.compareTo(maxAllowedRisk) > 0) {
                throw new RiskGatekeeperException("MAX_LOSS_CAP_EXCEEDED",
                        String.format("Trade risk %s exceeds single-trade max loss cap of %s (%.1f%% of equity). Reduce quantity.",
                                totalTradeRisk.setScale(2, RoundingMode.HALF_UP),
                                maxAllowedRisk.setScale(2, RoundingMode.HALF_UP),
                                user.getRiskCapPct().doubleValue()));
            }

            // Invariant 4: Minimum 1.50R Reward:Risk Check for Bracket Orders
            if (order.getTakeProfit() != null) {
                BigDecimal takeProfit = order.getTakeProfit();
                BigDecimal rewardDistance = takeProfit.subtract(entryPrice).abs();

                BigDecimal rMultiple = rewardDistance.divide(riskDistance, 2, RoundingMode.HALF_UP);
                if (rMultiple.compareTo(new BigDecimal("1.50")) < 0) {
                    throw new RiskGatekeeperException("SUBOPTIMAL_RISK_REWARD",
                            String.format("Sub-optimal Reward:Risk (%.2fR). Institutional threshold requires at least 1.50R.",
                                    rMultiple.doubleValue()));
                }
            }
        }

        // Invariant 5: Cash / Margin Adequacy
        BigDecimal orderTotal = entryPrice.multiply(BigDecimal.valueOf(order.getQuantity()));
        if (orderTotal.compareTo(account.getCurrentCash()) > 0) {
            throw new RiskGatekeeperException("INSUFFICIENT_MARGIN",
                    String.format("Required cash %s exceeds available paper cash balance of %s.",
                            orderTotal.setScale(2, RoundingMode.HALF_UP),
                            account.getCurrentCash().setScale(2, RoundingMode.HALF_UP)));
        }
    }
}
