package com.tradesphere.modules.watchlist.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.common.exception.TradeSphereException;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.instrument.dto.InstrumentDto;
import com.tradesphere.modules.instrument.entity.Instrument;
import com.tradesphere.modules.instrument.repository.InstrumentRepository;
import com.tradesphere.modules.instrument.service.InstrumentService;
import com.tradesphere.modules.watchlist.dto.CreateWatchlistRequest;
import com.tradesphere.modules.watchlist.dto.WatchlistDto;
import com.tradesphere.modules.watchlist.entity.Watchlist;
import com.tradesphere.modules.watchlist.entity.WatchlistItem;
import com.tradesphere.modules.watchlist.repository.WatchlistItemRepository;
import com.tradesphere.modules.watchlist.repository.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final WatchlistItemRepository watchlistItemRepository;
    private final InstrumentRepository instrumentRepository;
    private final InstrumentService instrumentService;

    public WatchlistService(
            WatchlistRepository watchlistRepository,
            WatchlistItemRepository watchlistItemRepository,
            InstrumentRepository instrumentRepository,
            InstrumentService instrumentService) {
        this.watchlistRepository = watchlistRepository;
        this.watchlistItemRepository = watchlistItemRepository;
        this.instrumentRepository = instrumentRepository;
        this.instrumentService = instrumentService;
    }

    @Transactional
    public void provisionDefaultWatchlist(User user) {
        if (!watchlistRepository.existsByUserIdAndNameIgnoreCase(user.getId(), "Core Market Watch")) {
            Watchlist wl = new Watchlist();
            wl.setUser(user);
            wl.setName("Core Market Watch");
            wl.setDefaultList(true);
            Watchlist savedWl = watchlistRepository.save(wl);

            List<String> defaultSymbols = List.of("RELIANCE", "TCS", "HDFCBANK", "AAPL", "NVDA");
            for (String sym : defaultSymbols) {
                instrumentRepository.findBySymbolIgnoreCase(sym).ifPresent(inst -> {
                    WatchlistItem item = new WatchlistItem(savedWl, inst);
                    savedWl.getItems().add(item);
                });
            }
            watchlistRepository.save(savedWl);
        }
    }

    @Transactional(readOnly = true)
    public List<WatchlistDto> getUserWatchlists(Long userId) {
        return watchlistRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WatchlistDto createWatchlist(Long userId, User user, CreateWatchlistRequest req) {
        if (watchlistRepository.existsByUserIdAndNameIgnoreCase(userId, req.getName().trim())) {
            throw new TradeSphereException("Watchlist already exists with name: " + req.getName());
        }

        Watchlist wl = new Watchlist();
        wl.setUser(user);
        wl.setName(req.getName().trim());
        wl.setDefaultList(false);

        Watchlist saved = watchlistRepository.save(wl);
        return toDto(saved);
    }

    @Transactional
    public WatchlistDto addInstrument(Long userId, Long watchlistId, String symbol) {
        Watchlist wl = watchlistRepository.findByIdAndUserId(watchlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist", "id", watchlistId));

        Instrument inst = instrumentRepository.findBySymbolIgnoreCase(symbol.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "symbol", symbol));

        if (!watchlistItemRepository.existsByWatchlistIdAndInstrumentId(wl.getId(), inst.getId())) {
            WatchlistItem item = new WatchlistItem(wl, inst);
            wl.getItems().add(item);
            watchlistRepository.save(wl);
        }

        return toDto(wl);
    }

    @Transactional
    public WatchlistDto removeInstrument(Long userId, Long watchlistId, String symbol) {
        Watchlist wl = watchlistRepository.findByIdAndUserId(watchlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist", "id", watchlistId));

        Instrument inst = instrumentRepository.findBySymbolIgnoreCase(symbol.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "symbol", symbol));

        watchlistItemRepository.findByWatchlistIdAndInstrumentId(wl.getId(), inst.getId())
                .ifPresent(item -> {
                    wl.getItems().remove(item);
                    watchlistItemRepository.delete(item);
                });

        return toDto(wl);
    }

    @Transactional
    public void deleteWatchlist(Long userId, Long watchlistId) {
        Watchlist wl = watchlistRepository.findByIdAndUserId(watchlistId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist", "id", watchlistId));

        if (wl.isDefaultList()) {
            throw new TradeSphereException("Cannot delete default watchlist.");
        }

        watchlistRepository.delete(wl);
    }

    private WatchlistDto toDto(Watchlist wl) {
        WatchlistDto dto = new WatchlistDto();
        dto.setId(wl.getId());
        dto.setUserId(wl.getUser().getId());
        dto.setName(wl.getName());
        dto.setDefaultList(wl.isDefaultList());
        dto.setCreatedAt(wl.getCreatedAt());

        List<InstrumentDto> instDtos = wl.getItems().stream()
                .map(item -> instrumentService.toDto(item.getInstrument()))
                .collect(Collectors.toList());
        dto.setInstruments(instDtos);

        return dto;
    }
}
