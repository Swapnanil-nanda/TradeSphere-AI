package com.tradesphere.modules.watchlist.repository;

import com.tradesphere.modules.watchlist.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    List<Watchlist> findByUserIdOrderByCreatedAtAsc(Long userId);
    Optional<Watchlist> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}
