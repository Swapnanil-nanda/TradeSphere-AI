# Implementation Roadmap — ApexTradeOS / TradeSphere AI

## Phase 1: Specifications, Architecture & Monorepo Foundation [COMPLETED]
- [x] Analyze institutional & student-budget requirements from user specifications.
- [x] Lock in `AGENTS.md` architectural invariants and pre-trade risk gatekeeper rules.
- [x] Establish comprehensive documentation suite (`PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API_SPEC.md`, `USER_FLOWS.md`, `ROADMAP.md`).

## Phase 2: Core Backend Engine & 24/7 Market Microstructure Simulator [IN PROGRESS]
- [x] High-performance Node.js / FastAPI HTTP & WebSocket multiplexer server (`/ws/ticks`).
- [x] 24/7 Geometric Brownian Motion & 20-level Level 2 DOM order book generator for Indian (NSE) & US (NASDAQ) tickers.
- [x] Pre-Trade Risk Gatekeeper (1% single-trade risk, 3% daily drawdown breaker, buying power).
- [x] Paper Trading Engine & Order Management System with Bracket OCO state machine.
- [x] Local Candle Aggregator (1m, 5m, 15m, 1D) with EMA20, VWAP, Bollinger Bands, RSI(14), and ATR(14).
- [x] Black-Scholes Options Greeks Engine (IV Newton-Raphson, Delta, Gamma, Theta, Vega).
- [x] Vectorized Strategy Backtester (EMA Crossover, RSI Mean Reversion, VWAP Breakout).
- [x] Contextual AI Risk Coach API (`/api/coach`).

## Phase 3: Adaptive 3-Tier Frontend Terminal
- [x] Next.js 15 / React Trading Terminal with dark institutional styling.
- [x] Mode Switcher: Basic (Guided), Active Trader, and Pro Quant.
- [x] Multi-Market Watchlist with real-time green/red price flash animations.
- [x] Interactive Candlestick Chart with technical overlays (EMA20, VWAP, Support/Resistance).
- [x] Smart Order Ticket with 1% Risk Auto-Sizer and R:R calculator.
- [x] Level 2 20-Depth Order Book (DOM) ladder.
- [x] Options Chain matrix with Greeks.
- [x] Strategy Backtest runner & Equity Curve visualizer.
- [x] Positions, Orders, Trade Journal blotter & AI Coach panel.

## Phase 4: Full-Stack Integration, Automated Verification & One-Click Runner
- [x] End-to-end verification of WebSocket streaming, risk rejection, order filling, and backtesting.
- [x] Create root launch script for seamless 1-command startup.
