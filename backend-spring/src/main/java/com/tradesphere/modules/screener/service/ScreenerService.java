package com.tradesphere.modules.screener.service;

import com.tradesphere.modules.instrument.dto.TickerQuoteDto;
import com.tradesphere.modules.instrument.entity.Instrument;
import com.tradesphere.modules.instrument.repository.InstrumentRepository;
import com.tradesphere.modules.instrument.service.MarketDataService;
import com.tradesphere.modules.screener.dto.ScreenerFilterRequest;
import com.tradesphere.modules.screener.dto.ScreenerStockDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScreenerService {

    private final InstrumentRepository instrumentRepository;
    private final MarketDataService marketDataService;

    public ScreenerService(InstrumentRepository instrumentRepository, MarketDataService marketDataService) {
        this.instrumentRepository = instrumentRepository;
        this.marketDataService = marketDataService;
    }

    public List<ScreenerStockDto> screenStocks(ScreenerFilterRequest req) {
        List<Instrument> instruments = instrumentRepository.findByActiveTrue();
        List<ScreenerStockDto> results = new ArrayList<>();

        for (Instrument inst : instruments) {
            TickerQuoteDto q = marketDataService.getQuote(inst.getSymbol());

            // Compute deterministic technical and valuation features
            BigDecimal pe = computePeRatio(inst.getSymbol());
            BigDecimal rsi = computeRsi(inst.getSymbol(), q.getChangePct());
            String trend = q.getChangePct().compareTo(BigDecimal.ZERO) >= 0 ? "BULLISH" : "BEARISH";
            String setup = switch (inst.getSymbol()) {
                case "RELIANCE" -> "20-EMA Trend Continuation";
                case "TCS" -> "Support Zone Pullback";
                case "INFY" -> "VWAP Breakout";
                case "HDFCBANK" -> "Ascending Triangle";
                case "TATAMOTORS" -> "Mean Reversion Test";
                case "AAPL" -> "Institutional Accumulation";
                case "NVDA" -> "High Momentum Cup & Handle";
                default -> "Trend Channel Bounce";
            };

            // Apply filters
            if (req != null) {
                if (req.getMarket() != null && !req.getMarket().equalsIgnoreCase("ALL")
                        && !inst.getMarket().equalsIgnoreCase(req.getMarket())) {
                    continue;
                }
                if (req.getSector() != null && !req.getSector().equalsIgnoreCase("ALL")
                        && !inst.getSector().equalsIgnoreCase(req.getSector())) {
                    continue;
                }
                if (req.getTrend() != null && !req.getTrend().equalsIgnoreCase("ALL")
                        && !trend.equalsIgnoreCase(req.getTrend())) {
                    continue;
                }
                if (req.getMaxPe() != null && pe.compareTo(req.getMaxPe()) > 0) {
                    continue;
                }
                if (req.getMinRsi() != null && rsi.compareTo(req.getMinRsi()) < 0) {
                    continue;
                }
                if (req.getMaxRsi() != null && rsi.compareTo(req.getMaxRsi()) > 0) {
                    continue;
                }
            }

            results.add(new ScreenerStockDto(
                    inst.getSymbol(),
                    inst.getName(),
                    inst.getMarket(),
                    inst.getSector(),
                    q.getLtp(),
                    q.getChangePct(),
                    q.getVolume(),
                    pe,
                    rsi,
                    trend,
                    setup
            ));
        }

        return results;
    }

    private BigDecimal computePeRatio(String symbol) {
        return switch (symbol.toUpperCase()) {
            case "RELIANCE" -> new BigDecimal("26.4");
            case "TCS" -> new BigDecimal("31.8");
            case "INFY" -> new BigDecimal("28.1");
            case "HDFCBANK" -> new BigDecimal("19.4");
            case "TATAMOTORS" -> new BigDecimal("16.2");
            case "ICICIBANK" -> new BigDecimal("18.5");
            case "SBIN" -> new BigDecimal("11.3");
            case "AAPL" -> new BigDecimal("34.2");
            case "MSFT" -> new BigDecimal("36.1");
            case "NVDA" -> new BigDecimal("48.5");
            case "TSLA" -> new BigDecimal("68.2");
            default -> new BigDecimal("25.0");
        };
    }

    private BigDecimal computeRsi(String symbol, BigDecimal changePct) {
        double baseRsi = 50.0 + changePct.doubleValue() * 8.0;
        double clamped = Math.max(15.0, Math.min(85.0, baseRsi));
        return BigDecimal.valueOf(clamped).setScale(1, RoundingMode.HALF_UP);
    }
}
