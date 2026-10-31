package com.tradesphere.modules.paper.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "trade_journals")
public class TradeJournal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private PaperAccount account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trade_id")
    private PaperTrade trade;

    @Column(nullable = false, length = 50)
    private String symbol;

    @Column(nullable = false, length = 10)
    private String side;

    @Column(name = "setup_type", nullable = false, length = 100)
    private String setupType;

    @Column(name = "entry_rules_followed", nullable = false)
    private boolean entryRulesFollowed = true;

    @Column(name = "exit_rules_followed", nullable = false)
    private boolean exitRulesFollowed = true;

    @Column(name = "emotional_state", nullable = false, length = 50)
    private String emotionalState = "DISCIPLINED";

    @Column(name = "mistakes_tagged", length = 255)
    private String mistakesTagged = "NONE";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private int rating = 5;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public TradeJournal() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PaperAccount getAccount() { return account; }
    public void setAccount(PaperAccount account) { this.account = account; }

    public PaperTrade getTrade() { return trade; }
    public void setTrade(PaperTrade trade) { this.trade = trade; }

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

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
