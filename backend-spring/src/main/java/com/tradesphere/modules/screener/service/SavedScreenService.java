package com.tradesphere.modules.screener.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.modules.screener.dto.CreateSavedScreenRequest;
import com.tradesphere.modules.screener.dto.SavedScreenDto;
import com.tradesphere.modules.screener.entity.SavedScreen;
import com.tradesphere.modules.screener.repository.SavedScreenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavedScreenService {

    private final SavedScreenRepository savedScreenRepository;

    public SavedScreenService(SavedScreenRepository savedScreenRepository) {
        this.savedScreenRepository = savedScreenRepository;
    }

    @Transactional(readOnly = true)
    public List<SavedScreenDto> getSavedScreens(Long userId) {
        return savedScreenRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(SavedScreenDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavedScreenDto createSavedScreen(Long userId, CreateSavedScreenRequest req) {
        SavedScreen screen = new SavedScreen();
        screen.setUserId(userId);
        screen.setName(req.getName().trim());
        screen.setMarket(req.getMarket());
        screen.setSector(req.getSector());
        screen.setTrend(req.getTrend());
        screen.setRsiFilter(req.getRsiFilter());
        screen.setMinPe(req.getMinPe());
        screen.setMaxPe(req.getMaxPe());
        screen.setMinPrice(req.getMinPrice());
        screen.setMaxPrice(req.getMaxPrice());
        screen.setMinMarketCapCr(req.getMinMarketCapCr());
        screen.setMaxMarketCapCr(req.getMaxMarketCapCr());
        screen.setMinVolume(req.getMinVolume());
        screen.setSearch(req.getSearch());
        if (req.getSortBy() != null && !req.getSortBy().isBlank()) {
            screen.setSortBy(req.getSortBy());
        }
        if (req.getSortDirection() != null && !req.getSortDirection().isBlank()) {
            screen.setSortDirection(req.getSortDirection().toUpperCase());
        }
        screen.setCreatedAt(Instant.now());
        screen.setUpdatedAt(Instant.now());

        SavedScreen saved = savedScreenRepository.save(screen);
        return SavedScreenDto.fromEntity(saved);
    }

    @Transactional
    public void deleteSavedScreen(Long userId, Long screenId) {
        SavedScreen screen = savedScreenRepository.findByIdAndUserId(screenId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SavedScreen", "id", screenId));
        savedScreenRepository.delete(screen);
    }
}
