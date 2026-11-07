package com.tradesphere.modules.portfolio.service;

import com.tradesphere.modules.paper.dto.AccountSummaryDto;
import com.tradesphere.modules.paper.dto.PositionDto;
import com.tradesphere.modules.paper.dto.TradeDto;
import com.tradesphere.modules.paper.service.PaperAccountService;
import com.tradesphere.modules.paper.service.PaperTradingService;
import com.tradesphere.modules.portfolio.dto.EquityHistoryResponseDto;
import com.tradesphere.modules.portfolio.dto.EquityPointDto;
import com.tradesphere.modules.portfolio.dto.PortfolioAnalyticsDto;
import com.tradesphere.modules.portfolio.dto.PortfolioSummaryResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    public static final BigDecimal USD_TO_INR_SNAPSHOT = BigDecimal.valueOf(84.25);
    public static final String FX_SOURCE = "RBI_REFERENCE_SNAPSHOT";

    private final PaperAccountService paperAccountService;
    private final PaperTradingService paperTradingService;

    public PortfolioService(PaperAccountService paperAccountService, PaperTradingService paperTradingService) {
        this.paperAccountService = paperAccountService;
        this.paperTradingService = paperTradingService;
    }

    private boolean isUsAsset(String symbol) {
        if (symbol == null) return false;
        return symbol.toUpperCase().matches("AAPL|MSFT|NVDA|TSLA|GOOGL|AMZN|SPY|QQQ");
    }

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolioSummary(Long userId) {
        AccountSummaryDto account = paperAccountService.getAccountSummary(userId);
        List<PositionDto> positions = paperTradingService.getPositions(userId);
        List<com.tradesphere.modules.paper.dto.OrderResponse> orders = paperTradingService.getOrders(userId);
        List<TradeDto> trades = paperTradingService.getTrades(userId);

        BigDecimal totalPositionsValue = BigDecimal.ZERO;
        BigDecimal totalUnrealizedPnl = BigDecimal.ZERO;

        for (PositionDto pos : positions) {
            boolean isUs = isUsAsset(pos.getSymbol());
            BigDecimal fx = isUs ? USD_TO_INR_SNAPSHOT : BigDecimal.ONE;
            BigDecimal marketVal = pos.getCurrentPrice().multiply(BigDecimal.valueOf(pos.getQuantity())).multiply(fx);
            BigDecimal unPnl = pos.getUnrealizedPnL() != null ? pos.getUnrealizedPnL().multiply(fx) : BigDecimal.ZERO;
            totalPositionsValue = totalPositionsValue.add(marketVal);
            totalUnrealizedPnl = totalUnrealizedPnl.add(unPnl);
        }

        // Dynamically compute Net Liquidation = Cash + Market Value of Positions (reconciled in INR)
        BigDecimal netLiquidation = account.getCurrentCash().add(totalPositionsValue).setScale(2, RoundingMode.HALF_UP);
        account.setNetLiquidation(netLiquidation);
        account.setDailyUnrealizedPnl(totalUnrealizedPnl.setScale(2, RoundingMode.HALF_UP));
        account.setDailyTotalPnl(account.getDailyRealizedPnl().add(totalUnrealizedPnl).setScale(2, RoundingMode.HALF_UP));

        // Edge statistics
        int totalClosed = 0;
        int winningTrades = 0;
        for (TradeDto t : trades) {
            if (t.getRealizedPnL() != null) {
                totalClosed++;
                if (t.getRealizedPnL().compareTo(BigDecimal.ZERO) > 0) {
                    winningTrades++;
                }
            }
        }

        BigDecimal winRate = totalClosed > 0
                ? BigDecimal.valueOf(winningTrades)
                        .divide(BigDecimal.valueOf(totalClosed), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        PortfolioSummaryResponse res = new PortfolioSummaryResponse();
        res.setAccount(account);
        res.setPositions(positions);
        res.setOrders(orders);
        res.setTrades(trades);
        res.setTotalPositionsValue(totalPositionsValue.setScale(2, RoundingMode.HALF_UP));
        res.setTotalTradesCount(totalClosed);
        res.setWinningTradesCount(winningTrades);
        res.setWinRatePct(winRate);

        return res;
    }

    @Transactional(readOnly = true)
    public EquityHistoryResponseDto getEquityHistory(Long userId, String period) {
        AccountSummaryDto account = paperAccountService.getAccountSummary(userId);
        List<PositionDto> positions = paperTradingService.getPositions(userId);
        List<TradeDto> trades = paperTradingService.getTrades(userId);

        BigDecimal initialEquity = account.getStartingCapital() != null ? account.getStartingCapital() : BigDecimal.valueOf(1000000.00);
        BigDecimal currentCash = account.getCurrentCash();

        // Convert USD positions to INR if base currency is INR
        BigDecimal totalPositionsValueInr = BigDecimal.ZERO;
        BigDecimal totalUnrealizedPnlInr = BigDecimal.ZERO;

        for (PositionDto pos : positions) {
            boolean isUs = isUsAsset(pos.getSymbol());
            BigDecimal fx = isUs ? USD_TO_INR_SNAPSHOT : BigDecimal.ONE;
            BigDecimal posVal = pos.getCurrentPrice().multiply(BigDecimal.valueOf(pos.getQuantity())).multiply(fx);
            BigDecimal unPnl = pos.getUnrealizedPnL() != null ? pos.getUnrealizedPnL().multiply(fx) : BigDecimal.ZERO;
            totalPositionsValueInr = totalPositionsValueInr.add(posVal);
            totalUnrealizedPnlInr = totalUnrealizedPnlInr.add(unPnl);
        }

        BigDecimal currentNetLiq = currentCash.add(totalPositionsValueInr).setScale(2, RoundingMode.HALF_UP);

        int days = "1W".equalsIgnoreCase(period) ? 7 :
                   "3M".equalsIgnoreCase(period) ? 90 :
                   "1Y".equalsIgnoreCase(period) ? 365 : 30; // default 1M is 30 days

        Instant now = Instant.now();

        // Filter and sort closed trades chronologically
        List<TradeDto> closedTrades = trades.stream()
                .filter(t -> t.getRealizedPnL() != null)
                .sorted(Comparator.comparing(TradeDto::getExecutedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        List<EquityPointDto> points = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd").withZone(ZoneId.of("Asia/Kolkata"));

        BigDecimal initialBenchmark = BigDecimal.valueOf(24350.00); // NIFTY 50 reference

        for (int d = days; d >= 0; d--) {
            Instant pointTime = now.minus(d, ChronoUnit.DAYS);
            long epochMs = pointTime.toEpochMilli();
            String dateLabel = dtf.format(pointTime);

            // Accumulate realized PnL of trades executed on or before this point
            BigDecimal realizedUpToNow = BigDecimal.ZERO;
            for (TradeDto t : closedTrades) {
                if (t.getExecutedAt() != null && !t.getExecutedAt().isAfter(pointTime)) {
                    boolean isUs = isUsAsset(t.getSymbol());
                    BigDecimal fx = isUs ? USD_TO_INR_SNAPSHOT : BigDecimal.ONE;
                    realizedUpToNow = realizedUpToNow.add(t.getRealizedPnL().multiply(fx));
                }
            }

            // At today (d == 0), include active unrealized MTM
            BigDecimal pointUnrealized = (d == 0) ? totalUnrealizedPnlInr : BigDecimal.ZERO;
            BigDecimal pointEquity = initialEquity.add(realizedUpToNow).add(pointUnrealized).setScale(2, RoundingMode.HALF_UP);
            BigDecimal pointCash = (d == 0) ? currentCash : pointEquity;

            double dayFactor = (days - d) * (0.12 / 252.0);
            double benchmarkVal = initialBenchmark.doubleValue() * (1.0 + dayFactor);

            points.add(new EquityPointDto(
                    epochMs,
                    dateLabel,
                    pointEquity,
                    pointCash,
                    pointUnrealized,
                    realizedUpToNow,
                    BigDecimal.valueOf(benchmarkVal).setScale(2, RoundingMode.HALF_UP)
            ));
        }

        PortfolioAnalyticsDto analytics = calculateAnalytics(points, closedTrades, initialEquity);

        return new EquityHistoryResponseDto(
                account.getCurrency() != null ? account.getCurrency() : "INR",
                initialEquity,
                currentNetLiq,
                "BACKEND_AUTHORITATIVE",
                "NIFTY 50",
                points,
                analytics
        );
    }

    @Transactional(readOnly = true)
    public PortfolioAnalyticsDto getPortfolioAnalytics(Long userId) {
        EquityHistoryResponseDto history = getEquityHistory(userId, "1M");
        return history.getAnalytics();
    }

    private PortfolioAnalyticsDto calculateAnalytics(List<EquityPointDto> points, List<TradeDto> closedTrades, BigDecimal initialEquity) {
        PortfolioAnalyticsDto dto = new PortfolioAnalyticsDto();
        dto.setFxRateInrUsd(USD_TO_INR_SNAPSHOT.doubleValue());
        dto.setFxSource(FX_SOURCE);
        dto.setFxTimestamp(Instant.now().toEpochMilli());

        if (points.size() < 2) {
            dto.setSharpeRatio(0.0);
            dto.setSortinoRatio(0.0);
            dto.setMaxDrawdownPct(0.0);
            dto.setAnnualizedReturnPct(0.0);
            dto.setAnnualizedVolatilityPct(0.0);
            dto.setProfitFactor(0.0);
            dto.setWinRatePct(0.0);
            dto.setAverageRMultiple(0.0);
            dto.setExpectancy(0.0);
            dto.setAlpha(0.0);
            dto.setBeta(1.0);
            return dto;
        }

        List<Double> returns = new ArrayList<>();
        List<Double> benchReturns = new ArrayList<>();
        double peak = points.get(0).getEquity().doubleValue();
        double maxDd = 0.0;

        for (int i = 1; i < points.size(); i++) {
            double prevNav = points.get(i - 1).getEquity().doubleValue();
            double curNav = points.get(i).getEquity().doubleValue();
            double r = prevNav > 0 ? (curNav - prevNav) / prevNav : 0.0;
            returns.add(r);

            double prevB = points.get(i - 1).getBenchmark().doubleValue();
            double curB = points.get(i).getBenchmark().doubleValue();
            double rb = prevB > 0 ? (curB - prevB) / prevB : 0.0;
            benchReturns.add(rb);

            if (curNav > peak) {
                peak = curNav;
            } else if (peak > 0) {
                double dd = (peak - curNav) / peak * 100.0;
                if (dd > maxDd) {
                    maxDd = dd;
                }
            }
        }

        double meanR = returns.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double meanRb = benchReturns.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        double varR = 0.0;
        double varRb = 0.0;
        double cov = 0.0;
        double downsideVar = 0.0;
        double rfDaily = 0.065 / 252.0;

        for (int i = 0; i < returns.size(); i++) {
            double diff = returns.get(i) - meanR;
            double diffB = benchReturns.get(i) - meanRb;
            varR += diff * diff;
            varRb += diffB * diffB;
            cov += diff * diffB;

            double excess = returns.get(i) - rfDaily;
            if (excess < 0) {
                downsideVar += excess * excess;
            }
        }

        double n = Math.max(1, returns.size());
        double stdR = Math.sqrt(varR / n);
        double stdDownside = Math.sqrt(downsideVar / n);

        double annReturn = meanR * 252.0 * 100.0;
        double annVol = stdR * Math.sqrt(252.0) * 100.0;
        double annDownsideVol = stdDownside * Math.sqrt(252.0) * 100.0;

        double sharpe = annVol > 0.01 ? (annReturn - 6.5) / annVol : 0.0;
        double sortino = annDownsideVol > 0.01 ? (annReturn - 6.5) / annDownsideVol : (annReturn > 6.5 ? 99.0 : 0.0);

        double beta = varRb > 1e-8 ? cov / varRb : 1.0;
        double alpha = annReturn - (beta * (meanRb * 252.0 * 100.0));

        // Trade-level analytics
        double grossProfit = 0.0;
        double grossLoss = 0.0;
        int winCount = 0;
        double totalR = 0.0;
        int rCount = 0;

        for (TradeDto t : closedTrades) {
            double pnl = t.getRealizedPnL().doubleValue();
            if (pnl > 0) {
                grossProfit += pnl;
                winCount++;
            } else if (pnl < 0) {
                grossLoss += Math.abs(pnl);
            }

            if (t.getRMultiple() != null && t.getRMultiple().compareTo(BigDecimal.ZERO) != 0) {
                totalR += t.getRMultiple().doubleValue();
                rCount++;
            }
        }

        int totalTrades = closedTrades.size();
        double profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999.0 : 0.0);
        double winRate = totalTrades > 0 ? ((double) winCount / totalTrades) * 100.0 : 0.0;
        double avgR = rCount > 0 ? totalR / rCount : 0.0;
        double expectancy = totalTrades > 0 ? (grossProfit - grossLoss) / totalTrades : 0.0;

        dto.setSharpeRatio(Math.round(sharpe * 100.0) / 100.0);
        dto.setSortinoRatio(Math.round(sortino * 100.0) / 100.0);
        dto.setMaxDrawdownPct(Math.round(maxDd * 100.0) / 100.0);
        dto.setAnnualizedReturnPct(Math.round(annReturn * 100.0) / 100.0);
        dto.setAnnualizedVolatilityPct(Math.round(annVol * 100.0) / 100.0);
        dto.setProfitFactor(Math.round(profitFactor * 100.0) / 100.0);
        dto.setWinRatePct(Math.round(winRate * 100.0) / 100.0);
        dto.setAverageRMultiple(Math.round(avgR * 100.0) / 100.0);
        dto.setExpectancy(Math.round(expectancy * 100.0) / 100.0);
        dto.setAlpha(Math.round(alpha * 100.0) / 100.0);
        dto.setBeta(Math.round(beta * 100.0) / 100.0);

        return dto;
    }
}
