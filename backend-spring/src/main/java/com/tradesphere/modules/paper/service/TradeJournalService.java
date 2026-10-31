package com.tradesphere.modules.paper.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.modules.paper.dto.CreateJournalEntryRequest;
import com.tradesphere.modules.paper.dto.TradeJournalDto;
import com.tradesphere.modules.paper.entity.PaperAccount;
import com.tradesphere.modules.paper.entity.PaperTrade;
import com.tradesphere.modules.paper.entity.TradeJournal;
import com.tradesphere.modules.paper.repository.PaperAccountRepository;
import com.tradesphere.modules.paper.repository.PaperTradeRepository;
import com.tradesphere.modules.paper.repository.TradeJournalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TradeJournalService {

    private final TradeJournalRepository tradeJournalRepository;
    private final PaperAccountRepository paperAccountRepository;
    private final PaperTradeRepository paperTradeRepository;

    public TradeJournalService(TradeJournalRepository tradeJournalRepository,
                               PaperAccountRepository paperAccountRepository,
                               PaperTradeRepository paperTradeRepository) {
        this.tradeJournalRepository = tradeJournalRepository;
        this.paperAccountRepository = paperAccountRepository;
        this.paperTradeRepository = paperTradeRepository;
    }

    @Transactional
    public TradeJournalDto createEntry(Long userId, CreateJournalEntryRequest request) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        TradeJournal journal = new TradeJournal();
        journal.setAccount(account);
        journal.setSymbol(request.getSymbol().toUpperCase());
        journal.setSide(request.getSide().toUpperCase());
        journal.setSetupType(request.getSetupType());
        journal.setEntryRulesFollowed(request.isEntryRulesFollowed());
        journal.setExitRulesFollowed(request.isExitRulesFollowed());
        journal.setEmotionalState(request.getEmotionalState());
        journal.setMistakesTagged(request.getMistakesTagged());
        journal.setNotes(request.getNotes());
        journal.setRating(request.getRating());
        journal.setCreatedAt(Instant.now());
        journal.setUpdatedAt(Instant.now());

        if (request.getTradeId() != null) {
            PaperTrade trade = paperTradeRepository.findById(request.getTradeId())
                    .filter(t -> t.getAccount().getId().equals(account.getId()))
                    .orElse(null);
            journal.setTrade(trade);
        }

        TradeJournal saved = tradeJournalRepository.save(journal);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TradeJournalDto> getEntries(Long userId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        return tradeJournalRepository.findByAccountIdOrderByCreatedAtDesc(account.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TradeJournalDto> getEntriesBySymbol(Long userId, String symbol) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        return tradeJournalRepository.findByAccountIdAndSymbolOrderByCreatedAtDesc(account.getId(), symbol.toUpperCase())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteEntry(Long userId, Long journalId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        TradeJournal journal = tradeJournalRepository.findById(journalId)
                .filter(j -> j.getAccount().getId().equals(account.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("TradeJournal", "id", journalId));

        tradeJournalRepository.delete(journal);
    }

    private TradeJournalDto mapToDto(TradeJournal entity) {
        TradeJournalDto dto = new TradeJournalDto();
        dto.setId(entity.getId());
        dto.setTradeId(entity.getTrade() != null ? entity.getTrade().getId() : null);
        dto.setSymbol(entity.getSymbol());
        dto.setSide(entity.getSide());
        dto.setSetupType(entity.getSetupType());
        dto.setEntryRulesFollowed(entity.isEntryRulesFollowed());
        dto.setExitRulesFollowed(entity.isExitRulesFollowed());
        dto.setEmotionalState(entity.getEmotionalState());
        dto.setMistakesTagged(entity.getMistakesTagged());
        dto.setNotes(entity.getNotes());
        dto.setRating(entity.getRating());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
