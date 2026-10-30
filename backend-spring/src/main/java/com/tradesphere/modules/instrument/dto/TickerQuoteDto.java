package com.tradesphere.modules.instrument.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class TickerQuoteDto {
    private String symbol;
    private String name;
    private String exchange;
    private String market;
    private String currency;
    private BigDecimal ltp;
    private BigDecimal change;
    private BigDecimal changePct;
    private BigDecimal dayHigh;
    private BigDecimal dayLow;
    private BigDecimal bid;
    private BigDecimal ask;
    private long volume;
    private Instant timestamp = Instant.now();

    public TickerQuoteDto() {}

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
    public BigDecimal getLtp() { return ltp; }
    public void setLtp(BigDecimal ltp) { this.ltp = ltp; }
    public BigDecimal getChange() { return change; }
    public void setChange(BigDecimal change) { this.change = change; }
    public BigDecimal getChangePct() { return changePct; }
    public void setChangePct(BigDecimal changePct) { this.changePct = changePct; }
    public BigDecimal getDayHigh() { return dayHigh; }
    public void setDayHigh(BigDecimal dayHigh) { this.dayHigh = dayHigh; }
    public BigDecimal getDayLow() { return dayLow; }
    public void setDayLow(BigDecimal dayLow) { this.dayLow = dayLow; }
    public BigDecimal getBid() { return bid; }
    public void setBid(BigDecimal bid) { this.bid = bid; }
    public BigDecimal getAsk() { return ask; }
    public void setAsk(BigDecimal ask) { this.ask = ask; }
    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
