package com.tradesphere.modules.instrument.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.modules.instrument.dto.InstrumentDto;
import com.tradesphere.modules.instrument.entity.Instrument;
import com.tradesphere.modules.instrument.repository.InstrumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstrumentService {

    private final InstrumentRepository instrumentRepository;

    public InstrumentService(InstrumentRepository instrumentRepository) {
        this.instrumentRepository = instrumentRepository;
    }

    @Transactional(readOnly = true)
    public List<InstrumentDto> getAllActiveInstruments() {
        return instrumentRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InstrumentDto getBySymbol(String symbol) {
        Instrument inst = instrumentRepository.findBySymbolIgnoreCase(symbol)
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "symbol", symbol));
        return toDto(inst);
    }

    @Transactional(readOnly = true)
    public List<InstrumentDto> searchInstruments(String query) {
        if (query == null || query.isBlank()) {
            return getAllActiveInstruments();
        }
        return instrumentRepository.searchInstruments(query.trim()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public InstrumentDto toDto(Instrument i) {
        InstrumentDto dto = new InstrumentDto();
        dto.setId(i.getId());
        dto.setSymbol(i.getSymbol());
        dto.setName(i.getName());
        dto.setExchange(i.getExchange());
        dto.setMarket(i.getMarket());
        dto.setCurrency(i.getCurrency());
        dto.setSector(i.getSector());
        dto.setIndustry(i.getIndustry());
        dto.setTickSize(i.getTickSize());
        dto.setLotSize(i.getLotSize());
        dto.setBasePrice(i.getBasePrice());
        return dto;
    }
}
