package com.tradesphere.modules.screener.service;

import com.tradesphere.modules.instrument.dto.TickerQuoteDto;
import com.tradesphere.modules.instrument.entity.Instrument;
import com.tradesphere.modules.instrument.repository.InstrumentRepository;
import com.tradesphere.modules.instrument.service.MarketDataService;
import com.tradesphere.modules.screener.dto.ScreenerFilterRequest;
import com.tradesphere.modules.screener.dto.ScreenerPageResponse;
import com.tradesphere.modules.screener.dto.ScreenerStockDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ScreenerService {

    private final InstrumentRepository instrumentRepository;
    private final MarketDataService marketDataService;

    public ScreenerService(InstrumentRepository instrumentRepository, MarketDataService marketDataService) {
        this.instrumentRepository = instrumentRepository;
        this.marketDataService = marketDataService;
    }

    public ScreenerPageResponse screenStocks(ScreenerFilterRequest req) {
        List<ScreenerStockDto> allMatched = getFilteredList(req);
        int totalResults = allMatched.size();

        int page = req != null ? req.getPage() : 0;
        int pageSize = req != null ? req.getPageSize() : 20;

        int fromIndex = Math.min(page * pageSize, totalResults);
        int toIndex = Math.min(fromIndex + pageSize, totalResults);

        List<ScreenerStockDto> paginated = allMatched.subList(fromIndex, toIndex);

        return new ScreenerPageResponse(paginated, totalResults, page, pageSize);
    }

    public byte[] exportCsv(ScreenerFilterRequest req) {
        List<ScreenerStockDto> list = getFilteredList(req);
        StringBuilder sb = new StringBuilder();
        sb.append("Symbol,Name,Market,Exchange,Currency,Price,ChangePct,Volume,PE_Ratio,RSI_14,MarketCap_Cr,Trend,Setup,Provenance\n");

        for (ScreenerStockDto s : list) {
            sb.append(escapeCsv(s.getSymbol())).append(",")
              .append(escapeCsv(s.getName())).append(",")
              .append(escapeCsv(s.getMarket())).append(",")
              .append(escapeCsv(s.getExchange())).append(",")
              .append(escapeCsv(s.getCurrency())).append(",")
              .append(s.getPrice() != null ? s.getPrice().toPlainString() : "N/A").append(",")
              .append(s.getChangePct() != null ? s.getChangePct().toPlainString() : "N/A").append(",")
              .append(s.getVolume()).append(",")
              .append(s.getPeRatio() != null ? s.getPeRatio().toPlainString() : "N/A").append(",")
              .append(s.getRsi14() != null ? s.getRsi14().toPlainString() : "N/A").append(",")
              .append(s.getMarketCapCr() != null ? s.getMarketCapCr().toPlainString() : "N/A").append(",")
              .append(escapeCsv(s.getTrend())).append(",")
              .append(escapeCsv(s.getSetup())).append(",")
              .append(escapeCsv(s.getProvenance())).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private List<ScreenerStockDto> getFilteredList(ScreenerFilterRequest req) {
        List<Instrument> instruments = instrumentRepository.findByActiveTrue();
        List<ScreenerStockDto> list = new ArrayList<>();

        for (Instrument inst : instruments) {
            TickerQuoteDto q = marketDataService.getQuote(inst.getSymbol());

            BigDecimal pe = computePeRatio(inst.getSymbol());
            BigDecimal rsi = computeRsi(inst.getSymbol(), q.getChangePct());
            BigDecimal marketCapCr = computeMarketCapCr(inst.getSymbol());

            String trend;
            if (q.getChangePct().compareTo(new BigDecimal("0.5")) > 0) {
                trend = "BULLISH";
            } else if (q.getChangePct().compareTo(new BigDecimal("-0.5")) < 0) {
                trend = "BEARISH";
            } else {
                trend = "CONSOLIDATION";
            }

            String setup = switch (inst.getSymbol()) {
                case "RELIANCE" -> "20-EMA Trend Continuation";
                case "TCS" -> "Support Zone Pullback";
                case "INFY" -> "VWAP Breakout";
                case "HDFCBANK" -> "Ascending Triangle";
                case "TATAMOTORS" -> "Mean Reversion Test";
                case "AAPL" -> "Institutional Accumulation";
                case "NVDA" -> "High Momentum Cup & Handle";
                case "MSFT" -> "Enterprise Cloud Accumulation";
                case "TSLA" -> "High Beta Breakout Channel";
                case "SPY" -> "Broad Market Macro Allocation";
                case "QQQ" -> "Tech MegaCap Basket Flow";
                default -> "Trend Channel Bounce";
            };

            // Apply filters
            if (req != null) {
                // Market filter
                if (req.getMarket() != null && !req.getMarket().isBlank() && !req.getMarket().equalsIgnoreCase("ALL")
                        && !inst.getMarket().equalsIgnoreCase(req.getMarket())) {
                    continue;
                }
                // Sector filter
                if (req.getSector() != null && !req.getSector().isBlank() && !req.getSector().equalsIgnoreCase("ALL")
                        && !inst.getSector().equalsIgnoreCase(req.getSector())) {
                    continue;
                }
                // Trend filter
                if (req.getTrend() != null && !req.getTrend().isBlank() && !req.getTrend().equalsIgnoreCase("ALL")
                        && !trend.equalsIgnoreCase(req.getTrend())) {
                    continue;
                }
                // Price filters
                if (req.getMinPrice() != null && q.getLtp().compareTo(req.getMinPrice()) < 0) {
                    continue;
                }
                if (req.getMaxPrice() != null && q.getLtp().compareTo(req.getMaxPrice()) > 0) {
                    continue;
                }
                // Volume filter
                if (req.getMinVolume() != null && q.getVolume() < req.getMinVolume()) {
                    continue;
                }
                // Market Cap filters
                if (req.getMinMarketCapCr() != null) {
                    if (marketCapCr == null || marketCapCr.compareTo(req.getMinMarketCapCr()) < 0) {
                        continue;
                    }
                }
                if (req.getMaxMarketCapCr() != null) {
                    if (marketCapCr == null || marketCapCr.compareTo(req.getMaxMarketCapCr()) > 0) {
                        continue;
                    }
                }
                // P/E filters
                if (req.getMinPe() != null) {
                    if (pe == null || pe.compareTo(req.getMinPe()) < 0) {
                        continue;
                    }
                }
                if (req.getMaxPe() != null) {
                    if (pe == null || pe.compareTo(req.getMaxPe()) > 0) {
                        continue;
                    }
                }
                // RSI filters
                if (req.getMinRsi() != null && rsi.compareTo(req.getMinRsi()) < 0) {
                    continue;
                }
                if (req.getMaxRsi() != null && rsi.compareTo(req.getMaxRsi()) > 0) {
                    continue;
                }
                // Search filter (by symbol or name)
                if (req.getSearch() != null && !req.getSearch().trim().isEmpty()) {
                    String query = req.getSearch().trim().toLowerCase();
                    boolean symbolMatch = inst.getSymbol().toLowerCase().contains(query);
                    boolean nameMatch = inst.getName().toLowerCase().contains(query);
                    if (!symbolMatch && !nameMatch) {
                        continue;
                    }
                }
            }

            list.add(new ScreenerStockDto(
                    inst.getSymbol(),
                    inst.getName(),
                    inst.getMarket(),
                    inst.getSector(),
                    inst.getExchange(),
                    inst.getCurrency(),
                    q.getLtp(),
                    q.getChangePct(),
                    q.getVolume(),
                    pe,
                    rsi,
                    marketCapCr,
                    trend,
                    setup
            ));
        }

        // Apply sorting
        String sortBy = req != null && req.getSortBy() != null ? req.getSortBy() : "changePct";
        boolean desc = req == null || req.getSortDirection() == null || !req.getSortDirection().equalsIgnoreCase("ASC");

        Comparator<ScreenerStockDto> comp = switch (sortBy.toLowerCase()) {
            case "symbol" -> Comparator.comparing(ScreenerStockDto::getSymbol, String.CASE_INSENSITIVE_ORDER);
            case "name" -> Comparator.comparing(ScreenerStockDto::getName, String.CASE_INSENSITIVE_ORDER);
            case "price" -> Comparator.comparing(ScreenerStockDto::getPrice, Comparator.nullsLast(BigDecimal::compareTo));
            case "volume" -> Comparator.comparingLong(ScreenerStockDto::getVolume);
            case "peratio", "pe" -> Comparator.comparing(ScreenerStockDto::getPeRatio, Comparator.nullsLast(BigDecimal::compareTo));
            case "rsi14", "rsi" -> Comparator.comparing(ScreenerStockDto::getRsi14, Comparator.nullsLast(BigDecimal::compareTo));
            case "marketcapcr", "marketcap" -> Comparator.comparing(ScreenerStockDto::getMarketCapCr, Comparator.nullsLast(BigDecimal::compareTo));
            default -> Comparator.comparing(ScreenerStockDto::getChangePct, Comparator.nullsLast(BigDecimal::compareTo));
        };

        if (desc) {
            comp = comp.reversed();
        }

        list.sort(comp);
        return list;
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
            // ETFs do not have traditional equity P/E ratios; return null for N/A display
            case "SPY", "QQQ" -> null;
            default -> new BigDecimal("24.0");
        };
    }

    private BigDecimal computeMarketCapCr(String symbol) {
        return switch (symbol.toUpperCase()) {
            case "RELIANCE" -> new BigDecimal("1980000");
            case "TCS" -> new BigDecimal("1450000");
            case "INFY" -> new BigDecimal("760000");
            case "HDFCBANK" -> new BigDecimal("1320000");
            case "ICICIBANK" -> new BigDecimal("860000");
            case "SBIN" -> new BigDecimal("730000");
            case "TATAMOTORS" -> new BigDecimal("340000");
            case "AAPL" -> new BigDecimal("2900000");
            case "MSFT" -> new BigDecimal("2650000");
            case "NVDA" -> new BigDecimal("2800000");
            case "TSLA" -> new BigDecimal("680000");
            case "SPY" -> new BigDecimal("4500000");
            case "QQQ" -> new BigDecimal("2400000");
            default -> new BigDecimal("500000");
        };
    }

    private BigDecimal computeRsi(String symbol, BigDecimal changePct) {
        double baseRsi = 50.0 + (changePct != null ? changePct.doubleValue() * 8.0 : 0.0);
        double clamped = Math.max(15.0, Math.min(85.0, baseRsi));
        return BigDecimal.valueOf(clamped).setScale(1, RoundingMode.HALF_UP);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
