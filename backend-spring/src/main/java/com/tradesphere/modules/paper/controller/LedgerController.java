package com.tradesphere.modules.paper.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.paper.dto.LedgerEntryDto;
import com.tradesphere.modules.paper.service.PaperTradingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ledger")
@Tag(name = "Cash Ledger", description = "Audit trail of all virtual cash deposits, trade debits, and credits")
public class LedgerController {

    private final PaperTradingService paperTradingService;

    public LedgerController(PaperTradingService paperTradingService) {
        this.paperTradingService = paperTradingService;
    }

    @GetMapping
    @Operation(summary = "Get cash ledger transactions for current user")
    public ResponseEntity<List<LedgerEntryDto>> getLedger(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperTradingService.getLedger(principal.getId()));
    }
}
