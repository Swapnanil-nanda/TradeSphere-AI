package com.tradesphere.modules.paper.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.paper.dto.AccountSummaryDto;
import com.tradesphere.modules.paper.dto.ConfigureAccountRequest;
import com.tradesphere.modules.paper.dto.ReconciliationReportDto;
import com.tradesphere.modules.paper.service.PaperAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Paper Accounts", description = "Simulated capital ledger, cash balance, and drawdown circuit breaker")
public class PaperAccountController {

    private final PaperAccountService paperAccountService;

    public PaperAccountController(PaperAccountService paperAccountService) {
        this.paperAccountService = paperAccountService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get paper account status, equity, and circuit breaker metrics")
    public ResponseEntity<AccountSummaryDto> getMyAccount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperAccountService.getAccountSummary(principal.getId()));
    }

    @PostMapping("/configure")
    @Operation(summary = "Configure virtual starting capital, currency, and simulated fee/slippage rates")
    public ResponseEntity<AccountSummaryDto> configureAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ConfigureAccountRequest request) {
        return ResponseEntity.ok(paperAccountService.configureAccount(principal.getId(), request));
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset paper ledger equity with optional custom starting capital")
    public ResponseEntity<AccountSummaryDto> resetAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) ConfigureAccountRequest request) {
        var capital = (request != null) ? request.getStartingCapital() : null;
        return ResponseEntity.ok(paperAccountService.resetAccount(principal.getId(), capital));
    }

    @GetMapping("/reconcile")
    @Operation(summary = "Verify exact mathematical reconciliation between cash ledger and portfolio equity")
    public ResponseEntity<ReconciliationReportDto> reconcileAccount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperAccountService.reconcileAccount(principal.getId()));
    }
}
