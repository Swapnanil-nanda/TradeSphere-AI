package com.tradesphere.modules.instrument.controller;

import com.tradesphere.modules.instrument.dto.CandleDto;
import com.tradesphere.modules.instrument.dto.DomDepthDto;
import com.tradesphere.modules.instrument.dto.HistoricalCandlesResponseDto;
import com.tradesphere.modules.instrument.dto.TickerQuoteDto;
import com.tradesphere.modules.instrument.service.HistoricalMarketDataService;
import com.tradesphere.modules.instrument.service.MarketDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Market Data", description = "24/7 Geometric Brownian Motion simulated ticks, candles, and Simulated 20-level DOM")
public class MarketDataController {

    private final MarketDataService marketDataService;
    private final HistoricalMarketDataService historicalMarketDataService;

    public MarketDataController(MarketDataService marketDataService, HistoricalMarketDataService historicalMarketDataService) {
        this.marketDataService = marketDataService;
        this.historicalMarketDataService = historicalMarketDataService;
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
    @Operation(summary = "Get simulated 20-level Depth of Market (DOM) order book ladder")
    public ResponseEntity<DomDepthDto> getDomLadder(
            @PathVariable String symbol,
            @RequestParam(name = "depth", defaultValue = "10") int depth) {
        return ResponseEntity.ok(marketDataService.getDomLadder(symbol, depth));
    }

    @GetMapping({"/market-data/historical-candles", "/historical-candles"})
    @Operation(summary = "Get genuinely historical market-data provider candles with source and timestamp metadata")
    public ResponseEntity<HistoricalCandlesResponseDto> getHistoricalCandles(
            @RequestParam(name = "symbol", defaultValue = "RELIANCE") String symbol,
            @RequestParam(name = "interval", defaultValue = "1d") String interval,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate,
            @RequestParam(name = "count", defaultValue = "250") Integer count) {
        return ResponseEntity.ok(historicalMarketDataService.getHistoricalCandles(symbol, interval, startDate, endDate, count));
    }
}
