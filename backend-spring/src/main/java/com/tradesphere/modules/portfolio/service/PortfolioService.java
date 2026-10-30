package com.tradesphere.modules.portfolio.service;

import com.tradesphere.modules.paper.dto.AccountSummaryDto;
import com.tradesphere.modules.paper.dto.PositionDto;
import com.tradesphere.modules.paper.dto.TradeDto;
import com.tradesphere.modules.paper.service.PaperAccountService;
import com.tradesphere.modules.paper.service.PaperTradingService;
import com.tradesphere.modules.portfolio.dto.PortfolioSummaryResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class PortfolioService {

    private final PaperAccountService paperAccountService;
    private final PaperTradingService paperTradingService;

    public PortfolioService(PaperAccountService paperAccountService, PaperTradingService paperTradingService) {
        this.paperAccountService = paperAccountService;
        this.paperTradingService = paperTradingService;
    }

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolioSummary(Long userId) {
        AccountSummaryDto account = paperAccountService.getAccountSummary(userId);
        List<PositionDto> positions = paperTradingService.getPositions(userId);
        List<TradeDto> trades = paperTradingService.getTrades(userId);

        BigDecimal totalPositionsValue = BigDecimal.ZERO;
        BigDecimal totalUnrealizedPnl = BigDecimal.ZERO;

        for (PositionDto pos : positions) {
            BigDecimal marketVal = pos.getCurrentPrice().multiply(BigDecimal.valueOf(pos.getQuantity()));
            totalPositionsValue = totalPositionsValue.add(marketVal);
            totalUnrealizedPnl = totalUnrealizedPnl.add(pos.getUnrealizedPnL());
        }

        // Dynamically compute Net Liquidation = Cash + Market Value of Positions
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
        res.setTrades(trades);
        res.setTotalPositionsValue(totalPositionsValue.setScale(2, RoundingMode.HALF_UP));
        res.setTotalTradesCount(totalClosed);
        res.setWinningTradesCount(winningTrades);
        res.setWinRatePct(winRate);

        return res;
    }
}
