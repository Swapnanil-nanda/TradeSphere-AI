package com.tradesphere.modules.paper.dto;

import java.time.Instant;

public class TradeJournalDto {

    private Long id;
    private Long tradeId;
    private String symbol;
    private String side;
    private String setupType;
    private boolean entryRulesFollowed;
    private boolean exitRulesFollowed;
    private String emotionalState;
    private String mistakesTagged;
    private String notes;
    private int rating;
    private Instant createdAt;

    public TradeJournalDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTradeId() { return tradeId; }
    public void setTradeId(Long tradeId) { this.tradeId = tradeId; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }

    public String getSetupType() { return setupType; }
    public void setSetupType(String setupType) { this.setupType = setupType; }

    public boolean isEntryRulesFollowed() { return entryRulesFollowed; }
    public void setEntryRulesFollowed(boolean entryRulesFollowed) { this.entryRulesFollowed = entryRulesFollowed; }

    public boolean isExitRulesFollowed() { return exitRulesFollowed; }
    public void setExitRulesFollowed(boolean exitRulesFollowed) { this.exitRulesFollowed = exitRulesFollowed; }

    public String getEmotionalState() { return emotionalState; }
    public void setEmotionalState(String emotionalState) { this.emotionalState = emotionalState; }

    public String getMistakesTagged() { return mistakesTagged; }
    public void setMistakesTagged(String mistakesTagged) { this.mistakesTagged = mistakesTagged; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
