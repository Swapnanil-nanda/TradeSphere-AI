# Product Requirements Document (PRD) — TradeSphere AI
## Institutional India-First Trading, Quantitative Research & Wealth Management Platform

**Document Version:** 2.0.0-PROD  
**Author:** Principal FinTech Software Architect & Quantitative Systems Engineer  
**Date:** October 31, 2026  
**Status:** Approved for Implementation Planning  
**Target Repositories:**
- Main Repository: `https://github.com/Swapnanil-nanda/TradeSphere-AI`
- Reference Repository: `https://github.com/SanikaHarne/MultiAgent-Quantitative-Investment-System`
- Live Deployment: `https://trade-sphere-ai-blush.vercel.app/terminal`

---

## 1. Executive Vision & Problem Statement

### 1.1 The Market Gap in Indian FinTech
Retail and semi-professional traders in India (NSE/BSE/NFO) are caught between two inadequate extremes:
1. **Discount Retail Brokerages (e.g. Zerodha Kite, Groww, Angel One):** Excellent execution and clean UX, but lacking institutional quantitative tools, multi-agent AI research, Monte Carlo risk simulation, and automated trade journaling with psychological tilt audits.
2. **Institutional Terminals (e.g. Bloomberg, FactSet):** Prohibitively expensive ($24,000+/year) with proprietary closed-source infrastructure unsuitable for Indian students, self-directed quants, and emerging prop desks.

### 1.2 The TradeSphere Solution
TradeSphere AI is a 100% free, self-hosted, modular financial trading, quantitative research, and wealth planning platform engineered specifically for Indian equities, derivatives, mutual funds, and dual-market NASDAQ/NYSE tickers. It unites:
- A high-speed, local-first paper-trading execution engine with strict pre-trade risk controls.
- A 7-agent quantitative research federation featuring autonomous evidence verification.
- Modern Portfolio Theory (MPT) asset allocation, Monte Carlo path-drawdown simulations, and dynamic Systematic Investment Planning (SIP).
- An institutional dark theme engineered for high information density, zero cognitive fatigue, and distraction-free decision making.

---

## 2. Core User Personas

| Persona | Archetype | Primary Needs | Critical System Invariants |
| :--- | :--- | :--- | :--- |
| **Persona 1: The Guided Novice** | Student / First-time investor | Jargon-free guidance, 1% risk position sizing, automatic Stop-Loss enforcement, plain-English research summaries, SIP planning. | Mandatory Stop-Loss, auto-sizer returns 0 on risk breach, educational popups, risk disclosures. |
| **Persona 2: The Active Intraday Trader** | Derivatives & equity scalper | Sub-second tick streaming, 20-level DOM ladder, bracket OCO orders, fast keyboard hotkeys, automated behavioral trade journaling. | Sub-150ms WebSocket latency, zero UI thread freezing, idempotent order routing. |
| **Persona 3: The Quantitative Researcher** | Prop-trader / FinTech engineer | Multi-agent research federation, historical analogue pattern discovery, vectorized backtesting, Black-Scholes Greeks, PDF dossiers. | Read-only research engine, explicit methodology versioning, reproducibility parameters. |
| **Persona 4: The Long-Term Wealth Builder** | Salaried long-term investor | Markowitz Efficient Frontier, Goal-based scenario modeling, inflation-adjusted step-up SIPs, mutual fund screening. | Exact compound interest mathematics, non-guarantee disclosures, one-sided VaR/CVaR. |

---

## 3. Scope of 33 Unified Product Features

### Module 1: Overview & Trading Execution
1. **Overview Dashboard:** Consolidated portfolio health monitor, market breadth (NSE Adv/Dec), active risk allocation gauges, recent trade blotters, and quick actions.
2. **Professional Trading Terminal:** High-density institutional trading desk with multi-timeframe charts, integrated DOM, quick ticket, and contextual risk coach.
3. **Market Explorer:** Dual-market screener and ticker explorer across NSE (`RELIANCE`, `NIFTY50`, `TCS`, `INFY`, `HDFCBANK`, `TATAMOTORS`) and US markets (`AAPL`, `TSLA`, `NVDA`, `MSFT`).
4. **Stock Screener:** Multi-variable quantitative filter (market cap, P/E, RSI, 20-EMA distance, ATR, 52-week High/Low).
5. **Paper Trading:** Deterministic virtual order execution supporting `MARKET`, `LIMIT`, and `BRACKET` OCO orders with simulated slippage and exchange fees (STT, GST, SEBI turnover).
6. **Portfolio Management:** Mark-to-market position aggregation, average cost tracking, realized/unrealized PnL, cash balance, and margin utilization.
7. **Options Chain:** Multi-strike matrix (11 strikes) for NIFTY50 and large-caps displaying Call/Put LTP, Bid/Ask, IV, OI, Volume, and Greeks.
8. **Black-Scholes Pricing:** European option pricing model with exact analytical formulation for Call/Put valuation.
9. **Options Greeks:** Real-time computation of first- and second-order Greeks ($\Delta, \Gamma, \Theta, \nu, \rho$).
10. **Implied Volatility (IV) Analysis:** Numerical Newton-Raphson IV solver with volatility smile/skew visualization and historical percentile rank.
11. **Simulated 20-Level DOM:** Microstructure depth of market ladder visualizing 20 levels of simulated bid/ask liquidity, order queuing, and spread dynamics.
12. **Customisable Workspaces:** Multi-layout windowing supporting modular docks, full-screen chart modes, and adaptive progressive complexity (Basic/Active/Pro).

### Module 2: Research & Market Intelligence
13. **Technical Analysis:** Interactive charting enriched with 8 reference indicators: SMA, EMA, RSI(14), MACD(12,26,9), Bollinger Bands(20,2), ATR(14), VWAP, Supertrend(10,3).
14. **Fundamental Analysis:** Comprehensive equity balance sheets, quarterly P&L trends, ROE, Debt/Equity, operating margins, and promoter holdings.
15. **Financial News & Sentiment:** VADER-based compound NLP sentiment scoring of financial headlines, categorized as Bullish, Bearish, or Neutral with entity tagging.
16. **Seven-Agent Research Command Center:** Unified multi-agent intelligence orchestrator routing complex research queries to specialist agents with synthesis and verification.
17. **AI Forecasting:** Calibrated multi-horizon probabilistic price returns (5d, 10d, 20d) with 95% confidence intervals and volatility regime adjustments.
18. **Historical Similarity Analysis:** Normalized Euclidean and Cosine distance scanning engine matching current price trajectories against historical market cycles.
19. **Saved Research Runs:** Persistent research repository storing multi-agent outputs, backtest runs, and optimization models for later retrieval and comparison.
20. **PDF/JSON Research Reports:** ReportLab-driven institutional PDF export engine generating publication-grade dossiers with audit stamps and regulatory disclosures.

### Module 3: Quantitative Strategy Lab & Backtesting
21. **Quantitative Strategy Lab:** Strategy configuration laboratory parameterizing rule-based algorithmic trading models with position sizing limits.
22. **Historical Backtesting:** Vectorized historical execution engine computing Sharpe ratio, Sortino ratio, maximum drawdown %, Calmar ratio, win rate %, profit factor, trade log, and equity curves.

### Module 4: Wealth Management & Asset Allocation
23. **Markowitz Portfolio Optimizer:** Quadratic programming solver computing optimal multi-asset weights according to Modern Portfolio Theory (MPT).
24. **Maximum Sharpe Portfolio:** Tangency portfolio optimization maximizing excess return per unit of volatility relative to the risk-free rate.
25. **Global Minimum Variance Portfolio:** Conservative portfolio optimization minimizing total asset covariance regardless of target returns.
26. **Efficient Frontier:** Risk-return hyper-surface mapping 20+ efficient asset allocations with dynamic frontier point inspection.
27. **Mutual Fund Research:** Curated Indian mutual fund database across Large Cap, Flexi Cap, Mid Cap, and Liquid funds with expense ratios, AUM, and 1Y/3Y/5Y CAGRs.
28. **SIP Planner:** Compound wealth calculation engine supporting regular and annual step-up SIPs, inflation adjustments, and year-by-year schedules.
29. **Monte Carlo Wealth Simulation:** Stochastic path-based wealth simulation capturing empirical peak-to-trough path drawdowns for retirement and goal planning.

### Module 5: Risk Governance & Behavioral Analytics
30. **Portfolio Risk Centre:** Centralized risk management console displaying Value at Risk (95% & 99% one-sided VaR), CVaR (Expected Shortfall), beta sensitivity, and circuit breaker status.
31. **Trade Journal:** Automated post-trade behavioral logging capturing entry/exit rationale, R:R multiples, setup categories, and emotional state tags.
32. **AI Tilt Auditor:** Rule-based behavioral diagnostic engine analyzing trading frequency, revenge trading patterns, stop-loss moving violations, and discipline scores.
33. **Learning Academy:** Interactive educational portal providing structured trading modules across beginner fundamentals, risk management, and quantitative strategy design.

---

## 4. Canonical System Architecture & Backend Decoupling

The platform mandates a non-overlapping, multi-tier microservice architecture:

```
[ Next.js 14/15 Frontend Terminal (:3000) ]
        |
        +-----> [ Java 21 Spring Boot Authoritative OMS (:8080) ]
        |             |
        |             +-----> [ PostgreSQL 18 with Flyway Migrations ]
        |
        +-----> [ Node.js Market Microstructure Engine (:8000) ]
        |             |
        |             +-----> [ WebSocket /ws/ticks & Level 2 DOM ]
        |
        +-----> [ Python FastAPI Quantitative Engine (:8100) ]
                      |
                      +-----> [ 7 Research Agents & Evidence Verification ]
```

### Architectural Ownership Invariants:
1. **Spring Boot (:8080) Sole Authority:** Spring Boot is the sole system of record for user identities, passwords, virtual cash balances, positions, orders, pre-trade risk validation, and audit logs.
2. **Node.js (:8000) Feed Authority:** Node.js is dedicated exclusively to high-frequency market tick generation, Level 2 DOM order books, and WebSocket streaming. It possesses zero execution authority and returns `HTTP 410` on deprecated OMS endpoints.
3. **Python FastAPI (:8100) Research Invariant:** The Python engine is strictly a read-only quantitative research microservice. It can never debit, credit, or place orders against user accounts.
4. **Pre-Trade Risk Gatekeeper (Rule A):**
   - Single-trade max risk cap: $\text{abs}(\text{Entry} - \text{SL}) \times \text{Qty} \le \text{Equity} \times 1.0\%$.
   - Safe Position Sizer must return `0 units` when 1 share risk exceeds the 1% cap (never round up to 1 unit).
   - Daily Drawdown Circuit Breaker: Realized + Unrealized loss $\ge 3.0\%$ locks opening orders for the remainder of the session.

---

## 5. UI/UX Design Directives: Professional Institutional Dark

- **Aesthetic:** Institutional dark, ultra-clean, compact, high-density financial interface inspired by professional desktop trading systems.
- **Palette:**
  - Background: `#090D12`
  - Sidebar: `#0D131A`
  - Panel: `#111922`
  - Elevated Surface: `#151F29`
  - Border: `#25313D`
  - Primary Text: `#E7EDF3`
  - Secondary Text: `#8B99A8`
  - Positive / Bullish: `#35C69A`
  - Negative / Bearish: `#EF6468`
  - Warning / Alert: `#D8AB5E`
- **Typography:** Inter or Geist for interface copy; IBM Plex Mono or Geist Mono for financial quantities, tick prices, and order quantities.
- **Prohibited:** No purple/blue gradients, no glassmorphism, no neon glows, no decorative animations, no oversized marketing cards.
