package com.tradesphere.modules.screener.dto;

import java.math.BigDecimal;

public class ScreenerFilterRequest {
    private String market = "ALL"; // ALL, IN, US
    private String sector = "ALL";
    private String trend = "ALL"; // ALL, BULLISH, BEARISH, CONSOLIDATION
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minMarketCapCr;
    private BigDecimal maxMarketCapCr;
    private Long minVolume;
    private BigDecimal minPe;
    private BigDecimal maxPe;
    private BigDecimal minRsi;
    private BigDecimal maxRsi;
    private String search;
    private String sortBy = "changePct"; // symbol, price, changePct, volume, peRatio, rsi14, marketCapCr
    private String sortDirection = "DESC"; // ASC, DESC
    private int page = 0;
    private int pageSize = 20;

    public ScreenerFilterRequest() {}

    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public BigDecimal getMinMarketCapCr() { return minMarketCapCr; }
    public void setMinMarketCapCr(BigDecimal minMarketCapCr) { this.minMarketCapCr = minMarketCapCr; }

    public BigDecimal getMaxMarketCapCr() { return maxMarketCapCr; }
    public void setMaxMarketCapCr(BigDecimal maxMarketCapCr) { this.maxMarketCapCr = maxMarketCapCr; }

    public Long getMinVolume() { return minVolume; }
    public void setMinVolume(Long minVolume) { this.minVolume = minVolume; }

    public BigDecimal getMinPe() { return minPe; }
    public void setMinPe(BigDecimal minPe) { this.minPe = minPe; }

    public BigDecimal getMaxPe() { return maxPe; }
    public void setMaxPe(BigDecimal maxPe) { this.maxPe = maxPe; }

    public BigDecimal getMinRsi() { return minRsi; }
    public void setMinRsi(BigDecimal minRsi) { this.minRsi = minRsi; }

    public BigDecimal getMaxRsi() { return maxRsi; }
    public void setMaxRsi(BigDecimal maxRsi) { this.maxRsi = maxRsi; }

    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDirection() { return sortDirection; }
    public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = Math.max(0, page); }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = Math.min(100, Math.max(1, pageSize)); }
}
