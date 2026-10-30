package com.tradesphere.modules.instrument.controller;

import com.tradesphere.modules.instrument.dto.InstrumentDto;
import com.tradesphere.modules.instrument.service.InstrumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instruments")
@Tag(name = "Instruments", description = "Instrument master management and stock search")
public class InstrumentController {

    private final InstrumentService instrumentService;

    public InstrumentController(InstrumentService instrumentService) {
        this.instrumentService = instrumentService;
    }

    @GetMapping
    @Operation(summary = "Get all active instruments across NSE/BSE and US markets")
    public ResponseEntity<List<InstrumentDto>> getAllInstruments() {
        return ResponseEntity.ok(instrumentService.getAllActiveInstruments());
    }

    @GetMapping("/{symbol}")
    @Operation(summary = "Get instrument specification by ticker symbol")
    public ResponseEntity<InstrumentDto> getBySymbol(@PathVariable String symbol) {
        return ResponseEntity.ok(instrumentService.getBySymbol(symbol));
    }

    @GetMapping("/search")
    @Operation(summary = "Search active instruments by symbol or company name")
    public ResponseEntity<List<InstrumentDto>> search(@RequestParam(name = "q", required = false) String query) {
        return ResponseEntity.ok(instrumentService.searchInstruments(query));
    }
}
