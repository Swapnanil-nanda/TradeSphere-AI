package com.tradesphere.modules.paper.repository;

import com.tradesphere.modules.paper.entity.PaperAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaperAccountRepository extends JpaRepository<PaperAccount, Long> {
    Optional<PaperAccount> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
