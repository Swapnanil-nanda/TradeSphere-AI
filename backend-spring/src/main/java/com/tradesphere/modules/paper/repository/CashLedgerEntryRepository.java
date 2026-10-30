package com.tradesphere.modules.paper.repository;

import com.tradesphere.modules.paper.entity.CashLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CashLedgerEntryRepository extends JpaRepository<CashLedgerEntry, Long> {
    List<CashLedgerEntry> findByAccountIdOrderByCreatedAtDesc(Long accountId);
}
