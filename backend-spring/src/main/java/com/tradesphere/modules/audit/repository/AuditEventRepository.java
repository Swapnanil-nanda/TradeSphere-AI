package com.tradesphere.modules.audit.repository;

import com.tradesphere.modules.audit.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<AuditEvent> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
