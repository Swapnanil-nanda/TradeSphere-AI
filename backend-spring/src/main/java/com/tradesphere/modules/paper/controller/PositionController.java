package com.tradesphere.modules.paper.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.paper.dto.ClosePositionRequest;
import com.tradesphere.modules.paper.dto.PositionDto;
import com.tradesphere.modules.paper.service.PaperTradingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
@Tag(name = "Positions", description = "Open simulated positions and mark-to-market MTM accounting")
public class PositionController {

    private final PaperTradingService paperTradingService;

    public PositionController(PaperTradingService paperTradingService) {
        this.paperTradingService = paperTradingService;
    }

    @GetMapping
    @Operation(summary = "Get all active open positions for current user")
    public ResponseEntity<List<PositionDto>> getPositions(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperTradingService.getPositions(principal.getId()));
    }

    @PostMapping("/close")
    @Operation(summary = "Close open position at current market price")
    public ResponseEntity<PositionDto> closePosition(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ClosePositionRequest request) {
        PositionDto response = paperTradingService.closePosition(principal.getId(), request.getSymbol());
        return ResponseEntity.ok(response);
    }
}
