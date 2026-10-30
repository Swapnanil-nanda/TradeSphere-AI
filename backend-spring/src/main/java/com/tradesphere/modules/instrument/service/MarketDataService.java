package com.tradesphere.modules.instrument.service;

import com.tradesphere.modules.instrument.dto.CandleDto;
import com.tradesphere.modules.instrument.dto.DomDepthDto;
import com.tradesphere.modules.instrument.dto.TickerQuoteDto;

import java.util.List;

public interface MarketDataService {
    TickerQuoteDto getQuote(String symbol);
    List<TickerQuoteDto> getAllQuotes();
    List<CandleDto> getCandles(String symbol, String timeframe, int count);
    DomDepthDto getDomLadder(String symbol, int depth);
}
