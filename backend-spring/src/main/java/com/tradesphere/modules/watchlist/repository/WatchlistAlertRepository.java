package com.tradesphere.modules.watchlist.repository;

import com.tradesphere.modules.watchlist.entity.WatchlistAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistAlertRepository extends JpaRepository<WatchlistAlert, Long> {

    List<WatchlistAlert> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<WatchlistAlert> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);

    Optional<WatchlistAlert> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
