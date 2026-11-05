package com.tradesphere.modules.screener.repository;

import com.tradesphere.modules.screener.entity.SavedScreen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedScreenRepository extends JpaRepository<SavedScreen, Long> {
    List<SavedScreen> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SavedScreen> findByIdAndUserId(Long id, Long userId);
    void deleteByIdAndUserId(Long id, Long userId);
}
