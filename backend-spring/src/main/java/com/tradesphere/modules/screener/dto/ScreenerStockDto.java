package com.tradesphere.modules.screener.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class ScreenerStockDto {
    private String symbol;
    private String name;
    private String market;
    private String sector;
    private String exchange;
    private String currency;
    private BigDecimal price;
    private BigDecimal changePct;
    private long volume;
    private BigDecimal peRatio; // Can be null for ETFs (renders as N/A)
    private BigDecimal rsi14;
    private BigDecimal marketCapCr;
    private String trend; // BULLISH, BEARISH, CONSOLIDATION
    private String setup;
    private String provenance = "SIMULATED";
    private Instant lastUpdated = Instant.now();

    public ScreenerStockDto() {}

    public ScreenerStockDto(String symbol, String name, String market, String sector, String exchange, String currency,
                            BigDecimal price, BigDecimal changePct, long volume, BigDecimal peRatio,
                            BigDecimal rsi14, BigDecimal marketCapCr, String trend, String setup) {
        this.symbol = symbol;
        this.name = name;
        this.market = market;
        this.sector = sector;
        this.exchange = exchange;
        this.currency = currency;
        this.price = price;
        this.changePct = changePct;
        this.volume = volume;
        this.peRatio = peRatio;
        this.rsi14 = rsi14;
        this.marketCapCr = marketCapCr;
        this.trend = trend;
        this.setup = setup;
        this.provenance = "SIMULATED";
        this.lastUpdated = Instant.now();
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getChangePct() { return changePct; }
    public void setChangePct(BigDecimal changePct) { this.changePct = changePct; }

    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }

    public BigDecimal getPeRatio() { return peRatio; }
    public void setPeRatio(BigDecimal peRatio) { this.peRatio = peRatio; }

    public BigDecimal getRsi14() { return rsi14; }
    public void setRsi14(BigDecimal rsi14) { this.rsi14 = rsi14; }

    public BigDecimal getMarketCapCr() { return marketCapCr; }
    public void setMarketCapCr(BigDecimal marketCapCr) { this.marketCapCr = marketCapCr; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public String getSetup() { return setup; }
    public void setSetup(String setup) { this.setup = setup; }

    public String getProvenance() { return provenance; }
    public void setProvenance(String provenance) { this.provenance = provenance; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
}
