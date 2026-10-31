package com.tradesphere.modules.paper.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.paper.dto.OrderRequest;
import com.tradesphere.modules.paper.dto.OrderResponse;
import com.tradesphere.modules.paper.dto.PositionSizeRequest;
import com.tradesphere.modules.paper.dto.PositionSizeResponse;
import com.tradesphere.modules.paper.service.PaperTradingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/orders", "/api/risk"})
@Tag(name = "Paper Orders", description = "Simulated order placement, state machine, and cancellation with Pre-Trade Risk Gatekeeper")
public class OrderController {

    private final PaperTradingService paperTradingService;

    public OrderController(PaperTradingService paperTradingService) {
        this.paperTradingService = paperTradingService;
    }

    @PostMapping
    @Operation(summary = "Submit simulated order (strictly gated by 1% single-trade risk invariant)")
    public ResponseEntity<OrderResponse> submitOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderRequest request) {
        OrderResponse response = paperTradingService.placeOrder(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/size")
    @Operation(summary = "Calculate exact safe position size using BigDecimal without 1-unit minimum breach")
    public ResponseEntity<PositionSizeResponse> calculateSize(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PositionSizeRequest request) {
        Long userId = (principal != null) ? principal.getId() : null;
        return ResponseEntity.ok(paperTradingService.calculatePositionSize(userId, request));
    }

    @GetMapping
    @Operation(summary = "Get order blotter history for current user")
    public ResponseEntity<List<OrderResponse>> getOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperTradingService.getOrders(principal.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel an open simulated limit order")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        OrderResponse response = paperTradingService.cancelOrder(principal.getId(), id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/match")
    @Operation(summary = "Evaluate and fill any marketable open limit orders")
    public ResponseEntity<List<OrderResponse>> matchOpenOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperTradingService.matchOpenOrders(principal.getId()));
    }

    @PostMapping("/evaluate-oco")
    @Operation(summary = "Evaluate and trigger active Stop-Loss and Take-Profit OCO legs across open positions")
    public ResponseEntity<List<com.tradesphere.modules.paper.dto.TradeDto>> evaluateOco(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paperTradingService.evaluateOcoTriggers(principal.getId()));
    }
}
