package com.tradesphere.modules.paper.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.paper.dto.TradeDto;
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
@RequestMapping("/api/trades")
@Tag(name = "Paper Trades", description = "Executed trade blotter and R-multiple performance journal")
public class TradeController {

    private final PaperTradingService paperTradingService;

    public TradeController(PaperTradingService paperTradingService) {
        this.paperTradingService = paperTradingService;
    }

    @GetMapping
    @Operation(summary = "Get historical executed trades for current user")
    public ResponseEntity<List<TradeDto>> getTrades(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperTradingService.getTrades(principal.getId()));
    }
}
