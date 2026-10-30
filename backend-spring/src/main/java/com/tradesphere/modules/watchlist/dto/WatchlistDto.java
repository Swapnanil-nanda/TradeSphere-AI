package com.tradesphere.modules.watchlist.dto;

import com.tradesphere.modules.instrument.dto.InstrumentDto;
import java.time.Instant;
import java.util.List;

public class WatchlistDto {
    private Long id;
    private Long userId;
    private String name;
    private boolean defaultList;
    private Instant createdAt;
    private List<InstrumentDto> instruments;

    public WatchlistDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isDefaultList() { return defaultList; }
    public void setDefaultList(boolean defaultList) { this.defaultList = defaultList; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<InstrumentDto> getInstruments() { return instruments; }
    public void setInstruments(List<InstrumentDto> instruments) { this.instruments = instruments; }
}
