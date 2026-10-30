package com.tradesphere.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health & Readiness", description = "Endpoints for container orchestration, Render health checks, and service monitoring")
public class HealthCheckController {

    private final DataSource dataSource;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @Autowired
    public HealthCheckController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    @Operation(summary = "Comprehensive Health & Readiness Probe")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "TradeSphere AI Backend");
        health.put("version", "1.0.0");
        health.put("activeProfile", activeProfile);
        health.put("timestamp", Instant.now().toString());
        health.put("executionMode", "PAPER_TRADING_ONLY");
        health.put("disclaimer", "PAPER TRADING – NO REAL MONEY");

        // Database Connectivity Probe
        boolean dbConnected = false;
        String dbProduct = "UNKNOWN";
        try (Connection conn = dataSource.getConnection()) {
            dbConnected = conn.isValid(2);
            dbProduct = conn.getMetaData().getDatabaseProductName() + " " + conn.getMetaData().getDatabaseProductVersion();
        } catch (Exception e) {
            dbConnected = false;
            dbProduct = "Error: " + e.getMessage();
        }

        Map<String, Object> dbDetails = new LinkedHashMap<>();
        dbDetails.put("status", dbConnected ? "CONNECTED" : "DOWN");
        dbDetails.put("databaseProduct", dbProduct);
        health.put("database", dbDetails);

        // Memory Statistics
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> memDetails = new LinkedHashMap<>();
        memDetails.put("totalMemoryMb", runtime.totalMemory() / (1024 * 1024));
        memDetails.put("freeMemoryMb", runtime.freeMemory() / (1024 * 1024));
        memDetails.put("maxMemoryMb", runtime.maxMemory() / (1024 * 1024));
        health.put("memory", memDetails);

        return ResponseEntity.ok(health);
    }
}
