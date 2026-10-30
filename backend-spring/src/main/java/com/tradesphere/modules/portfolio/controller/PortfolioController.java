package com.tradesphere.modules.portfolio.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.paper.dto.AccountSummaryDto;
import com.tradesphere.modules.paper.service.PaperAccountService;
import com.tradesphere.modules.portfolio.dto.PortfolioSummaryResponse;
import com.tradesphere.modules.portfolio.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@Tag(name = "Portfolio Calculations", description = "Net liquidation equity, mark-to-market unrealized PnL, and win-rate expectancy calculations")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final PaperAccountService paperAccountService;

    public PortfolioController(PortfolioService portfolioService, PaperAccountService paperAccountService) {
        this.portfolioService = portfolioService;
        this.paperAccountService = paperAccountService;
    }

    @GetMapping
    @Operation(summary = "Get full portfolio summary, open positions, executed trades, and performance metrics")
    public ResponseEntity<PortfolioSummaryResponse> getPortfolio(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(portfolioService.getPortfolioSummary(principal.getId()));
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset virtual account portfolio equity to starting capital")
    public ResponseEntity<Map<String, Object>> resetPortfolio(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AccountSummaryDto summary = paperAccountService.resetAccount(principal.getId(), null);
        PortfolioSummaryResponse portfolio = portfolioService.getPortfolioSummary(principal.getId());
        return ResponseEntity.ok(Map.of(
                "message", "Portfolio reset successfully",
                "account", summary,
                "portfolio", portfolio
        ));
    }
}
