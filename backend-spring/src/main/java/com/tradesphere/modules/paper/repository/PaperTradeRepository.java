package com.tradesphere.modules.paper.repository;

import com.tradesphere.modules.paper.entity.PaperTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperTradeRepository extends JpaRepository<PaperTrade, Long> {
    List<PaperTrade> findByAccountIdOrderByExecutedAtDesc(Long accountId);
}
