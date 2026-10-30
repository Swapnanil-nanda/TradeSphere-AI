package com.tradesphere.modules.instrument.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "instruments")
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 50)
    private String exchange; // NSE, BSE, NASDAQ, NYSE

    @Column(nullable = false, length = 10)
    private String market; // IN, US

    @Column(nullable = false, length = 10)
    private String currency = "INR"; // INR, USD

    @Column(nullable = false, length = 100)
    private String sector;

    @Column(length = 100)
    private String industry;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "tick_size", nullable = false, precision = 10, scale = 4)
    private BigDecimal tickSize = new BigDecimal("0.05");

    @Column(name = "lot_size", nullable = false)
    private int lotSize = 1;

    @Column(name = "base_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal basePrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Instrument() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }
    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public BigDecimal getTickSize() { return tickSize; }
    public void setTickSize(BigDecimal tickSize) { this.tickSize = tickSize; }
    public int getLotSize() { return lotSize; }
    public void setLotSize(int lotSize) { this.lotSize = lotSize; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
