package com.tradesphere.modules.screener.dto;

import java.math.BigDecimal;

public class ScreenerStockDto {
    private String symbol;
    private String name;
    private String market;
    private String sector;
    private BigDecimal price;
    private BigDecimal changePct;
    private long volume;
    private BigDecimal peRatio;
    private BigDecimal rsi14;
    private String trend; // BULLISH, BEARISH, CONSOLIDATION
    private String setup;

    public ScreenerStockDto() {}

    public ScreenerStockDto(String symbol, String name, String market, String sector, BigDecimal price, BigDecimal changePct, long volume, BigDecimal peRatio, BigDecimal rsi14, String trend, String setup) {
        this.symbol = symbol;
        this.name = name;
        this.market = market;
        this.sector = sector;
        this.price = price;
        this.changePct = changePct;
        this.volume = volume;
        this.peRatio = peRatio;
        this.rsi14 = rsi14;
        this.trend = trend;
        this.setup = setup;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
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
    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }
    public String getSetup() { return setup; }
    public void setSetup(String setup) { this.setup = setup; }
}
