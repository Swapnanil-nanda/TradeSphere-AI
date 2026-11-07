package com.tradesphere.modules.instrument.dto;

import java.util.List;

public class HistoricalCandlesResponseDto {
    private String symbol;
    private String source;
    private String dataType;
    private long asOfTimestamp;
    private String provenance;
    private String interval;
    private String startDate;
    private String endDate;
    private int totalBars;
    private boolean adjusted;
    private List<CandleDto> candles;

    public HistoricalCandlesResponseDto() {}

    public HistoricalCandlesResponseDto(String symbol, String source, String dataType, long asOfTimestamp,
                                       String provenance, String interval, String startDate, String endDate,
                                       int totalBars, boolean adjusted, List<CandleDto> candles) {
        this.symbol = symbol;
        this.source = source;
        this.dataType = dataType;
        this.asOfTimestamp = asOfTimestamp;
        this.provenance = provenance;
        this.interval = interval;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalBars = totalBars;
        this.adjusted = adjusted;
        this.candles = candles;
    }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }

    public long getAsOfTimestamp() { return asOfTimestamp; }
    public void setAsOfTimestamp(long asOfTimestamp) { this.asOfTimestamp = asOfTimestamp; }

    public String getProvenance() { return provenance; }
    public void setProvenance(String provenance) { this.provenance = provenance; }

    public String getInterval() { return interval; }
    public void setInterval(String interval) { this.interval = interval; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public int getTotalBars() { return totalBars; }
    public void setTotalBars(int totalBars) { this.totalBars = totalBars; }

    public boolean isAdjusted() { return adjusted; }
    public void setAdjusted(boolean adjusted) { this.adjusted = adjusted; }

    public List<CandleDto> getCandles() { return candles; }
    public void setCandles(List<CandleDto> candles) { this.candles = candles; }
}
