package com.tradesphere.modules.portfolio.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.portfolio.dto.PortfolioSummaryResponse;
import com.tradesphere.modules.portfolio.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@Tag(name = "Portfolio Calculations", description = "Net liquidation equity, mark-to-market unrealized PnL, and win-rate expectancy calculations")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    @Operation(summary = "Get full portfolio summary, open positions, executed trades, and performance metrics")
    public ResponseEntity<PortfolioSummaryResponse> getPortfolio(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = (principal != null) ? principal.getId() : 1L;
        return ResponseEntity.ok(portfolioService.getPortfolioSummary(userId));
    }
}
