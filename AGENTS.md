# AGENTS.md — ApexTradeOS / TradeSphere AI Architecture & Safety Rules

## 1. Project Mission & Identity
**ApexTradeOS (TradeSphere AI)** is a 100% free, self-hosted, multi-tier trading research, analytics, and simulated execution platform built for Indian (NSE/BSE/NFO) and US (NASDAQ/NYSE) markets.

The platform is designed to serve traders across the full spectrum of experience using **Adaptive Progressive Complexity**:
1. **Tier 1 — Basic (Guided):** Clean charts, 20-EMA trend guide, automatic Support/Resistance zones, mandatory Stop-Loss, automatic 1% account-risk position sizer, and plain-English AI coach guidance.
2. **Tier 2 — Active Trader:** Multi-timeframe candlesticks, VWAP, Bollinger Bands, RSI(14), dual-market watchlists, Bracket OCO (One-Cancels-the-Other) orders, and automated trade journaling.
3. **Tier 3 — Pro Quant:** 20-level Depth of Market (DOM) order book ladder, Black-Scholes Options Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$), vectorized strategy backtester, and institutional-grade risk controls.

---

## 2. Architectural Invariants (Non-Negotiable Rules)

### Rule A: The Pre-Trade Risk Gatekeeper Invariant
**No order shall ever be executed without passing the synchronous Pre-Trade Risk Gatekeeper.**
- **Single-Trade Max Loss Cap:** $\text{abs}(\text{Entry} - \text{StopLoss}) \times \text{Qty} \le \text{User Max Risk \% of Equity}$ (default 1.0%).
- **Daily Drawdown Circuit Breaker:** If realized + unrealized daily drawdown hits 3.0% of starting equity, all new opening orders are locked for the remainder of the session.
- **Mandatory Hard Stop-Loss:** In Basic and Active tiers, orders cannot be placed without a hard Stop-Loss price attached.
- **Bracket OCO State Machine:** When a bracket order fills, the Take-Profit and Stop-Loss child legs are actively monitored; when one triggers, the counter-leg is immediately canceled.

### Rule B: Market Data & Execution Decoupling
- **Zero UI Lag:** High-frequency WebSocket ticks stream directly into transient state stores (e.g. Zustand transient listeners or Canvas drawing loops) without triggering re-renders of the entire React component hierarchy.
- **24/7 Zero-Key Fallback:** The system must include a realistic Geometric Brownian Motion (GBM) + ATR tick and 20-depth DOM simulator that runs automatically if exchange feeds are offline or no API credentials are provided.
- **Data Integrity:** Synthetic development data must always be clearly distinguished and labeled from live exchange data.

### Rule C: Progressive Complexity UI Boundaries
- Components must cleanly adapt according to the selected mode (`basic`, `active`, `pro`).
- Complex widgets (20-depth DOM, Options Chain Greeks, Backtester) are hidden by default in Basic Mode to prevent cognitive overload for novice traders.

### Rule D: Financial Calculation Exactness
- All price calculations, PnL, position sizing, margin, and Black-Scholes Greeks must use IEEE double-precision mathematics or fixed-decimal equivalents with zero rounding errors.
- Options Greeks must accurately calculate:
  - $\Delta$ (Delta), $\Gamma$ (Gamma), $\Theta$ (Theta), $\nu$ (Vega), and Implied Volatility (IV via Newton-Raphson).

---

## 3. Directory Layout
```text
TR AI/
├── AGENTS.md                  # This file
├── docs/                      # Complete specifications
│   ├── PRD.md                 # Product Requirements Document
│   ├── ARCHITECTURE.md        # Architecture & Data Workflows
│   ├── DATABASE.md            # Schema, Entities & Tables
│   ├── API_SPEC.md            # REST & WebSocket API Specs
│   ├── USER_FLOWS.md          # User Journeys & State Machines
│   ├── UI_SPEC.md             # UI Design & Component Specifications
│   ├── SECURITY.md            # Security, Risk & Guardrail Policies
│   └── ROADMAP.md             # Development Phases & Milestones
├── backend/                   # Node.js / FastAPI Service Layer
│   ├── src/
│   │   ├── market_data/       # WebSocket Feed & Realistic GBM Simulator
│   │   ├── oms/               # Risk Gatekeeper & Paper Trading Engine
│   │   ├── quant/             # Candle Builder, Greeks & Backtester
│   │   └── coach/             # Deterministic AI Risk Coach
│   └── server.js              # High-performance API & WebSocket Server
└── frontend/                  # Next.js 15 / React Trading Terminal
    ├── src/
    │   ├── components/        # Watchlist, Chart, Ticket, DOM, Greeks, Backtester
    │   ├── store/             # Zustand state management
    │   └── styles/            # Tailwind theme
    └── package.json
```
