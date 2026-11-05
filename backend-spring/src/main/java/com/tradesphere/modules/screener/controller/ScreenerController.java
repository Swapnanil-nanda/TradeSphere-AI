package com.tradesphere.modules.screener.controller;

import com.tradesphere.common.security.UserPrincipal;
import com.tradesphere.modules.screener.dto.CreateSavedScreenRequest;
import com.tradesphere.modules.screener.dto.SavedScreenDto;
import com.tradesphere.modules.screener.dto.ScreenerFilterRequest;
import com.tradesphere.modules.screener.dto.ScreenerPageResponse;
import com.tradesphere.modules.screener.service.SavedScreenService;
import com.tradesphere.modules.screener.service.ScreenerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screener")
@Tag(name = "Screener", description = "Multi-criteria technical and fundamental stock screener with saved presets")
public class ScreenerController {

    private final ScreenerService screenerService;
    private final SavedScreenService savedScreenService;

    public ScreenerController(ScreenerService screenerService, SavedScreenService savedScreenService) {
        this.screenerService = screenerService;
        this.savedScreenService = savedScreenService;
    }

    @GetMapping
    @Operation(summary = "Screen dual-market equities by RSI, 20-EMA trend, market cap, volume, and P/E multiples")
    public ResponseEntity<ScreenerPageResponse> screen(
            @ModelAttribute ScreenerFilterRequest filterRequest) {
        ScreenerPageResponse response = screenerService.screenStocks(filterRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export")
    @Operation(summary = "Export filtered screener results as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @ModelAttribute ScreenerFilterRequest filterRequest) {
        byte[] csvData = screenerService.exportCsv(filterRequest);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tradesphere-screener.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @GetMapping("/saved")
    @Operation(summary = "Get all saved screener presets for current authenticated user")
    public ResponseEntity<List<SavedScreenDto>> getSavedScreens(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SavedScreenDto> list = savedScreenService.getSavedScreens(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/saved")
    @Operation(summary = "Save a new screener preset for current authenticated user")
    public ResponseEntity<SavedScreenDto> createSavedScreen(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSavedScreenRequest request) {
        SavedScreenDto created = savedScreenService.createSavedScreen(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/saved/{id}")
    @Operation(summary = "Delete a saved screener preset owned by current authenticated user")
    public ResponseEntity<Void> deleteSavedScreen(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        savedScreenService.deleteSavedScreen(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
