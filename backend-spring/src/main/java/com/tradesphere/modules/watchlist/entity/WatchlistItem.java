package com.tradesphere.modules.watchlist.entity;

import com.tradesphere.modules.instrument.entity.Instrument;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "watchlist_items", uniqueConstraints = {
        @UniqueConstraint(name = "uq_watchlist_instrument", columnNames = {"watchlist_id", "instrument_id"})
})
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "watchlist_id", nullable = false)
    private Watchlist watchlist;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt = Instant.now();

    public WatchlistItem() {}

    public WatchlistItem(Watchlist watchlist, Instrument instrument) {
        this.watchlist = watchlist;
        this.instrument = instrument;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Watchlist getWatchlist() { return watchlist; }
    public void setWatchlist(Watchlist watchlist) { this.watchlist = watchlist; }
    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }
    public Instant getAddedAt() { return addedAt; }
    public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }
}
