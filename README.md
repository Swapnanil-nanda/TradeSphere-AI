# 🚀 TradeSphere AI

[![Live Demo on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://trade-sphere-ai-git-main-swap-projects1.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

> **Institutional Stock & Options Research Workstation and Simulated Execution Terminal**  
> *100% Free, Zero-Subscription Platform with Synchronous Pre-Trade Risk Gatekeeper, 24/7 GBM Market Simulation (~120ms tick cycle), Simulated 20-Level DOM Order Book, and 8-Agent Quantitative Intelligence.*

---

## 🌟 Executive Summary

**TradeSphere AI** is an open-source, local-first stock and options research, analytics, and simulated execution terminal designed to provide professional trading tooling without subscription paywalls:
1. **Dual-Market Research (India NSE/BSE & US NASDAQ/NYSE)**: Real-time paper trading, strict pre-trade risk controls, multi-currency USD/INR accounting, behavioral trade journaling, and risk-managed position sizing.
2. **Adaptive Progressive Complexity**: Three purpose-built interface tiers:
   - **Basic Mode (Guided)**: Clean minimalist charts, 20-EMA trend guide, automatic Support/Resistance zones, and plain-English AI coach guidance.
   - **Active Mode (Active Trader)**: Multi-timeframe candlesticks, VWAP, Bollinger Bands, RSI(14), dual-market watchlists, Bracket OCO (One-Cancels-the-Other) orders, and automated trade journaling.
   - **Pro Mode (Quant)**: Simulated 20-level Depth of Market (DOM) ladder, Black-Scholes Options Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$), Markowitz Efficient Frontier, Monte Carlo cones, and 8-Agent Quantitative Intelligence.
3. **Canonical Enterprise Multi-Tier Backend**:
   - **Authoritative OMS & Auth Service (Java 21 Spring Boot, Port 8080)**: PostgreSQL persistence with Flyway migrations, stateless JWT auth, multi-tenant isolation, cash ledger accounting, and pre-trade risk checks.
   - **Market Microstructure & Simulation Engine (Node.js, Port 8000)**: 24/7 Geometric Brownian Motion (GBM) tick generator broadcasting ticks every ~120ms, simulated 20-level order book depth, and WebSocket streaming.
   - **Quantitative Research Service (Python FastAPI, Port 8100)**: 8 specialist research agents, independent evidence verification, Markowitz MPT optimizer, one-sided VaR/CVaR, and ReportLab PDF reporting.

---

## ⚡ Core Invariants & Architecture Rules

### 1. 🛡️ Synchronous Pre-Trade Risk Gatekeeper (Spring Boot Authoritative)
- **Pre-Trade Risk Checks**: Evaluates order validity, margin requirements, account buying power, and risk thresholds *before* execution.
- **Fail-Closed Architecture**: All authenticated operations (orders, portfolio valuation, cash ledger, watchlists, alerts, account configuration) fail closed on backend failure. If the authoritative Spring Boot backend is unreachable, operations throw explicit errors rather than silently falling back to browser-local state.
- **Strict Safe Sizing Rule**: Auto-sizing computes mathematically safe quantities based on Stop-Loss distance; if risk exceeds allowable capital limits, it safely returns 0 units with a risk breach warning.
- **3.0% Daily Drawdown Circuit Breaker**: Real-time Mark-to-Market (MTM) monitoring automatically locks new opening orders if session drawdown hits 3.0% of day-start equity.
- **Consistent Fees & Slippage**: Commission fees and market slippage are deducted systematically across market orders, manual position square-offs, and automated OCO exits.
- **Broker Live Routing Safeguard**: Direct live order routing to Finvasia Shoonya is explicitly disabled (HTTP 403) pending per-user authorization, encrypted credential storage, and multi-tenant session isolation. All executions run on the authoritative paper trading OMS.

### 2. 🌐 Market Data & Microstructure Accuracy
- **Simulated 20-Level Order Book**: Under exchange guidelines (e.g., NSE India), Level 1 denotes top bid/ask, Level 2 denotes 5-depth, and Level 3 denotes up to 20-depth. TradeSphere AI provides a **high-fidelity simulated 20-level order book ladder**, accurately labeled as simulated microstructure rather than a live exchange feed.
- **Truthful Latency Characteristics**: Market ticks are generated via a Geometric Brownian Motion + ATR stochastic engine operating on a measured ~120ms simulation cycle, streaming transient updates directly to Canvas and DOM components without React whole-page re-renders.
- **Data Provenance Labels**: All simulated data is explicitly marked `SIMULATED • GBM Market Feed`. The term `LIVE` is strictly reserved for authenticated external broker connections.
- **Core Dual-Market Universe**:
  - **NSE (India)**: `NIFTY 50`, `SENSEX`, `RELIANCE`, `TCS`, `INFY`, `HDFCBANK`, `TATAMOTORS`
  - **NASDAQ / NYSE (US)**: `AAPL`, `TSLA`, `NVDA`, `MSFT`, `GOOGL`, `AMZN`, `SPY`, `QQQ`

### 3. 📊 Honest Quantitative Backtesting
- **No Fabricated Backtest Metrics**: Strategies are backtested strictly against historical candle data ($\ge 30$ historical bars required). If candle data is missing or insufficient, the engine throws an explicit error rather than silently synthesizing sine waves or defaulting to fabricated metric values.

---

## 🏗️ System Architecture

```mermaid
graph TD
  A["Client Browser (Next.js 14 App Router + TypeScript)"] <-->|"Edge Deployment / Proxy"| V["Vercel Edge Network"]
  A <-->|"REST API (:8080) - Auth, OMS, Ledger, Portfolio"| S["Spring Boot 3.4.x / Java 21 Backend (Port 8080)"]
  A <-->|"WebSocket /ws/ticks & Microstructure (:8000)"| B["Node.js Market Simulator & Quant Engine (Port 8000)"]
  A <-->|"REST API (:8100) - Multi-Agent Research, MPT, Wealth"| Q["Python FastAPI Quantitative Engine (Port 8100)"]
  
  S <-->|"Flyway Migrations (v1-v10) / HikariCP"| N["PostgreSQL Database (:5432)"]
  
  subgraph Spring Boot Authoritative OMS (:8080)
    S --> G1["Pre-Trade Risk Gatekeeper (Buying Power & 3% Circuit Breaker)"]
    S --> G2["Deterministic Order State Machine (Market / Limit / OCO)"]
    S --> G3["Double-Entry Cash Ledger (Zero-Variance Reconciliation)"]
    S --> G4["Stateless JWT Authentication, Google Sign-In & Multi-Tenant Isolation"]
    S --> G5["Exact BigDecimal Financial Calculations with Consistent Fees/Slippage"]
  end

  subgraph Node.js High-Frequency Market Simulator (:8000)
    B --> C["24/7 GBM Tick Simulator (~120ms cycle, /ws/ticks)"]
    B --> D["Simulated 20-Level DOM Ladder (/api/dom)"]
    B --> E["Black-Scholes Options Greeks Engine (/api/options-chain)"]
    B --> F["Strategy Backtest Simulation Engine (/api/backtest)"]
    B --> H["Contextual AI Risk Coach (/api/coach)"]
  end

  subgraph Python Quantitative Research Engine (:8100)
    Q --> M1["8 Specialist Agents (Market, News, Tech, Sim, Forecast, Risk, Strategy, Coordinator)"]
    Q --> M2["Independent Evidence Verification Component"]
    Q --> M3["Markowitz MPT, Efficient Frontier & One-Sided VaR/CVaR"]
    Q --> M4["Path-Based Monte Carlo with True Empirical Drawdowns"]
    Q --> M5["Wealth Planning (Step-up SIP, Goal Scenarios, Mutual Funds)"]
    Q --> M6["ReportLab Institutional PDF Export Engine"]
  end
```

---

## 🚀 1-Command Startup Workflows

### Option A: Local Stack Launcher (Node.js)
```bash
node start.js
```
Concurrently starts all services on their designated ports:
- **Frontend Terminal**: [http://localhost:3000](http://localhost:3000)
- **Spring Boot OMS & Auth Server**: [http://localhost:8080](http://localhost:8080)
- **Node.js Market Feed & WebSocket Server**: [http://localhost:8000](http://localhost:8000)
- **Python Quantitative Research Engine**: [http://localhost:8100](http://localhost:8100)

### Option B: Production Container Orchestration (Docker Compose)
```bash
docker-compose up --build
```
Builds and boots the complete containerized stack: PostgreSQL 16, Spring Boot 3.4.x, Node.js Microstructure Engine, and Python Quantitative Service with integrated health checks.

---

## 🧪 Monorepo Test Suites (119 Automated Tests)

The monorepo contains 119 automated tests validating security, financial math, and risk enforcement across all layers:

### 1. Spring Boot Authoritative Test Suite (43 Tests)
Verifies JWT authentication, Google Sign-In, tenant isolation, pre-trade risk gatekeeper, cash ledger reconciliation, fee and slippage accounting, rate limiting, and saved screens:
```bash
mvn clean test -f backend-spring/pom.xml
```
*Output: 43 passed, 0 failed.*

### 2. Frontend Unit & Invariant Test Suite (38 Tests)
Verifies technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, VWAP, Supertrend), options Greeks analytical bounds, fail-closed API client operations, multi-currency USD/INR formatting, and trader academy curriculum:
```bash
npm test --prefix frontend
```
*Output: 38 passed, 0 failed.*

### 3. Quantitative Research Microservice Test Suite (34 Tests)
Verifies specialist research agents, selective query routing, independent evidence verification, Markowitz MPT, one-sided VaR/CVaR, path-based Monte Carlo drawdowns, step-up SIP plans, and PDF report generation:
```bash
cd quant-engine && pytest
```
*Output: 34 passed, 0 failed.*

### 4. Node.js Market Feed Test Suite (4 Tests)
Verifies GBM price simulation, simulated 20-level DOM ladder, Black-Scholes Options Greeks, and auto-sizer logic:
```bash
npm test --prefix backend
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
│   │   ├── market_data/       # 24/7 GBM tick simulator & simulated 20-level DOM generator
│   │   ├── quant/             # Black-Scholes Greeks & strategy backtester
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
Released under the standard [MIT License](./LICENSE). Free for educational, research, and algorithmic trading use.
