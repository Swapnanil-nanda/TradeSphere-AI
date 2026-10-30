package com.tradesphere.modules.screener.controller;

import com.tradesphere.modules.screener.dto.ScreenerFilterRequest;
import com.tradesphere.modules.screener.dto.ScreenerStockDto;
import com.tradesphere.modules.screener.service.ScreenerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screener")
@Tag(name = "Screener", description = "Multi-criteria technical and fundamental stock screener")
public class ScreenerController {

    private final ScreenerService screenerService;

    public ScreenerController(ScreenerService screenerService) {
        this.screenerService = screenerService;
    }

    @GetMapping
    @Operation(summary = "Screen dual-market equities by RSI, 20-EMA trend, and P/E multiples")
    public ResponseEntity<List<ScreenerStockDto>> screen(
            @ModelAttribute ScreenerFilterRequest filterRequest) {
        List<ScreenerStockDto> results = screenerService.screenStocks(filterRequest);
        return ResponseEntity.ok(results);
    }
}
