package com.tradesphere.modules.paper.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.paper.dto.CreateJournalEntryRequest;
import com.tradesphere.modules.paper.dto.TradeJournalDto;
import com.tradesphere.modules.paper.service.TradeJournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journal")
@Tag(name = "Trade Journal", description = "Psychological, setup tagging, and discipline review for executed trades")
public class TradeJournalController {

    private final TradeJournalService tradeJournalService;

    public TradeJournalController(TradeJournalService tradeJournalService) {
        this.tradeJournalService = tradeJournalService;
    }

    @PostMapping
    @Operation(summary = "Create persistent trade journal entry with discipline review")
    public ResponseEntity<TradeJournalDto> createEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateJournalEntryRequest request) {
        TradeJournalDto created = tradeJournalService.createEntry(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Get trade journal entries for current user")
    public ResponseEntity<List<TradeJournalDto>> getEntries(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String symbol) {
        if (symbol != null && !symbol.isBlank()) {
            return ResponseEntity.ok(tradeJournalService.getEntriesBySymbol(principal.getId(), symbol));
        }
        return ResponseEntity.ok(tradeJournalService.getEntries(principal.getId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete trade journal entry")
    public ResponseEntity<Void> deleteEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        tradeJournalService.deleteEntry(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
