# 🚀 ApexTradeOS / TradeSphere AI

> **Institutional-Grade Stock & Options Trading Terminal**  
> *100% Free, Local-First, Zero-Dependency Architecture with 24/7 Market Simulation & Authoritative Pre-Trade Risk Invariant Engine.*

---

## 🌟 Executive Summary

**ApexTradeOS (TradeSphere AI)** is a full-stack, local-first stock and options trading terminal built from the ground up to synthesize the best architectures from:
1. **India & US Dual-Market Research**: Student-budget ($0 / ₹0) paper-trading architecture, strict pre-trade risk controls, behavioral trade journaling, and 1% risk auto-sizing.
2. **Institutional Trading Systems**: 3-Tier Adaptive Progressive Complexity (Tier 1: Basic Guided, Tier 2: Active Trader, Tier 3: Pro Quant), 24/7 Geometric Brownian Motion (GBM) tick & 20-depth DOM simulator, Black-Scholes Greeks engine, and vectorized backtester.
3. **Canonical Enterprise Dual-Tier Backend**: Authoritative Java 21 Spring Boot OMS backed by PostgreSQL transactions, paired with a dedicated high-throughput Node.js market simulation & WebSocket feed.

---

## ⚡ Key Highlights & Core Invariants

### 1. 🛡️ Synchronous Pre-Trade Risk Gatekeeper (Authoritative Spring Boot)
- **1% Max Single-Trade Risk Invariant**: Orders exceeding 1.0% of total account equity are strictly rejected *before* execution.
- **Strict Safe Sizing Rule**: When single-share risk exceeds the 1% risk threshold, position sizing returns 0 shares and flags a risk breach (never rounds up to 1 unit).
- **Mandatory Stop-Loss Rule**: Every market or limit order strictly requires a defined stop-loss price; open-ended risk entries are blocked.
- **Minimum 1.5:1 Risk/Reward Ratio**: Recommended risk/reward enforcement for disciplined trading.
- **3.0% Daily Drawdown Circuit Breaker**: Real-time MTM monitoring that automatically locks all opening orders if daily losses exceed 3.0% of day-start equity.
- **Deterministic Cash Ledger & Reconciliation**: Immutable financial event records with zero-variance balance audits.

### 2. 🌐 24/7 Dual-Market Simulation & Instrument Scope
- **Market Data Provenance & Integrity**: All quotes and ticks are strictly labeled `SIMULATED (GBM)` or `HISTORICAL`. The platform does not use "LIVE" as a synonym for frequently refreshed simulation.
- **10 Core Real-Time Simulated Equities & Indices (24/7 GBM Engine + 20-Depth DOM)**:
  - **NSE (India)**: `RELIANCE`, `NIFTY50`, `TCS`, `INFY`, `HDFCBANK`, `TATAMOTORS`
  - **NASDAQ (US)**: `AAPL`, `TSLA`, `NVDA`, `MSFT`
- **500+ Extended Stock Screener Directory**: Static asset catalog and historical datasets covering Indian (NSE/BSE) and US (NASDAQ/NYSE) equities for multi-factor screening and technical analysis.
- **Geometric Brownian Motion (GBM) Tick Feed**: Continuous drift and stochastic volatility engine broadcasting market ticks every ~120ms with transient canvas updates without whole-page React re-renders.
- **Level 2 DOM Order Book**: Real-time 20-depth Bid/Ask ladder with dynamic volume profiling.
- **Multi-Timeframe Aggregation**: 1-minute, 5-minute, 15-minute, and Daily candles enriched with real-time **EMA-20**, **VWAP**, and dynamic **Support/Resistance** levels.
- **Quantitative Engine**: Black-Scholes Options Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$ via Newton-Raphson), vectorized strategy backtesting, and AI risk coach.

### 3. 🎯 3-Tier Adaptive Progressive Complexity UI
- **Tier 1 (Basic / Guided)**: Clean simplified canvas chart, natural-language trend banner, 1% Risk Auto-Sizer, and basic position monitor for beginners.
- **Tier 2 (Active Day Trader)**: Multi-timeframe charting with crosshair inspections, bracket limit/market order entry, real-time MTM PnL, and trade journaling.
- **Tier 3 (Pro Quant)**: 20-level Level 2 DOM ladder, real-time Black-Scholes Options Greeks chain, and Vectorized Strategy Backtester with visual Equity Curves.

---

## 🏗️ System Architecture

```mermaid
graph TD
  A["Client Browser (Next.js 14 App Router + TypeScript)"] <-->|"Edge Deployment / Proxy"| V["Vercel Edge Network"]
  A <-->|"REST API (:8080) - Auth, OMS, Ledger, Portfolio"| S["Spring Boot 3.4.x / Java 21 Backend (Render Container)"]
  A <-->|"WebSocket /ws/ticks & Microstructure (:8000)"| B["Node.js Market Simulator & Quant Engine"]
  A <-->|"REST API (:8100) - Multi-Agent Research, MPT, Wealth"| Q["Python FastAPI Quantitative Engine"]
  
  S <-->|"Flyway Migrations (v1-v7) / HikariCP SSL"| N["Neon PostgreSQL Serverless"]
  
  subgraph Spring Boot Authoritative Monolith (:8080)
    S --> G1["Rule A Pre-Trade Risk Gatekeeper (1% Cap & Circuit Breaker)"]
    S --> G2["Deterministic Order State Machine (Market / Limit / OCO)"]
    S --> G3["Double-Entry Cash Ledger (Zero-Variance Reconciliation)"]
    S --> G4["Stateless JWT Authentication, Tenant Isolation & Rate Limiting"]
    S --> G5["Exact BigDecimal Financial Calculations"]
  end

  subgraph Node.js High-Frequency Market Simulator (:8000)
    B --> C["24/7 GBM Tick Simulator (120ms cycle, /ws/ticks)"]
    B --> D["20-Depth Level 2 DOM Ladder (/api/dom)"]
    B --> E["Black-Scholes Options Greeks Engine (/api/options-chain)"]
    B --> F["Vectorized Strategy Backtester (/api/backtest)"]
    B --> H["Contextual AI Coach & Tilt Auditor (/api/coach)"]
  end

  subgraph Python Quantitative Research Engine (:8100)
    Q --> M1["7 Specialist Agents (Market, News, Tech, Sim, Forecast, Risk, Strategy)"]
    Q --> M2["Independent Evidence Verification Component"]
    Q --> M3["Markowitz MPT, Frontier & One-Sided VaR/CVaR"]
    Q --> M4["Path-Based Monte Carlo with True Peak-to-Trough Drawdowns"]
    Q --> M5["Wealth Planning (Step-up SIP, Scenarios, Mutual Funds)"]
    Q --> M6["ReportLab Institutional PDF Export Engine"]
  end
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v24.14.1)
- **Java**: JDK 21
- **Maven**: 3.9+
- **Python**: 3.11+
- **Zero API keys required** — runs 100% out of the box with built-in simulation.

### One-Click Launch (All 4 Services)
```bash
node start.js
```
This concurrently boots:
1. **Spring Boot Authoritative OMS & Auth Server**: [http://localhost:8080](http://localhost:8080)
2. **Node.js Market Feed & WebSocket Server**: [http://localhost:8000](http://localhost:8000) (`ws://localhost:8000/ws/ticks`)
3. **Python Quantitative Research Engine**: [http://localhost:8100](http://localhost:8100)
4. **Frontend Terminal Application**: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Comprehensive Automated Test Suites

The platform includes five distinct test suites covering all architectural layers:

### 1. Spring Boot Authoritative Test Suite (23 Tests)
Verifies JWT authentication, multi-tenant isolation, 1% risk gatekeeper, cash ledger reconciliation, position sizing, rate limiting, and production security profiles:
```bash
cd backend-spring
mvn clean test
```
*Output: 23 passed, 0 failed.*

### 2. Frontend Unit & Invariant Test Suite (32 Tests)
Verifies technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, VWAP, Supertrend), synthetic provider metadata labels, options Greeks analytical bounds, watchlists, trader academy curriculum, and API client position sizing invariants:
```bash
cd frontend
npm test
```
*Output: 32 passed, 0 failed (100% pass rate).*

### 3. Authenticated Order Flow & Risk Gatekeeper Integration Test
Validates the full order lifecycle (`NEW` → `ACCEPTED` → `FILLED` → `CLOSED`), Rule A pre-trade risk gatekeeper rejection on 1.0% cap breach, and cash balance reconciliation:
```bash
node test_order_flow.js
```
*Output: All paper trading OMS & risk invariants verified successfully.*

### 4. Node.js Market Feed Test Suite (4 Tests)
Verifies GBM price simulation, 20-level Level 2 DOM ladder, Black-Scholes Options Greeks, and auto-sizer logic:
```bash
cd backend
npm test
```
*Output: 4 passed, 0 failed.*

### 5. Quantitative Research Microservice Test Suite (34 Tests)
Verifies the 7 specialist agents, selective query routing, independent evidence verification, Markowitz MPT, one-sided VaR/CVaR, path-based Monte Carlo drawdowns, step-up SIP plans, goal scenarios, and PDF report generation:
```bash
cd quant-engine
pytest
```
*Output: 34 passed, 0 failed.*

---

## 📂 Project Directory Structure

```text
TR AI/
├── AGENTS.md                  # Lead Architect system rules & invariants
├── README.md                  # System overview & runbook
├── start.js                   # Unified 3-process stack launcher
├── render.yaml                # Render cloud deployment specification
├── docs/                      # Architectural specifications & audits
│   ├── REPOSITORY_AUDIT.md    # Source-code and architectural audit
│   ├── BACKEND_CONFLICTS.md   # Endpoint migration and ownership resolution
│   ├── API_DEPENDENCY_MAP.md  # Frontend-to-backend dependency mapping
│   ├── DATA_FLOW_AUDIT.md     # Market data and transactional event flows
│   ├── SECURITY_AUDIT.md      # Tenant isolation and vulnerability report
│   ├── QUANT_INTEGRATION_PLAN.md # Future Python quantitative engine roadmap
│   ├── PRD.md                 # Product Requirements Document
│   ├── ARCHITECTURE.md        # Topology & technical workflows
│   ├── DATABASE.md            # Relational schema for paper trading
│   ├── FEATURE_COMPLETION.md  # 26-feature verification and production readiness audit
│   ├── API_SPEC.md            # REST & WebSocket endpoint contracts
│   └── DEPLOYMENT_GUIDE.md    # Cloud deployment runbook
├── backend-spring/            # Java 21 Spring Boot Authoritative OMS & Auth (:8080)
│   ├── src/main/java/com/tradesphere/
│   │   ├── common/            # JWT, rate limiter, security config, exceptions
│   │   ├── modules/auth/      # User registration, login, JWT validation
│   │   ├── modules/paper/     # Paper OMS, execution, ledger, positions
│   │   ├── modules/portfolio/ # Portfolio valuation & risk gatekeeper
│   │   ├── modules/instrument/# Instrument registry & market quotes
│   │   └── modules/watchlist/ # Multi-tenant watchlists
│   ├── src/main/resources/    # Flyway migrations (v1-v7) & YAML configs
│   ├── Dockerfile             # Multi-stage production container
│   └── pom.xml                # Maven project definition
├── backend/                   # Node.js Market Feed & Microstructure Engine (:8000)
│   ├── src/
│   │   ├── server.js          # REST & WebSocket server
│   │   ├── market_data/       # 24/7 GBM tick simulator & 20-depth DOM
│   │   ├── quant/             # Black-Scholes Greeks & backtester
│   │   └── coach/             # Contextual AI coach
│   ├── test/                  # Market feed test suite
│   └── package.json
├── quant-engine/              # Python FastAPI Quantitative Research Engine (:8100)
│   ├── agents/                # 7 Specialist Agents (Market, News, Tech, Sim, Forecast, Risk, Strategy)
│   ├── core/                  # Schemas, Evidence Verification & Research store
│   ├── wealth/                # SIP calculator, mutual funds & scenario modeler
│   ├── reporting/             # ReportLab institutional PDF generator
│   ├── api/                   # Versioned REST routers (/api/v1/quant, /api/v1/wealth)
│   ├── tests/                 # 34 pytest unit & integration tests
│   ├── requirements.txt       # Dependencies (FastAPI, NumPy, Pandas, SciPy, ReportLab)
│   └── main.py                # Microservice entry point
└── frontend/                  # Next.js 14/15 React Trading Terminal (:3000)
    ├── src/
    │   ├── app/               # Next.js App Router pages
    │   ├── components/        # Watchlist, Chart, Ticket, DOM, Greeks, Backtester
    │   ├── lib/               # Typed apiClient, config resolver, indicators
    │   └── styles/            # Tailwind CSS styling
    ├── package.json
    └── next.config.mjs
```

---

## ⚖️ License
MIT License. Free for educational, research, and non-commercial trading use.
