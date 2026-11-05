package com.tradesphere.modules.screener.dto;

import java.time.Instant;
import java.util.List;

public class ScreenerPageResponse {
    private List<ScreenerStockDto> items;
    private int totalResults;
    private int page;
    private int pageSize;
    private int totalPages;
    private String dataSource = "GEOMETRIC_BROWNIAN_MOTION_GBM";
    private String dataProvenance = "SIMULATED";
    private String dataStatus = "ACTIVE_SIMULATION";
    private Instant lastUpdated = Instant.now();
    private boolean isStale = false;

    public ScreenerPageResponse() {}

    public ScreenerPageResponse(List<ScreenerStockDto> items, int totalResults, int page, int pageSize) {
        this.items = items;
        this.totalResults = totalResults;
        this.page = page;
        this.pageSize = pageSize;
        this.totalPages = pageSize > 0 ? (int) Math.ceil((double) totalResults / pageSize) : 0;
        this.dataSource = "GEOMETRIC_BROWNIAN_MOTION_GBM";
        this.dataProvenance = "SIMULATED";
        this.dataStatus = "ACTIVE_SIMULATION";
        this.lastUpdated = Instant.now();
        this.isStale = false;
    }

    public List<ScreenerStockDto> getItems() { return items; }
    public void setItems(List<ScreenerStockDto> items) { this.items = items; }

    public int getTotalResults() { return totalResults; }
    public void setTotalResults(int totalResults) { this.totalResults = totalResults; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }

    public String getDataProvenance() { return dataProvenance; }
    public void setDataProvenance(String dataProvenance) { this.dataProvenance = dataProvenance; }

    public String getDataStatus() { return dataStatus; }
    public void setDataStatus(String dataStatus) { this.dataStatus = dataStatus; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }

    public boolean isStale() { return isStale; }
    public void setStale(boolean stale) { isStale = stale; }
}
