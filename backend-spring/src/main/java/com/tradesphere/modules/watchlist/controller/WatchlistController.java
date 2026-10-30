package com.tradesphere.modules.watchlist.controller;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.watchlist.dto.AddWatchlistItemRequest;
import com.tradesphere.modules.watchlist.dto.CreateWatchlistRequest;
import com.tradesphere.modules.watchlist.dto.WatchlistDto;
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
@RequestMapping("/api/watchlists")
@Tag(name = "Watchlists", description = "User watchlists and custom stock basket operations")
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

    @PostMapping("/{id}/items")
    @Operation(summary = "Add instrument to watchlist")
    public ResponseEntity<WatchlistDto> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AddWatchlistItemRequest request) {
        return ResponseEntity.ok(watchlistService.addInstrument(principal.getId(), id, request.getSymbol()));
    }

    @DeleteMapping("/{id}/items/{symbol}")
    @Operation(summary = "Remove instrument from watchlist")
    public ResponseEntity<WatchlistDto> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @PathVariable String symbol) {
        return ResponseEntity.ok(watchlistService.removeInstrument(principal.getId(), id, symbol));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete custom watchlist")
    public ResponseEntity<Void> deleteWatchlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        watchlistService.deleteWatchlist(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
