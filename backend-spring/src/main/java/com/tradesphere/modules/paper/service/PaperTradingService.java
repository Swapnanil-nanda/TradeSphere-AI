package com.tradesphere.modules.paper.service;

import com.tradesphere.common.exception.ResourceNotFoundException;
import com.tradesphere.common.exception.TradeSphereException;
import com.tradesphere.modules.audit.service.AuditEventService;
import com.tradesphere.modules.auth.entity.User;
import com.tradesphere.modules.auth.repository.UserRepository;
import com.tradesphere.modules.instrument.dto.TickerQuoteDto;
import com.tradesphere.modules.instrument.entity.Instrument;
import com.tradesphere.modules.instrument.repository.InstrumentRepository;
import com.tradesphere.modules.instrument.service.MarketDataService;
import com.tradesphere.modules.paper.dto.*;
import com.tradesphere.modules.paper.entity.*;
import com.tradesphere.modules.paper.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaperTradingService {

    private final UserRepository userRepository;
    private final InstrumentRepository instrumentRepository;
    private final PaperAccountRepository paperAccountRepository;
    private final PaperOrderRepository paperOrderRepository;
    private final PaperTradeRepository paperTradeRepository;
    private final PositionRepository positionRepository;
    private final CashLedgerEntryRepository ledgerRepository;
    private final MarketDataService marketDataService;
    private final RiskGatekeeper riskGatekeeper;
    private final AuditEventService auditEventService;

    public PaperTradingService(
            UserRepository userRepository,
            InstrumentRepository instrumentRepository,
            PaperAccountRepository paperAccountRepository,
            PaperOrderRepository paperOrderRepository,
            PaperTradeRepository paperTradeRepository,
            PositionRepository positionRepository,
            CashLedgerEntryRepository ledgerRepository,
            MarketDataService marketDataService,
            RiskGatekeeper riskGatekeeper,
            AuditEventService auditEventService) {
        this.userRepository = userRepository;
        this.instrumentRepository = instrumentRepository;
        this.paperAccountRepository = paperAccountRepository;
        this.paperOrderRepository = paperOrderRepository;
        this.paperTradeRepository = paperTradeRepository;
        this.positionRepository = positionRepository;
        this.ledgerRepository = ledgerRepository;
        this.marketDataService = marketDataService;
        this.riskGatekeeper = riskGatekeeper;
        this.auditEventService = auditEventService;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, OrderRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        Instrument instrument = instrumentRepository.findBySymbolIgnoreCase(req.getSymbol().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "symbol", req.getSymbol()));

        // 1. Idempotency Check: Prevent duplicate order submission
        if (req.getClientOrderId() != null && !req.getClientOrderId().isBlank()) {
            Optional<PaperOrder> existingOrder = paperOrderRepository.findByAccountIdAndClientOrderId(
                    account.getId(), req.getClientOrderId().trim());
            if (existingOrder.isPresent()) {
                return toOrderResponse(existingOrder.get(), "Order previously submitted (idempotent replay).");
            }
        }

        TickerQuoteDto quote = marketDataService.getQuote(instrument.getSymbol());
        BigDecimal currentPrice = quote.getLtp();

        // 2. Synchronously execute Pre-Trade Risk Gatekeeper
        try {
            riskGatekeeper.validateOrder(user, account, req, currentPrice);
        } catch (Exception ex) {
            PaperOrder rejectedOrder = new PaperOrder();
            rejectedOrder.setAccount(account);
            rejectedOrder.setInstrument(instrument);
            rejectedOrder.setOrderType(req.getOrderType().toUpperCase());
            rejectedOrder.setSide(req.getSide().toUpperCase());
            rejectedOrder.setStatus("REJECTED");
            rejectedOrder.setQuantity(req.getQuantity());
            rejectedOrder.setLimitPrice(req.getLimitPrice());
            rejectedOrder.setStopLossPrice(req.getStopLoss());
            rejectedOrder.setTakeProfitPrice(req.getTakeProfit());
            rejectedOrder.setClientOrderId(req.getClientOrderId());
            rejectedOrder.setRejectionReason(ex.getMessage());
            paperOrderRepository.save(rejectedOrder);

            auditEventService.logEvent(userId, "ORDER_REJECTED_RISK",
                    String.format("Rejected %s %d %s: %s", req.getSide(), req.getQuantity(), instrument.getSymbol(), ex.getMessage()));

            throw ex;
        }

        String orderType = req.getOrderType().toUpperCase();
        String side = req.getSide().toUpperCase();
        BigDecimal slippageRate = account.getSlippageRate() != null ? account.getSlippageRate() : new BigDecimal("0.000500");
        BigDecimal feeRate = account.getFeeRate() != null ? account.getFeeRate() : new BigDecimal("0.000300");

        // 3. Handle Limit Order State Machine
        if ("LIMIT".equals(orderType)) {
            if (req.getLimitPrice() == null || req.getLimitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new TradeSphereException("Limit price must be greater than zero for LIMIT orders.");
            }

            boolean isMarketable = false;
            if ("BUY".equals(side) && quote.getAsk().compareTo(req.getLimitPrice()) <= 0) {
                isMarketable = true;
            } else if ("SELL".equals(side) && quote.getBid().compareTo(req.getLimitPrice()) >= 0) {
                isMarketable = true;
            }

            // If not immediately marketable, transition to OPEN state
            if (!isMarketable) {
                PaperOrder openOrder = new PaperOrder();
                openOrder.setAccount(account);
                openOrder.setInstrument(instrument);
                openOrder.setOrderType("LIMIT");
                openOrder.setSide(side);
                openOrder.setStatus("OPEN");
                openOrder.setQuantity(req.getQuantity());
                openOrder.setLimitPrice(req.getLimitPrice());
                openOrder.setStopLossPrice(req.getStopLoss());
                openOrder.setTakeProfitPrice(req.getTakeProfit());
                openOrder.setClientOrderId(req.getClientOrderId());
                PaperOrder savedOpen = paperOrderRepository.save(openOrder);

                auditEventService.logEvent(userId, "ORDER_OPENED_LIMIT",
                        String.format("Accepted LIMIT order #%d: %s %d %s @ %s (Current Market: %s)",
                                savedOpen.getId(), side, req.getQuantity(), instrument.getSymbol(), req.getLimitPrice(), currentPrice));

                return toOrderResponse(savedOpen, "Limit order placed and currently OPEN in order book.");
            }
        }

        // 4. Fill Order (Market order or marketable Limit order)
        return executeFill(userId, account, instrument, quote, req, slippageRate, feeRate);
    }

    private OrderResponse executeFill(
            Long userId,
            PaperAccount account,
            Instrument instrument,
            TickerQuoteDto quote,
            OrderRequest req,
            BigDecimal slippageRate,
            BigDecimal feeRate) {

        String side = req.getSide().toUpperCase();
        int quantity = req.getQuantity();
        BigDecimal limitPrice = req.getLimitPrice();

        BigDecimal rawPrice;
        BigDecimal executionPrice;
        BigDecimal slippageAmount = BigDecimal.ZERO;

        if ("BUY".equals(side)) {
            rawPrice = quote.getAsk();
            BigDecimal slippage = rawPrice.multiply(slippageRate).setScale(4, RoundingMode.HALF_UP);
            executionPrice = rawPrice.add(slippage);

            // Invariant: Limit order fills must obey the specified limit
            if ("LIMIT".equalsIgnoreCase(req.getOrderType()) && limitPrice != null) {
                executionPrice = executionPrice.min(limitPrice);
            }
            slippageAmount = executionPrice.subtract(rawPrice).abs().setScale(4, RoundingMode.HALF_UP);

            BigDecimal tradeTotal = executionPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal feeAmount = tradeTotal.multiply(feeRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalRequiredFunds = tradeTotal.add(feeAmount);

            // Sufficient funds validation
            if (account.getCurrentCash().compareTo(totalRequiredFunds) < 0) {
                throw new TradeSphereException(String.format(
                        "INSUFFICIENT_FUNDS: Available cash is %s %s, but required capital is %s %s (including simulated fee of %s).",
                        account.getCurrency(), account.getCurrentCash().setScale(2, RoundingMode.HALF_UP),
                        account.getCurrency(), totalRequiredFunds.setScale(2, RoundingMode.HALF_UP), feeAmount));
            }

            // Save Order
            PaperOrder order = new PaperOrder();
            order.setAccount(account);
            order.setInstrument(instrument);
            order.setOrderType(req.getOrderType().toUpperCase());
            order.setSide(side);
            order.setStatus("FILLED");
            order.setQuantity(quantity);
            order.setLimitPrice(limitPrice);
            order.setStopLossPrice(req.getStopLoss());
            order.setTakeProfitPrice(req.getTakeProfit());
            order.setExecutedPrice(executionPrice.setScale(2, RoundingMode.HALF_UP));
            order.setFeeAmount(feeAmount);
            order.setSlippageAmount(slippageAmount);
            order.setClientOrderId(req.getClientOrderId());
            PaperOrder savedOrder = paperOrderRepository.save(order);

            // Transactional Cash Updates
            account.setCurrentCash(account.getCurrentCash().subtract(totalRequiredFunds));
            paperAccountRepository.save(account);

            // Cash Ledger: Trade Debit
            CashLedgerEntry tradeDebit = new CashLedgerEntry(
                    account,
                    "TRADE_DEBIT",
                    tradeTotal.negate(),
                    account.getCurrentCash().add(feeAmount),
                    "ORD_" + savedOrder.getId(),
                    String.format("Bought %d %s @ %s", quantity, instrument.getSymbol(), executionPrice.setScale(2, RoundingMode.HALF_UP))
            );
            ledgerRepository.save(tradeDebit);

            // Cash Ledger: Simulated Brokerage Fee
            if (feeAmount.compareTo(BigDecimal.ZERO) > 0) {
                CashLedgerEntry feeDebit = new CashLedgerEntry(
                        account,
                        "COMMISSION_FEE",
                        feeAmount.negate(),
                        account.getCurrentCash(),
                        "FEE_ORD_" + savedOrder.getId(),
                        String.format("Simulated commission on order #%d (%s%% fee rate)", savedOrder.getId(), feeRate.multiply(BigDecimal.valueOf(100)))
                );
                ledgerRepository.save(feeDebit);
            }

            // Trade Record
            PaperTrade trade = new PaperTrade();
            trade.setAccount(account);
            trade.setOrder(savedOrder);
            trade.setInstrument(instrument);
            trade.setSide(side);
            trade.setQuantity(quantity);
            trade.setPrice(executionPrice.setScale(2, RoundingMode.HALF_UP));
            trade.setFeeAmount(feeAmount);
            paperTradeRepository.save(trade);

            // Position Tracking
            Optional<Position> optPos = positionRepository.findByAccountIdAndInstrumentId(account.getId(), instrument.getId());
            Position position;
            if (optPos.isPresent()) {
                position = optPos.get();
                int newQty = position.getQuantity() + quantity;
                BigDecimal totalSpent = (position.getEntryPrice().multiply(BigDecimal.valueOf(position.getQuantity())))
                        .add(executionPrice.multiply(BigDecimal.valueOf(quantity)));
                BigDecimal avgPrice = totalSpent.divide(BigDecimal.valueOf(newQty), 4, RoundingMode.HALF_UP);
                position.setQuantity(newQty);
                position.setEntryPrice(avgPrice);
                position.setCurrentPrice(quote.getLtp());
                position.setStopLossPrice(req.getStopLoss());
                position.setTakeProfitPrice(req.getTakeProfit());
                position.setUpdatedAt(Instant.now());
            } else {
                position = new Position();
                position.setAccount(account);
                position.setInstrument(instrument);
                position.setSide("BUY");
                position.setQuantity(quantity);
                position.setEntryPrice(executionPrice.setScale(4, RoundingMode.HALF_UP));
                position.setCurrentPrice(quote.getLtp());
                position.setStopLossPrice(req.getStopLoss());
                position.setTakeProfitPrice(req.getTakeProfit());
            }
            positionRepository.save(position);

            auditEventService.logEvent(userId, "ORDER_FILLED",
                    String.format("Executed BUY %d %s @ %s (Fee: %s, Slippage: %s)",
                            quantity, instrument.getSymbol(), executionPrice.setScale(2, RoundingMode.HALF_UP), feeAmount, slippageAmount));

            return toOrderResponse(savedOrder, "Order executed and filled successfully.");

        } else {
            // SELL Side Execution
            rawPrice = quote.getBid();
            BigDecimal slippage = rawPrice.multiply(slippageRate).setScale(4, RoundingMode.HALF_UP);
            executionPrice = rawPrice.subtract(slippage);

            // Invariant: Limit order fills must obey the specified limit
            if ("LIMIT".equalsIgnoreCase(req.getOrderType()) && limitPrice != null) {
                executionPrice = executionPrice.max(limitPrice);
            }
            slippageAmount = rawPrice.subtract(executionPrice).abs().setScale(4, RoundingMode.HALF_UP);

            // Position validation: User must own sufficient shares
            Position position = positionRepository.findByAccountIdAndInstrumentId(account.getId(), instrument.getId())
                    .orElseThrow(() -> new TradeSphereException("INSUFFICIENT_POSITION: You hold 0 shares of " + instrument.getSymbol() + ". Cannot execute SELL."));

            if (position.getQuantity() < quantity) {
                throw new TradeSphereException(String.format(
                        "INSUFFICIENT_POSITION: Owned position is %d shares of %s, but order requested to sell %d shares.",
                        position.getQuantity(), instrument.getSymbol(), quantity));
            }

            BigDecimal grossProceeds = executionPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal feeAmount = grossProceeds.multiply(feeRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal netProceeds = grossProceeds.subtract(feeAmount);

            BigDecimal costBasis = position.getEntryPrice().multiply(BigDecimal.valueOf(quantity));
            BigDecimal realizedPnl = grossProceeds.subtract(costBasis).setScale(2, RoundingMode.HALF_UP);

            // Save Order
            PaperOrder order = new PaperOrder();
            order.setAccount(account);
            order.setInstrument(instrument);
            order.setOrderType(req.getOrderType().toUpperCase());
            order.setSide(side);
            order.setStatus("FILLED");
            order.setQuantity(quantity);
            order.setLimitPrice(limitPrice);
            order.setExecutedPrice(executionPrice.setScale(2, RoundingMode.HALF_UP));
            order.setFeeAmount(feeAmount);
            order.setSlippageAmount(slippageAmount);
            order.setClientOrderId(req.getClientOrderId());
            PaperOrder savedOrder = paperOrderRepository.save(order);

            // Update Cash
            account.setCurrentCash(account.getCurrentCash().add(netProceeds));
            account.setDailyRealizedPnl(account.getDailyRealizedPnl().add(realizedPnl));
            paperAccountRepository.save(account);

            // Cash Ledger: Trade Credit
            CashLedgerEntry creditEntry = new CashLedgerEntry(
                    account,
                    "TRADE_CREDIT",
                    grossProceeds,
                    account.getCurrentCash().add(feeAmount),
                    "ORD_" + savedOrder.getId(),
                    String.format("Sold %d %s @ %s (PnL: %s)", quantity, instrument.getSymbol(), executionPrice.setScale(2, RoundingMode.HALF_UP), realizedPnl)
            );
            ledgerRepository.save(creditEntry);

            // Cash Ledger: Simulated Brokerage Fee
            if (feeAmount.compareTo(BigDecimal.ZERO) > 0) {
                CashLedgerEntry feeDebit = new CashLedgerEntry(
                        account,
                        "COMMISSION_FEE",
                        feeAmount.negate(),
                        account.getCurrentCash(),
                        "FEE_ORD_" + savedOrder.getId(),
                        String.format("Simulated commission on sell order #%d", savedOrder.getId())
                );
                ledgerRepository.save(feeDebit);
            }

            // Trade Record
            PaperTrade trade = new PaperTrade();
            trade.setAccount(account);
            trade.setOrder(savedOrder);
            trade.setInstrument(instrument);
            trade.setSide(side);
            trade.setQuantity(quantity);
            trade.setPrice(executionPrice.setScale(2, RoundingMode.HALF_UP));
            trade.setRealizedPnl(realizedPnl);
            trade.setFeeAmount(feeAmount);
            trade.setExitReason("SELL_ORDER");
            paperTradeRepository.save(trade);

            // Position Tracking: Decrement or delete
            int remainingQty = position.getQuantity() - quantity;
            if (remainingQty > 0) {
                position.setQuantity(remainingQty);
                position.setCurrentPrice(quote.getLtp());
                position.setUpdatedAt(Instant.now());
                positionRepository.save(position);
            } else {
                positionRepository.delete(position);
            }

            auditEventService.logEvent(userId, "ORDER_FILLED",
                    String.format("Executed SELL %d %s @ %s (Realized PnL: %s, Fee: %s)",
                            quantity, instrument.getSymbol(), executionPrice.setScale(2, RoundingMode.HALF_UP), realizedPnl, feeAmount));

            return toOrderResponse(savedOrder, String.format("Sell executed. Realized PnL: %s.", realizedPnl));
        }
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        PaperOrder order = paperOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperOrder", "id", orderId));

        // Ownership validation
        if (!order.getAccount().getId().equals(account.getId())) {
            throw new ResourceNotFoundException("PaperOrder", "id", orderId);
        }

        // Invariant: Never cancel an order that is already filled, cancelled, or rejected
        if (!"OPEN".equalsIgnoreCase(order.getStatus()) && !"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new TradeSphereException(String.format("Cannot cancel order #%d because status is already %s.", orderId, order.getStatus()));
        }

        order.setStatus("CANCELLED");
        order.setRejectionReason("Cancelled by user.");
        order.setUpdatedAt(Instant.now());
        PaperOrder saved = paperOrderRepository.save(order);

        auditEventService.logEvent(userId, "ORDER_CANCELLED",
                String.format("User cancelled open order #%d (%s %d %s)", orderId, order.getSide(), order.getQuantity(), order.getInstrument().getSymbol()));

        return toOrderResponse(saved, "Order cancelled successfully.");
    }

    @Transactional
    public List<OrderResponse> matchOpenOrders(Long userId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        List<PaperOrder> openOrders = paperOrderRepository.findByAccountIdAndStatusOrderByCreatedAtDesc(account.getId(), "OPEN");
        List<OrderResponse> filledResponses = new ArrayList<>();

        for (PaperOrder order : openOrders) {
            // Invariant: Never fill a cancelled order!
            if ("CANCELLED".equalsIgnoreCase(order.getStatus()) || "FILLED".equalsIgnoreCase(order.getStatus())) {
                continue;
            }

            TickerQuoteDto quote = marketDataService.getQuote(order.getInstrument().getSymbol());
            boolean canFill = false;

            if ("BUY".equalsIgnoreCase(order.getSide()) && quote.getAsk().compareTo(order.getLimitPrice()) <= 0) {
                canFill = true;
            } else if ("SELL".equalsIgnoreCase(order.getSide()) && quote.getBid().compareTo(order.getLimitPrice()) >= 0) {
                canFill = true;
            }

            if (canFill) {
                OrderRequest req = new OrderRequest();
                req.setSymbol(order.getInstrument().getSymbol());
                req.setSide(order.getSide());
                req.setOrderType("LIMIT");
                req.setQuantity(order.getQuantity());
                req.setLimitPrice(order.getLimitPrice());
                req.setStopLoss(order.getStopLossPrice());
                req.setTakeProfit(order.getTakeProfitPrice());
                req.setClientOrderId(order.getClientOrderId());

                try {
                    BigDecimal slippageRate = account.getSlippageRate() != null ? account.getSlippageRate() : new BigDecimal("0.000500");
                    BigDecimal feeRate = account.getFeeRate() != null ? account.getFeeRate() : new BigDecimal("0.000300");

                    // Delete or mark original OPEN order to avoid duplicate
                    order.setStatus("FILLED");
                    paperOrderRepository.save(order);

                    OrderResponse res = executeFill(userId, account, order.getInstrument(), quote, req, slippageRate, feeRate);
                    filledResponses.add(res);
                } catch (Exception ex) {
                    order.setStatus("OPEN"); // Revert if fill failed due to funds/position
                    paperOrderRepository.save(order);
                }
            }
        }
        return filledResponses;
    }

    @Transactional
    public PositionDto closePosition(Long userId, String symbol) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        Instrument instrument = instrumentRepository.findBySymbolIgnoreCase(symbol.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument", "symbol", symbol));

        Position position = positionRepository.findByAccountIdAndInstrumentId(account.getId(), instrument.getId())
                .orElseThrow(() -> new TradeSphereException("No open position found for symbol: " + symbol));

        TickerQuoteDto quote = marketDataService.getQuote(instrument.getSymbol());
        BigDecimal exitPrice = quote.getBid();
        BigDecimal proceeds = exitPrice.multiply(BigDecimal.valueOf(position.getQuantity()));

        BigDecimal costBasis = position.getEntryPrice().multiply(BigDecimal.valueOf(position.getQuantity()));
        BigDecimal realizedPnl = proceeds.subtract(costBasis).setScale(2, RoundingMode.HALF_UP);

        BigDecimal rMultiple = BigDecimal.ZERO;
        if (position.getStopLossPrice() != null) {
            BigDecimal riskPerShare = position.getEntryPrice().subtract(position.getStopLossPrice()).abs();
            if (riskPerShare.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal totalRisk = riskPerShare.multiply(BigDecimal.valueOf(position.getQuantity()));
                rMultiple = realizedPnl.divide(totalRisk, 2, RoundingMode.HALF_UP);
            }
        }

        account.setCurrentCash(account.getCurrentCash().add(proceeds));
        account.setDailyRealizedPnl(account.getDailyRealizedPnl().add(realizedPnl));
        account.setUpdatedAt(Instant.now());
        paperAccountRepository.save(account);

        CashLedgerEntry ledger = new CashLedgerEntry(
                account,
                "TRADE_CREDIT",
                proceeds,
                account.getCurrentCash(),
                "CLOSE_" + position.getId(),
                String.format("Closed position %d %s @ %s (PnL: %s)", position.getQuantity(), instrument.getSymbol(), exitPrice, realizedPnl)
        );
        ledgerRepository.save(ledger);

        PaperTrade closeTrade = new PaperTrade();
        closeTrade.setAccount(account);
        closeTrade.setInstrument(instrument);
        closeTrade.setSide("SELL");
        closeTrade.setQuantity(position.getQuantity());
        closeTrade.setPrice(exitPrice);
        closeTrade.setRealizedPnl(realizedPnl);
        closeTrade.setRMultiple(rMultiple);
        closeTrade.setExitReason("MANUAL_USER_CLOSE");
        paperTradeRepository.save(closeTrade);

        PositionDto closedSnapshot = toPositionDto(position, exitPrice);
        positionRepository.delete(position);

        auditEventService.logEvent(userId, "POSITION_CLOSED",
                String.format("Closed %s: realizedPnL=%s, R-multiple=%sR", instrument.getSymbol(), realizedPnl, rMultiple));

        return closedSnapshot;
    }

    @Transactional(readOnly = true)
    public List<PositionDto> getPositions(Long userId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        return positionRepository.findByAccountId(account.getId()).stream()
                .map(p -> {
                    TickerQuoteDto quote = marketDataService.getQuote(p.getInstrument().getSymbol());
                    return toPositionDto(p, quote.getLtp());
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Long userId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        return paperOrderRepository.findByAccountIdOrderByCreatedAtDesc(account.getId()).stream()
                .map(o -> toOrderResponse(o, o.getRejectionReason()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TradeDto> getTrades(Long userId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        return paperTradeRepository.findByAccountIdOrderByExecutedAtDesc(account.getId()).stream()
                .map(this::toTradeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LedgerEntryDto> getLedger(Long userId) {
        PaperAccount account = paperAccountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("PaperAccount", "userId", userId));

        return ledgerRepository.findByAccountIdOrderByCreatedAtDesc(account.getId()).stream()
                .map(this::toLedgerDto)
                .collect(Collectors.toList());
    }

    private PositionDto toPositionDto(Position p, BigDecimal currentPrice) {
        PositionDto dto = new PositionDto();
        dto.setId(p.getId());
        dto.setSymbol(p.getInstrument().getSymbol());
        dto.setSide(p.getSide());
        dto.setQuantity(p.getQuantity());
        dto.setEntryPrice(p.getEntryPrice().setScale(2, RoundingMode.HALF_UP));
        dto.setCurrentPrice(currentPrice.setScale(2, RoundingMode.HALF_UP));

        BigDecimal diff = currentPrice.subtract(p.getEntryPrice());
        BigDecimal unrealized = diff.multiply(BigDecimal.valueOf(p.getQuantity())).setScale(2, RoundingMode.HALF_UP);
        BigDecimal unrealizedPct = diff.divide(p.getEntryPrice(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);

        dto.setUnrealizedPnL(unrealized);
        dto.setUnrealizedPnLPct(unrealizedPct);
        dto.setStopLoss(p.getStopLossPrice());
        dto.setTakeProfit(p.getTakeProfitPrice());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private OrderResponse toOrderResponse(PaperOrder o, String customMessage) {
        OrderResponse res = new OrderResponse();
        res.setId(o.getId());
        res.setClientOrderId(o.getClientOrderId());
        res.setSymbol(o.getInstrument().getSymbol());
        res.setSide(o.getSide());
        res.setOrderType(o.getOrderType());
        res.setStatus(o.getStatus());
        res.setQuantity(o.getQuantity());
        res.setLimitPrice(o.getLimitPrice());
        res.setStopLoss(o.getStopLossPrice());
        res.setTakeProfit(o.getTakeProfitPrice());
        res.setExecutedPrice(o.getExecutedPrice());
        res.setFeeAmount(o.getFeeAmount());
        res.setSlippageAmount(o.getSlippageAmount());
        res.setMessage(customMessage != null ? customMessage : o.getRejectionReason());
        res.setSimulated(true);
        res.setDisclaimer("PAPER TRADING – NO REAL MONEY");
        res.setCreatedAt(o.getCreatedAt());
        return res;
    }

    private TradeDto toTradeDto(PaperTrade t) {
        TradeDto dto = new TradeDto();
        dto.setId(t.getId());
        dto.setOrderId(t.getOrder() != null ? t.getOrder().getId() : null);
        dto.setSymbol(t.getInstrument().getSymbol());
        dto.setSide(t.getSide());
        dto.setQuantity(t.getQuantity());
        dto.setPrice(t.getPrice().setScale(2, RoundingMode.HALF_UP));
        dto.setRealizedPnL(t.getRealizedPnl());
        dto.setRMultiple(t.getRMultiple());
        dto.setExitReason(t.getExitReason());
        dto.setExecutedAt(t.getExecutedAt());
        return dto;
    }

    private LedgerEntryDto toLedgerDto(CashLedgerEntry l) {
        LedgerEntryDto dto = new LedgerEntryDto();
        dto.setId(l.getId());
        dto.setAccountId(l.getAccount().getId());
        dto.setEntryType(l.getEntryType());
        dto.setAmount(l.getAmount().setScale(2, RoundingMode.HALF_UP));
        dto.setBalanceAfter(l.getBalanceAfter().setScale(2, RoundingMode.HALF_UP));
        dto.setReferenceId(l.getReferenceId());
        dto.setDescription(l.getDescription());
        dto.setCreatedAt(l.getCreatedAt());
        return dto;
    }
}
