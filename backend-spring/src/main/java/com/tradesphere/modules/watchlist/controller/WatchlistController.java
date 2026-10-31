package com.tradesphere.modules.watchlist.controller;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.watchlist.dto.*;
import com.tradesphere.modules.watchlist.service.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/watchlists", "/api/watchlists"})
@Tag(name = "Watchlists", description = "User watchlists, custom baskets, reordering and price alert operations")
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserRepository userRepository;

    public WatchlistController(WatchlistService watchlistService, UserRepository userRepository) {
        this.watchlistService = watchlistService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Get all watchlists for authenticated user")
    public ResponseEntity<List<WatchlistDto>> getWatchlists(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(watchlistService.getUserWatchlists(principal.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single watchlist by ID")
    public ResponseEntity<WatchlistDto> getWatchlistById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(watchlistService.getWatchlistById(principal.getId(), id));
    }

    @PostMapping
    @Operation(summary = "Create new custom watchlist")
    public ResponseEntity<WatchlistDto> createWatchlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateWatchlistRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        WatchlistDto dto = watchlistService.createWatchlist(principal.getId(), user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Rename an existing watchlist")
    public ResponseEntity<WatchlistDto> renameWatchlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateWatchlistRequest request) {
        return ResponseEntity.ok(watchlistService.renameWatchlist(principal.getId(), id, request.getName()));
    }

    @PostMapping("/{id}/duplicate")
    @Operation(summary = "Duplicate an existing watchlist into a new custom basket")
    public ResponseEntity<WatchlistDto> duplicateWatchlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String targetName) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(watchlistService.duplicateWatchlist(principal.getId(), user, id, targetName));
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add instrument to watchlist")
    public ResponseEntity<WatchlistDto> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddWatchlistItemRequest request) {
        return ResponseEntity.ok(watchlistService.addInstrument(principal.getId(), id, request.getSymbol()));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @Operation(summary = "Remove instrument from watchlist by item ID or symbol")
    public ResponseEntity<WatchlistDto> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @PathVariable String itemId) {
        return ResponseEntity.ok(watchlistService.removeInstrument(principal.getId(), id, itemId));
    }

    @PatchMapping("/{id}/items/reorder")
    @Operation(summary = "Reorder constituent instruments in a watchlist")
    public ResponseEntity<WatchlistDto> reorderItems(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ReorderItemsRequest request) {
        return ResponseEntity.ok(watchlistService.reorderItems(principal.getId(), id, request.getSymbols()));
    }

    @GetMapping("/{id}/quotes")
    @Operation(summary = "Get current simulated quotes for all constituents in a watchlist")
    public ResponseEntity<List<WatchlistQuoteSummaryDto>> getQuotes(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(watchlistService.getWatchlistQuotes(principal.getId(), id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete custom watchlist (default core watchlist cannot be deleted)")
    public ResponseEntity<Void> deleteWatchlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        watchlistService.deleteWatchlist(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    // --- ALERTS ENDPOINTS ---

    @GetMapping("/alerts")
    @Operation(summary = "Get all active and triggered alerts for authenticated user")
    public ResponseEntity<List<WatchlistAlertDto>> getAlerts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(watchlistService.getUserAlerts(principal.getId()));
    }

    @PostMapping("/alerts")
    @Operation(summary = "Create a price, volume, or technical indicator alert")
    public ResponseEntity<WatchlistAlertDto> createAlert(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateAlertRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(watchlistService.createAlert(principal.getId(), user, request));
    }

    @DeleteMapping("/alerts/{id}")
    @Operation(summary = "Delete user alert")
    public ResponseEntity<Void> deleteAlert(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        watchlistService.deleteAlert(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
