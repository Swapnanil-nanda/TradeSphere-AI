package com.tradesphere.modules.instrument.dto;

import java.math.BigDecimal;

public class CandleDto {
    private long time;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal close;
    private long volume;
    private BigDecimal ema20;
    private BigDecimal vwap;
    private BigDecimal support;
    private BigDecimal resistance;
    private BigDecimal rsi;

    public CandleDto() {}

    public CandleDto(long time, BigDecimal open, BigDecimal high, BigDecimal low, BigDecimal close, long volume, BigDecimal ema20, BigDecimal vwap, BigDecimal support, BigDecimal resistance) {
        this.time = time;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
        this.ema20 = ema20;
        this.vwap = vwap;
        this.support = support;
        this.resistance = resistance;
    }

    public CandleDto(long time, BigDecimal open, BigDecimal high, BigDecimal low, BigDecimal close, long volume, BigDecimal ema20, BigDecimal vwap, BigDecimal support, BigDecimal resistance, BigDecimal rsi) {
        this(time, open, high, low, close, volume, ema20, vwap, support, resistance);
        this.rsi = rsi;
    }

    public long getTime() { return time; }
    public void setTime(long time) { this.time = time; }
    public BigDecimal getOpen() { return open; }
    public void setOpen(BigDecimal open) { this.open = open; }
    public BigDecimal getHigh() { return high; }
    public void setHigh(BigDecimal high) { this.high = high; }
    public BigDecimal getLow() { return low; }
    public void setLow(BigDecimal low) { this.low = low; }
    public BigDecimal getClose() { return close; }
    public void setClose(BigDecimal close) { this.close = close; }
    public long getVolume() { return volume; }
    public void setVolume(long volume) { this.volume = volume; }
    public BigDecimal getEma20() { return ema20; }
    public void setEma20(BigDecimal ema20) { this.ema20 = ema20; }
    public BigDecimal getVwap() { return vwap; }
    public void setVwap(BigDecimal vwap) { this.vwap = vwap; }
    public BigDecimal getSupport() { return support; }
    public void setSupport(BigDecimal support) { this.support = support; }
    public BigDecimal getResistance() { return resistance; }
    public void setResistance(BigDecimal resistance) { this.resistance = resistance; }
    public BigDecimal getRsi() { return rsi; }
    public void setRsi(BigDecimal rsi) { this.rsi = rsi; }
}
