package com.tradesphere.modules.instrument.dto;

import java.math.BigDecimal;

public class InstrumentDto {
    private Long id;
    private String symbol;
    private String name;
    private String exchange;
    private String market;
    private String currency;
    private String sector;
    private String industry;
    private BigDecimal tickSize;
    private int lotSize;
    private BigDecimal basePrice;

    public InstrumentDto() {}

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
    public BigDecimal getTickSize() { return tickSize; }
    public void setTickSize(BigDecimal tickSize) { this.tickSize = tickSize; }
    public int getLotSize() { return lotSize; }
    public void setLotSize(int lotSize) { this.lotSize = lotSize; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
}
