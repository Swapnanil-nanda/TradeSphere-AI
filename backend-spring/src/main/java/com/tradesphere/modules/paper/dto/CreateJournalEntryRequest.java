package com.tradesphere.modules.paper.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class CreateJournalEntryRequest {

    private Long tradeId;

    @NotBlank(message = "Symbol is required")
    private String symbol;

    @NotBlank(message = "Side is required (BUY/SELL)")
    private String side = "BUY";

    @NotBlank(message = "Setup type is required")
    private String setupType = "20_EMA_PULLBACK";

    private boolean entryRulesFollowed = true;
    private boolean exitRulesFollowed = true;
    private String emotionalState = "DISCIPLINED";
    private String mistakesTagged = "NONE";
    private String notes;

    @Min(1)
    @Max(5)
    private int rating = 5;

    public CreateJournalEntryRequest() {}

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
}
