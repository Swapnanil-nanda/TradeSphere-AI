# Product Requirements Document (PRD) — ApexTradeOS / TradeSphere AI

## 1. Executive Summary
**ApexTradeOS (TradeSphere AI)** is a high-performance, responsive, web-based market analytics, research, and paper-trading terminal. It delivers an institutional-grade trading workflow on a 100% free, local-first budget, supporting Indian markets (NSE/BSE/NFO: Nifty 50, BankNifty, Bluechips) and US markets (NASDAQ/NYSE).

## 2. Target Personas
1. **The Novice Trader (Tier 1: Basic Guided):** Needs clear trend signals, automated position sizing (1% risk rule), mandatory stop-loss protection, and plain-English market structure summaries from an AI coach.
2. **The Active Momentum/Swing Trader (Tier 2: Active):** Needs fast multi-timeframe candlestick charting, VWAP, Bollinger Bands, RSI(14), Bracket OCO orders, quick symbol switching, and automated trade journaling.
3. **The Quant / Professional Trader (Tier 3: Pro Quant):** Requires 20-level Level 2 Depth of Market (DOM) ladders, full Options Chain with Black-Scholes Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$), algorithmic strategy backtesting, and institutional risk metrics (Sharpe, Sortino, Max Drawdown).

## 3. Core Functional Requirements

### 3.1 Adaptive 3-Tier Mode Switching
- Global mode switcher pinned in the top navigation header: `Basic (Guided)`, `Active Trader`, and `Pro Quant`.
- Switching tiers instantly adjusts layout complexity without reloading the page or dropping WebSocket connections.

### 3.2 Real-Time Multi-Market Watchlist
- Markets: India NSE (RELIANCE, TCS, INFY, HDFCBANK, TATAMOTORS, NIFTY50) and US Tech (AAPL, TSLA, NVDA, MSFT).
- Real-time green/red price flash animations on every price update.
- Metrics: Last Traded Price (LTP), Change ($/₹), Change (%), Day High/Low, and Volume.

### 3.3 High-Performance Charting Engine
- Interactive candlestick charts rendered via HTML5 canvas / TradingView Lightweight Charts.
- Multi-timeframe bar aggregation: 1m, 5m, 15m, 1D.
- Technical overlays: 20-period Exponential Moving Average (EMA-20), Volume Weighted Average Price (VWAP), Bollinger Bands (20, 2), and dynamic Support/Resistance price zones.

### 3.4 Smart Order Ticket & Pre-Trade Risk Gatekeeper
- Order types: Market, Limit, and Bracket OCO (One-Cancels-the-Other with Take-Profit & Stop-Loss legs).
- **1% Risk Auto-Sizer:** One-click calculator:
  $$\text{Quantity} = \left\lfloor \frac{\text{Account Equity} \times \text{Risk \%}}{|\text{Entry Price} - \text{Stop-Loss Price}|} \right\rfloor$$
- **Pre-Trade Guardrails:** Synchronous validation before fill:
  1. Risk $\le$ Configured Cap (default 1.0% of Net Liquidation).
  2. Reward-to-Risk Ratio $\ge 1.5R$.
  3. Daily Drawdown Circuit Breaker: Trading locked if daily loss $\ge 3.0\%$.
  4. Mandatory Stop-Loss enforcement.

### 3.5 Level 2 20-Depth Market Order Book (DOM)
- Visual order book ladder displaying 20 bid levels and 20 ask levels with cumulative depth bars and spread display.

### 3.6 Options Chain & Black-Scholes Greeks Engine
- Real-time options matrix across strikes.
- Call and Put metrics: Strike, LTP, Bid, Ask, Implied Volatility (IV via Newton-Raphson), Delta ($\Delta$), Gamma ($\Gamma$), Theta ($\Theta$), and Vega ($\nu$).

### 3.7 Vectorized Strategy Backtester
- Built-in quantitative backtesting engine:
  - Strategy 1: EMA Crossover (Fast EMA 9 / Slow EMA 21) + ATR Trailing Stop.
  - Strategy 2: RSI Mean Reversion (Oversold < 30, Overbought > 70).
  - Strategy 3: Opening Range VWAP Breakout.
- Performance Report: Net Return %, Sharpe Ratio, Sortino Ratio, Win Rate %, Total Trades, Max Drawdown %, and interactive Equity Curve.

### 3.8 AI Risk Coach & Journal
- Contextual analysis of active chart indicators (EMA20, RSI, ATR) delivering plain-English market structure insights.
- Post-trade audit detecting emotional behavior (revenge trading, stop widening, early exits).

### 3.9 Paper Trading Engine & Ledger
- Default initial cash: ₹10,00,000 / $100,000.
- Real-time order execution matching against live bid/ask spreads with realistic slippage.
- Portfolio blotter: Open Positions, Unrealized PnL, Realized PnL, and Cash Ledger.
