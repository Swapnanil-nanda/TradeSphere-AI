package com.tradesphere.modules.screener.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "saved_screens")
public class SavedScreen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 10)
    private String market;

    @Column(length = 100)
    private String sector;

    @Column(length = 50)
    private String trend;

    @Column(name = "rsi_filter", length = 50)
    private String rsiFilter;

    @Column(name = "min_pe", precision = 10, scale = 2)
    private BigDecimal minPe;

    @Column(name = "max_pe", precision = 10, scale = 2)
    private BigDecimal maxPe;

    @Column(name = "min_price", precision = 19, scale = 4)
    private BigDecimal minPrice;

    @Column(name = "max_price", precision = 19, scale = 4)
    private BigDecimal maxPrice;

    @Column(name = "min_market_cap_cr", precision = 19, scale = 4)
    private BigDecimal minMarketCapCr;

    @Column(name = "max_market_cap_cr", precision = 19, scale = 4)
    private BigDecimal maxMarketCapCr;

    @Column(name = "min_volume")
    private Long minVolume;

    @Column(length = 100)
    private String search;

    @Column(name = "sort_by", length = 50)
    private String sortBy = "changePct";

    @Column(name = "sort_direction", length = 10)
    private String sortDirection = "DESC";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public SavedScreen() {}

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
