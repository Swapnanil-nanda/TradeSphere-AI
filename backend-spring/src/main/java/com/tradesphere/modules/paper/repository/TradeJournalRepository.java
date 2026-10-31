package com.tradesphere.modules.paper.repository;

import com.tradesphere.modules.paper.entity.TradeJournal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeJournalRepository extends JpaRepository<TradeJournal, Long> {
    List<TradeJournal> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    List<TradeJournal> findByAccountIdAndSymbolOrderByCreatedAtDesc(Long accountId, String symbol);
}
