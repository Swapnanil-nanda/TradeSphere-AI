package com.tradesphere.modules.watchlist.repository;

import com.tradesphere.modules.watchlist.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {
    Optional<WatchlistItem> findByWatchlistIdAndInstrumentId(Long watchlistId, Long instrumentId);
    boolean existsByWatchlistIdAndInstrumentId(Long watchlistId, Long instrumentId);
    List<WatchlistItem> findByWatchlistIdOrderByDisplayOrderAscAddedAtAsc(Long watchlistId);
}
