package com.tradesphere.modules.portfolio.dto;

import com.tradesphere.modules.paper.dto.AccountSummaryDto;
import com.tradesphere.modules.paper.dto.OrderResponse;
import com.tradesphere.modules.paper.dto.PositionDto;
import com.tradesphere.modules.paper.dto.TradeDto;

import java.math.BigDecimal;
import java.util.List;

public class PortfolioSummaryResponse {
    private AccountSummaryDto account;
    private List<PositionDto> positions;
    private List<OrderResponse> orders;
    private List<TradeDto> trades;
    private BigDecimal totalPositionsValue;
    private int totalTradesCount;
    private int winningTradesCount;
    private BigDecimal winRatePct;

    public PortfolioSummaryResponse() {}

    public AccountSummaryDto getAccount() { return account; }
    public void setAccount(AccountSummaryDto account) { this.account = account; }
    public List<PositionDto> getPositions() { return positions; }
    public void setPositions(List<PositionDto> positions) { this.positions = positions; }
    public List<OrderResponse> getOrders() { return orders; }
    public void setOrders(List<OrderResponse> orders) { this.orders = orders; }
    public List<TradeDto> getTrades() { return trades; }
    public void setTrades(List<TradeDto> trades) { this.trades = trades; }
    public BigDecimal getTotalPositionsValue() { return totalPositionsValue; }
    public void setTotalPositionsValue(BigDecimal totalPositionsValue) { this.totalPositionsValue = totalPositionsValue; }
    public int getTotalTradesCount() { return totalTradesCount; }
    public void setTotalTradesCount(int totalTradesCount) { this.totalTradesCount = totalTradesCount; }
    public int getWinningTradesCount() { return winningTradesCount; }
    public void setWinningTradesCount(int winningTradesCount) { this.winningTradesCount = winningTradesCount; }
    public BigDecimal getWinRatePct() { return winRatePct; }
    public void setWinRatePct(BigDecimal winRatePct) { this.winRatePct = winRatePct; }
}
