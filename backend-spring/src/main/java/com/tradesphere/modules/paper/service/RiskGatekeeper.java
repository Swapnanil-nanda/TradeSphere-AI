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

    public void validateOrder(User user, PaperAccount account, OrderRequest order, BigDecimal currentPrice) {
        validateOrder(user, account, order, currentPrice, null);
    }

    /**
     * Synchronously validates an incoming order against all Rule A risk invariants.
     */
    public void validateOrder(User user, PaperAccount account, OrderRequest order, BigDecimal currentPrice, Integer heldQuantity) {
        // Invariant 0: Positive quantity and finite positive market price
        if (order.getQuantity() == null || order.getQuantity() <= 0) {
            throw new RiskGatekeeperException("INVALID_QUANTITY", "Order quantity must be a positive integer.");
        }

        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RiskGatekeeperException("INVALID_MARKET_PRICE", "Market price must be a positive non-zero value.");
        }

        if (order.getLimitPrice() != null && order.getLimitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RiskGatekeeperException("INVALID_LIMIT_PRICE", "Limit price must be a positive non-zero value.");
        }

        String side = order.getSide() != null ? order.getSide().trim().toUpperCase() : "BUY";
        if (!"BUY".equals(side) && !"SELL".equals(side)) {
            throw new RiskGatekeeperException("INVALID_SIDE", "Order side must be BUY or SELL.");
        }

        // Invariant 1: Circuit Breaker Check
        if (account.isTradingLocked()) {
            throw new RiskGatekeeperException("CIRCUIT_BREAKER_ACTIVE",
                    "Daily Drawdown Circuit Breaker is active (" + account.getLockReason() + "). All new opening orders locked.");
        }

        BigDecimal dayStart = account.getDayStartEquity();
        BigDecimal dailyTotalPnl = account.getDailyRealizedPnl().add(account.getDailyUnrealizedPnl());
        if (dailyTotalPnl.compareTo(BigDecimal.ZERO) < 0 && dayStart.compareTo(BigDecimal.ZERO) > 0) {
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

        BigDecimal entryPrice = order.getLimitPrice() != null ? order.getLimitPrice() : currentPrice;

        // Invariant 2: Directional Stop-Loss validation (if provided)
        if (order.getStopLoss() != null) {
            BigDecimal stopLoss = order.getStopLoss();
            if (stopLoss.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RiskGatekeeperException("INVALID_STOP_LOSS", "Stop-Loss price must be positive and non-zero.");
            }

            if ("BUY".equals(side) && stopLoss.compareTo(entryPrice) >= 0) {
                throw new RiskGatekeeperException("INVALID_STOP_LOSS",
                        String.format("Stop-Loss price (%s) must be strictly below entry price (%s) for BUY orders.", stopLoss, entryPrice));
            } else if ("SELL".equals(side) && stopLoss.compareTo(entryPrice) <= 0) {
                throw new RiskGatekeeperException("INVALID_STOP_LOSS",
                        String.format("Stop-Loss price (%s) must be strictly above entry price (%s) for SELL orders.", stopLoss, entryPrice));
            }
        }

        // Invariant 3: Directional Take-Profit validation (if provided)
        if (order.getTakeProfit() != null) {
            BigDecimal takeProfit = order.getTakeProfit();
            if (takeProfit.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RiskGatekeeperException("INVALID_TAKE_PROFIT", "Take-Profit price must be positive and non-zero.");
            }

            if ("BUY".equals(side) && takeProfit.compareTo(entryPrice) <= 0) {
                throw new RiskGatekeeperException("INVALID_TAKE_PROFIT",
                        String.format("Take-Profit price (%s) must be strictly above entry price (%s) for BUY orders.", takeProfit, entryPrice));
            } else if ("SELL".equals(side) && takeProfit.compareTo(entryPrice) >= 0) {
                throw new RiskGatekeeperException("INVALID_TAKE_PROFIT",
                        String.format("Take-Profit price (%s) must be strictly below entry price (%s) for SELL orders.", takeProfit, entryPrice));
            }
        }

        // Real-World Cap: Position Ownership for SELL Orders
        if ("SELL".equals(side)) {
            int held = (heldQuantity != null) ? heldQuantity : 0;
            if (held < order.getQuantity()) {
                throw new RiskGatekeeperException("INSUFFICIENT_POSITION",
                        String.format("You hold %d shares of %s. Cannot execute SELL of %d shares.",
                                held, order.getSymbol(), order.getQuantity()));
            }
        }

        // Real-World Cap: Cash / Margin Adequacy for BUY Orders (Actual Buying Power)
        if ("BUY".equals(side)) {
            BigDecimal orderTotal = entryPrice.multiply(BigDecimal.valueOf(order.getQuantity()));
            if (orderTotal.compareTo(account.getCurrentCash()) > 0) {
                throw new RiskGatekeeperException("INSUFFICIENT_MARGIN",
                        String.format("Required cash %s exceeds available paper cash balance of %s.",
                                orderTotal.setScale(2, RoundingMode.HALF_UP),
                                account.getCurrentCash().setScale(2, RoundingMode.HALF_UP)));
            }
        }
    }
}
