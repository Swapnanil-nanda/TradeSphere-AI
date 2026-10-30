package com.tradesphere.modules.instrument.controller;

import com.tradesphere.modules.instrument.dto.CandleDto;
import com.tradesphere.modules.instrument.dto.DomDepthDto;
import com.tradesphere.modules.instrument.dto.TickerQuoteDto;
import com.tradesphere.modules.instrument.service.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Market Data", description = "24/7 Geometric Brownian Motion simulated ticks, candles, and Level 2 DOM")
public class MarketDataController {

    private final MarketDataService marketDataService;

    public MarketDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping({"/market-data/quotes", "/market-data/tickers", "/tickers", "/quotes"})
    @Operation(summary = "Get current simulated quotes for all instruments")
    public ResponseEntity<List<TickerQuoteDto>> getAllQuotes() {
        return ResponseEntity.ok(marketDataService.getAllQuotes());
    }

    @GetMapping({"/market-data/quotes/{symbol}", "/quotes/{symbol}"})
    @Operation(summary = "Get current simulated quote for a specific symbol")
    public ResponseEntity<TickerQuoteDto> getQuote(@PathVariable String symbol) {
        return ResponseEntity.ok(marketDataService.getQuote(symbol));
    }

    @GetMapping({"/market-data/candles/{symbol}", "/market-data/candles", "/candles/{symbol}", "/candles"})
    @Operation(summary = "Get historical OHLCV candles with 20-EMA, VWAP, and S/R zones")
    public ResponseEntity<List<CandleDto>> getCandles(
            @PathVariable(required = false) String symbol,
            @RequestParam(name = "symbol", required = false) String symbolParam,
            @RequestParam(name = "timeframe", defaultValue = "5m") String timeframe,
            @RequestParam(name = "count", defaultValue = "60") int count) {
        String resolvedSymbol = symbol != null ? symbol : (symbolParam != null ? symbolParam : "RELIANCE");
        return ResponseEntity.ok(marketDataService.getCandles(resolvedSymbol, timeframe, count));
    }

    @GetMapping({"/market-data/dom/{symbol}", "/dom/{symbol}"})
    @Operation(summary = "Get 20-level Level 2 Depth of Market (DOM) order book ladder")
    public ResponseEntity<DomDepthDto> getDomLadder(
            @PathVariable String symbol,
            @RequestParam(name = "depth", defaultValue = "10") int depth) {
        return ResponseEntity.ok(marketDataService.getDomLadder(symbol, depth));
    }
}
