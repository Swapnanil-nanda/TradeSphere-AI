package com.tradesphere.modules.screener.dto;

import com.tradesphere.modules.screener.entity.SavedScreen;
import java.math.BigDecimal;
import java.time.Instant;

public class SavedScreenDto {
    private Long id;
    private Long userId;
    private String name;
    private String market;
    private String sector;
    private String trend;
    private String rsiFilter;
    private BigDecimal minPe;
    private BigDecimal maxPe;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minMarketCapCr;
    private BigDecimal maxMarketCapCr;
    private Long minVolume;
    private String search;
    private String sortBy;
    private String sortDirection;
    private Instant createdAt;
    private Instant updatedAt;

    public SavedScreenDto() {}

    public static SavedScreenDto fromEntity(SavedScreen s) {
        SavedScreenDto dto = new SavedScreenDto();
        dto.setId(s.getId());
        dto.setUserId(s.getUserId());
        dto.setName(s.getName());
        dto.setMarket(s.getMarket());
        dto.setSector(s.getSector());
        dto.setTrend(s.getTrend());
        dto.setRsiFilter(s.getRsiFilter());
        dto.setMinPe(s.getMinPe());
        dto.setMaxPe(s.getMaxPe());
        dto.setMinPrice(s.getMinPrice());
        dto.setMaxPrice(s.getMaxPrice());
        dto.setMinMarketCapCr(s.getMinMarketCapCr());
        dto.setMaxMarketCapCr(s.getMaxMarketCapCr());
        dto.setMinVolume(s.getMinVolume());
        dto.setSearch(s.getSearch());
        dto.setSortBy(s.getSortBy());
        dto.setSortDirection(s.getSortDirection());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public String getRsiFilter() { return rsiFilter; }
    public void setRsiFilter(String rsiFilter) { this.rsiFilter = rsiFilter; }

    public BigDecimal getMinPe() { return minPe; }
    public void setMinPe(BigDecimal minPe) { this.minPe = minPe; }

    public BigDecimal getMaxPe() { return maxPe; }
    public void setMaxPe(BigDecimal maxPe) { this.maxPe = maxPe; }

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

    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDirection() { return sortDirection; }
    public void setSortDirection(String sortDirection) { this.sortDirection = sortDirection; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
