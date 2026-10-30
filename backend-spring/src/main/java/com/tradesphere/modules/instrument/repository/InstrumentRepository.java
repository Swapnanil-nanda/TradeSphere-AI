package com.tradesphere.modules.instrument.repository;

import com.tradesphere.modules.instrument.entity.Instrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstrumentRepository extends JpaRepository<Instrument, Long> {

    Optional<Instrument> findBySymbolIgnoreCase(String symbol);

    List<Instrument> findByActiveTrue();

    List<Instrument> findByMarketIgnoreCaseAndActiveTrue(String market);

    List<Instrument> findBySectorIgnoreCaseAndActiveTrue(String sector);

    @Query("SELECT i FROM Instrument i WHERE i.active = true AND " +
           "(LOWER(i.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Instrument> searchInstruments(@Param("query") String query);
}
