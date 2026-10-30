package com.tradesphere.modules.instrument.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.modules.instrument.dto.CandleDto;
import com.tradesphere.modules.instrument.dto.DomDepthDto;
import com.tradesphere.modules.instrument.dto.TickerQuoteDto;
import com.tradesphere.modules.instrument.entity.Instrument;
import com.tradesphere.modules.instrument.repository.InstrumentRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GbmSimulatorService implements MarketDataService {

    private final InstrumentRepository instrumentRepository;
    private final Map<String, TickerQuoteDto> quoteCache = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public GbmSimulatorService(InstrumentRepository instrumentRepository) {
        this.instrumentRepository = instrumentRepository;
    }

    @PostConstruct
    public void initQuotes() {
        List<Instrument> instruments = instrumentRepository.findAll();
        for (Instrument inst : instruments) {
            TickerQuoteDto quote = createInitialQuote(inst);
            quoteCache.put(inst.getSymbol().toUpperCase(), quote);
        }
    }

    private TickerQuoteDto createInitialQuote(Instrument inst) {
        BigDecimal base = inst.getBasePrice();
        BigDecimal spread = base.multiply(new BigDecimal("0.0003")).setScale(2, RoundingMode.HALF_UP);
        if (spread.compareTo(new BigDecimal("0.05")) < 0) {
            spread = new BigDecimal("0.05");
        }

        TickerQuoteDto q = new TickerQuoteDto();
        q.setSymbol(inst.getSymbol());
        q.setName(inst.getName());
        q.setExchange(inst.getExchange());
        q.setMarket(inst.getMarket());
        q.setCurrency(inst.getCurrency());
        q.setLtp(base.setScale(2, RoundingMode.HALF_UP));
        q.setChange(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        q.setChangePct(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        q.setDayHigh(base.multiply(new BigDecimal("1.008")).setScale(2, RoundingMode.HALF_UP));
        q.setDayLow(base.multiply(new BigDecimal("0.992")).setScale(2, RoundingMode.HALF_UP));
        q.setBid(base.subtract(spread.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP)));
        q.setAsk(base.add(spread.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP)));
        q.setVolume(1250000L);
        q.setTimestamp(Instant.now());
        return q;
    }

    @Scheduled(fixedRate = 1000)
    public void updateGbmTicks() {
        if (quoteCache.isEmpty()) {
            initQuotes();
        }

        for (Map.Entry<String, TickerQuoteDto> entry : quoteCache.entrySet()) {
            TickerQuoteDto q = entry.getValue();
            double ltpDouble = q.getLtp().doubleValue();

            // Geometric Brownian Motion step: dS = S * (mu*dt + sigma*dW)
            double dt = 1.0 / 3600.0;
            double drift = 0.0001 * dt;
            double volatility = 0.002 * Math.sqrt(dt);
            double dW = random.nextGaussian();
            double pctChange = drift + volatility * dW;

            double newPriceDouble = ltpDouble * (1.0 + pctChange);
            BigDecimal newLtp = BigDecimal.valueOf(newPriceDouble).setScale(2, RoundingMode.HALF_UP);

            BigDecimal dayHigh = q.getDayHigh().max(newLtp);
            BigDecimal dayLow = q.getDayLow().min(newLtp);

            Instrument inst = instrumentRepository.findBySymbolIgnoreCase(q.getSymbol()).orElse(null);
            BigDecimal base = inst != null ? inst.getBasePrice() : newLtp;
            BigDecimal change = newLtp.subtract(base).setScale(2, RoundingMode.HALF_UP);
            BigDecimal changePct = change.divide(base, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);

            BigDecimal spread = newLtp.multiply(new BigDecimal("0.0003")).setScale(2, RoundingMode.HALF_UP);
            if (spread.compareTo(new BigDecimal("0.05")) < 0) {
                spread = new BigDecimal("0.05");
            }

            q.setLtp(newLtp);
            q.setChange(change);
            q.setChangePct(changePct);
            q.setDayHigh(dayHigh);
            q.setDayLow(dayLow);
            q.setBid(newLtp.subtract(spread.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP)));
            q.setAsk(newLtp.add(spread.divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP)));
            q.setVolume(q.getVolume() + (long) (random.nextInt(400) + 50));
            q.setTimestamp(Instant.now());
        }
    }

    @Override
    public TickerQuoteDto getQuote(String symbol) {
        String sym = symbol.toUpperCase();
        TickerQuoteDto quote = quoteCache.get(sym);
        if (quote == null) {
            Instrument inst = instrumentRepository.findBySymbolIgnoreCase(sym)
                    .orElseThrow(() -> new ResourceNotFoundException("Instrument", "symbol", sym));
            quote = createInitialQuote(inst);
            quoteCache.put(sym, quote);
        }
        return quote;
    }

    @Override
    public List<TickerQuoteDto> getAllQuotes() {
        if (quoteCache.isEmpty()) {
            initQuotes();
        }
        return new ArrayList<>(quoteCache.values());
    }

    @Override
    public List<CandleDto> getCandles(String symbol, String timeframe, int count) {
        TickerQuoteDto quote = getQuote(symbol);
        BigDecimal currentPrice = quote.getLtp();
        List<CandleDto> candles = new ArrayList<>();
        long nowSec = Instant.now().getEpochSecond();
        int candleDurationSec = switch (timeframe.toLowerCase()) {
            case "1m" -> 60;
            case "5m" -> 300;
            case "15m" -> 900;
            case "1h" -> 3600;
            case "1d" -> 86400;
            default -> 300;
        };

        BigDecimal price = currentPrice;
        for (int i = count - 1; i >= 0; i--) {
            long time = nowSec - ((long) i * candleDurationSec);
            double delta = (Math.sin(i * 0.4) + Math.cos(i * 0.2)) * (currentPrice.doubleValue() * 0.003);
            BigDecimal open = price.add(BigDecimal.valueOf(delta)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal high = open.multiply(BigDecimal.valueOf(1.0 + random.nextDouble() * 0.004)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal low = open.multiply(BigDecimal.valueOf(1.0 - random.nextDouble() * 0.004)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal close = open.add(high).add(low).divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
            long vol = 5000 + random.nextInt(20000);

            BigDecimal ema20 = open.multiply(new BigDecimal("0.998")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal vwap = open.multiply(new BigDecimal("0.999")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal support = low.multiply(new BigDecimal("0.995")).setScale(2, RoundingMode.HALF_UP);
            BigDecimal resistance = high.multiply(new BigDecimal("1.005")).setScale(2, RoundingMode.HALF_UP);

            price = close;
            candles.add(new CandleDto(time, open, high, low, close, vol, ema20, vwap, support, resistance));
        }

        return candles;
    }

    @Override
    public DomDepthDto getDomLadder(String symbol, int depth) {
        TickerQuoteDto quote = getQuote(symbol);
        BigDecimal ltp = quote.getLtp();
        BigDecimal bid = quote.getBid();
        BigDecimal ask = quote.getAsk();

        int targetDepth = depth > 0 ? Math.min(depth, 20) : 10;
        List<DomDepthDto.OrderBookLevel> bids = new ArrayList<>();
        List<DomDepthDto.OrderBookLevel> asks = new ArrayList<>();

        for (int i = 0; i < targetDepth; i++) {
            BigDecimal step = BigDecimal.valueOf((i + 1) * 0.40);
            BigDecimal bPrice = bid.subtract(step).setScale(2, RoundingMode.HALF_UP);
            BigDecimal aPrice = ask.add(step).setScale(2, RoundingMode.HALF_UP);

            int bQty = 200 + random.nextInt(350);
            int aQty = 180 + random.nextInt(320);

            bids.add(new DomDepthDto.OrderBookLevel(bPrice, bQty, Math.max(1, bQty / 40)));
            asks.add(new DomDepthDto.OrderBookLevel(aPrice, aQty, Math.max(1, aQty / 35)));
        }

        DomDepthDto dom = new DomDepthDto();
        dom.setSymbol(quote.getSymbol());
        dom.setLtp(ltp);
        dom.setSpread(ask.subtract(bid).setScale(2, RoundingMode.HALF_UP));
        dom.setBids(bids);
        dom.setAsks(asks);
        return dom;
    }
}
