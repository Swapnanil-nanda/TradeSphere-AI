package com.tradesphere.modules.paper.repository;

import com.tradesphere.modules.paper.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {
    List<Position> findByAccountId(Long accountId);
    Optional<Position> findByAccountIdAndInstrumentId(Long accountId, Long instrumentId);
}
