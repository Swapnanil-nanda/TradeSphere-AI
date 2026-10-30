package com.tradesphere.modules.paper.repository;

import com.tradesphere.modules.paper.entity.PaperOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaperOrderRepository extends JpaRepository<PaperOrder, Long> {
    List<PaperOrder> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    List<PaperOrder> findByAccountIdAndStatusOrderByCreatedAtDesc(Long accountId, String status);
    List<PaperOrder> findByStatus(String status);
    Optional<PaperOrder> findByAccountIdAndClientOrderId(Long accountId, String clientOrderId);
}
