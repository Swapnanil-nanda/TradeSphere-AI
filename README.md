# 🚀 TradeSphere AI

[![Live Demo on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://trade-sphere-ai-git-main-swap-projects1.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

> **Institutional Stock & Options Research Workstation and Simulated Execution Terminal**  
> *100% Free, Zero-Subscription Platform with Synchronous 1% Risk Gatekeeper, 24/7 GBM Market Simulation, Level 2 DOM Ladder, and 8-Agent Quantitative Intelligence.*

---

## 🌟 Executive Summary

**TradeSphere AI** is a full-stack, local-first stock and options research and paper-trading terminal built to provide professional-grade trading technology with zero subscription barriers:
1. **India & US Dual-Market Research**: Zero-cost (₹0 / $0) paper-trading architecture, strict pre-trade risk controls, behavioral trade journaling, and 1% risk position auto-sizing.
2. **Adaptive Progressive Complexity**: Three distinct interface complexity modes—**Basic Mode** (guided, beginner-friendly), **Active Mode** (multi-timeframe technical trader), and **Pro Mode** (full quant workstation, DOM ladder, and Greeks)—with consistent risk enforcement across all modes.
3. **Canonical Enterprise Dual-Tier Backend**: Authoritative Java 21 Spring Boot OMS backed by PostgreSQL transactions, paired with a dedicated high-throughput Node.js market simulation & WebSocket tick feed, and a Python FastAPI quantitative intelligence service.

---

## ⚡ Core Invariants & Architecture Rules

### 1. 🛡️ Synchronous Pre-Trade Risk Gatekeeper (Authoritative Spring Boot)
- **1% Max Single-Trade Risk Invariant**: Orders risking more than 1.0% of total account equity are strictly rejected *before* execution.
- **Strict Safe Sizing Rule**: When single-share risk exceeds the 1% risk threshold, position sizing returns 0 units and flags a risk breach (never rounds up to 1 unit).
- **Mandatory Stop-Loss Rule**: In Basic and Active modes, every order strictly requires a defined stop-loss price; open-ended risk entries are blocked.
- **3.0% Daily Drawdown Circuit Breaker**: Real-time MTM monitoring that automatically locks all opening orders if daily session losses exceed 3.0% of day-start equity.
- **Fail-Closed Execution**: Transactional actions fail closed—an API rejection or network outage never silently converts into a local browser order.
- **Deterministic Cash Ledger & Reconciliation**: Immutable financial event records with zero-variance balance audits.

### 2. 🌐 24/7 Dual-Market Simulation & Market Data Integrity
- **Consistent Provenance Labels**: All simulated data is strictly labeled `SIMULATED • GBM Market Feed` or `HISTORICAL`. The term "LIVE" is reserved strictly for authenticated, external exchange connections.
- **Core Dual-Market Equities & Indices**:
  - **NSE (India)**: `NIFTY 50`, `SENSEX`, `RELIANCE`, `TCS`, `INFY`, `HDFCBANK`, `TATAMOTORS`
  - **NASDAQ / NYSE (US)**: `AAPL`, `TSLA`, `NVDA`, `MSFT`, `GOOGL`, `AMZN`, `SPY`, `QQQ`
- **Geometric Brownian Motion (GBM) Tick Feed**: Continuous drift and stochastic volatility engine broadcasting market ticks every ~120ms with transient canvas updates without whole-page React re-renders.
- **Level 2 DOM Order Book**: Real-time 20-depth Bid/Ask ladder with dynamic volume profiling.
- **Guaranteed 120-Bar Candlestick Rendering**: Multi-timeframe historical + live ticking OHLCV candle generator (1m, 5m, 15m, 1h, 1D) with EMA-20, VWAP, support/resistance, and RSI(14).

### 3. 🎯 Progressive Complexity Modes (No Paywalls)
- **Basic Mode (Guided)**: Clean simplified chart, natural-language trend banner, automatic Support/Resistance zones, 1% Risk Auto-Sizer, and plain-English AI coach.
- **Active Mode (Day Trader)**: Multi-timeframe candlesticks, VWAP, Bollinger Bands, RSI(14), dual-market watchlists, Bracket OCO (One-Cancels-the-Other) orders, and automated trade journaling.
- **Pro Mode (Quant)**: 20-level Level 2 DOM ladder, real-time Black-Scholes Options Greeks chain ($\Delta, \Gamma, \Theta, \nu, \text{IV}$), Markowitz Efficient Frontier, Monte Carlo cones, and 8-Agent Quantitative Intelligence.

---

## 🏗️ System Architecture

```mermaid
graph TD
  A["Client Browser (Next.js 14 App Router + TypeScript)"] <-->|"Edge Deployment / Proxy"| V["Vercel Edge Network"]
  A <-->|"REST API (:8080) - Auth, OMS, Ledger, Portfolio"| S["Spring Boot 3.4.x / Java 21 Backend (Port 8080)"]
  A <-->|"WebSocket /ws/ticks & Microstructure (:8000)"| B["Node.js Market Simulator & Quant Engine (Port 8000)"]
  A <-->|"REST API (:8100) - Multi-Agent Research, MPT, Wealth"| Q["Python FastAPI Quantitative Engine (Port 8100)"]
  
  S <-->|"Flyway Migrations (v1-v10) / HikariCP"| N["PostgreSQL Database (:5432)"]
  
  subgraph Spring Boot Authoritative Monolith (:8080)
    S --> G1["Rule A Pre-Trade Risk Gatekeeper (1% Cap & Circuit Breaker)"]
    S --> G2["Deterministic Order State Machine (Market / Limit / OCO)"]
    S --> G3["Double-Entry Cash Ledger (Zero-Variance Reconciliation)"]
    S --> G4["Stateless JWT Authentication, Google Sign-In & Multi-Tenant Isolation"]
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
    Q --> M1["8 Specialist Agents (Market, News, Tech, Sim, Forecast, Risk, Strategy, Coordinator)"]
    Q --> M2["Independent Evidence Verification Component"]
    Q --> M3["Markowitz MPT, Frontier & One-Sided VaR/CVaR"]
    Q --> M4["Path-Based Monte Carlo with True Peak-to-Trough Drawdowns"]
    Q --> M5["Wealth Planning (Step-up SIP, Scenarios, Mutual Funds)"]
    Q --> M6["ReportLab Institutional PDF Export Engine"]
  end
```

---

## 🚀 1-Command Startup Workflows

### Option A: Local Stack Launcher (Node.js)
```bash
node start.js
```
This concurrently starts all services on their designated ports:
- **Frontend Terminal**: [http://localhost:3000](http://localhost:3000)
- **Spring Boot OMS & Auth Server**: [http://localhost:8080](http://localhost:8080)
- **Node.js Market Feed & WebSocket Server**: [http://localhost:8000](http://localhost:8000)
- **Python Quantitative Research Engine**: [http://localhost:8100](http://localhost:8100)

### Option B: Production Container Orchestration (Docker Compose)
```bash
docker-compose up --build
```
Builds and starts the complete multi-tier containerized stack including PostgreSQL 16, Spring Boot 3.4.x, Node.js Microstructure Engine, and Python Quantitative Service with health checks.

---

## 🧪 Comprehensive Automated Test Suites (93 Tests)

The monorepo includes 93 automated tests across all architectural tiers:

### 1. Spring Boot Authoritative Test Suite (23 Tests)
Verifies JWT authentication, Google Sign-In, tenant isolation, Rule A 1% risk gatekeeper, cash ledger reconciliation, position sizing, rate limiting, and saved screener screens:
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
*Output: 32 passed, 0 failed.*

### 3. Quantitative Research Microservice Test Suite (34 Tests)
Verifies the specialist research agents, selective query routing, independent evidence verification, Markowitz MPT, one-sided VaR/CVaR, path-based Monte Carlo drawdowns, step-up SIP plans, goal scenarios, and PDF report generation:
```bash
cd quant-engine
pytest
```
*Output: 34 passed, 0 failed.*

### 4. Node.js Market Feed Test Suite (4 Tests)
Verifies GBM price simulation, 20-level Level 2 DOM ladder, Black-Scholes Options Greeks, and auto-sizer logic:
```bash
cd backend
npm test
```
*Output: 4 passed, 0 failed.*

---

## 📂 Monorepo Directory Structure

```text
TR AI/
├── AGENTS.md                  # Lead Architect system rules, invariants & safety bounds
├── README.md                  # Monorepo documentation & quick-start runbook
├── LICENSE                    # Standard MIT License
├── start.js                   # Unified multi-process local stack launcher
├── docker-compose.yml         # Production multi-container orchestration spec
├── render.yaml                # Render cloud deployment specification (backend-spring)
├── ci/                        # Continuous Integration specifications
│   └── github-workflows/
│       └── ci.yml             # Canonical GitHub Actions workflow
├── .github/workflows/         # Active GitHub Actions CI workflow
│   └── ci.yml
├── docs/                      # Complete specifications & architectural audits
│   ├── GOOGLE_AUTH.md         # Google OAuth 2.0 and JWT setup guide
│   ├── ARCHITECTURE.md        # Topology & technical data workflows
│   ├── REPOSITORY_AUDIT.md    # Source-code and architectural audit
│   ├── BACKEND_CONFLICTS.md   # Endpoint migration and ownership resolution
│   ├── API_DEPENDENCY_MAP.md  # Frontend-to-backend dependency mapping
│   ├── DATA_FLOW_AUDIT.md     # Market data and transactional event flows
│   ├── SECURITY_AUDIT.md      # Tenant isolation and vulnerability report
│   ├── PRD.md                 # Product Requirements Document
│   ├── DATABASE.md            # Relational schema for paper trading
│   ├── FEATURE_COMPLETION.md  # Feature verification and production readiness audit
│   └── DEPLOYMENT_GUIDE.md    # Multi-target cloud deployment runbook
├── backend-spring/            # Java 21 Spring Boot Authoritative OMS & Auth (:8080)
│   ├── src/main/java/com/tradesphere/
│   │   ├── common/            # JWT, rate limiter, security config, exceptions
│   │   ├── modules/auth/      # User registration, login, Google Sign-In, JWT validation
│   │   ├── modules/paper/     # Paper OMS, execution, ledger, positions
│   │   ├── modules/portfolio/ # Portfolio valuation & risk gatekeeper
│   │   ├── modules/instrument/# Instrument registry & market quotes
│   │   ├── modules/screener/  # Saved screener screens & dynamic query engine
│   │   └── modules/watchlist/ # Multi-tenant user watchlists
│   ├── src/main/resources/    # Flyway migrations (V1-V10) & YAML configurations
│   ├── Dockerfile             # Multi-stage production container build
│   └── pom.xml                # Maven project definition
├── backend/                   # Node.js Market Feed & Microstructure Engine (:8000)
│   ├── src/
│   │   ├── server.js          # REST & WebSocket server
│   │   ├── market_data/       # 24/7 GBM tick simulator & 20-depth DOM generator
│   │   ├── quant/             # Black-Scholes Greeks & vectorized backtester
│   │   └── coach/             # Contextual AI risk coach
│   ├── test/                  # Market feed test suite
│   ├── package.json           # Node scripts and dependencies
│   └── server.js
├── quant-engine/              # Python FastAPI Quantitative Research Engine (:8100)
│   ├── agents/                # 8 Specialist Agents (Market, News, Tech, Sim, Forecast, Risk, Strategy, Coordinator)
│   ├── core/                  # Schemas, Evidence Verification & Research store
│   ├── wealth/                # SIP calculator, mutual funds & scenario modeler
│   ├── reporting/             # ReportLab institutional PDF generator
│   ├── api/                   # Versioned REST routers (/api/v1/quant, /api/v1/wealth)
│   ├── tests/                 # 34 pytest unit & integration tests
│   ├── requirements.txt       # Dependencies (FastAPI, NumPy, Pandas, SciPy, ReportLab)
│   └── main.py                # Service entry point
└── frontend/                  # Next.js 14/15 React Trading Terminal (:3000)
    ├── src/
    │   ├── app/               # Next.js App Router pages
    │   ├── components/        # Watchlist, Chart, Ticket, DOM, Greeks, Backtester, Auth
    │   ├── lib/               # Typed apiClient, market store, indicators, paper engine
    │   └── styles/            # Tailwind CSS styling
    ├── package.json
    └── next.config.mjs
```

---

## ⚖️ License
Released under the standard [MIT License](./LICENSE). Free for educational, research, and trading use.
