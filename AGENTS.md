# AGENTS.md — ApexTradeOS / TradeSphere AI Architecture & Safety Rules

## 1. Project Mission & Identity
**ApexTradeOS (TradeSphere AI)** is a 100% free, self-hosted, multi-tier trading research, analytics, and simulated execution platform built for Indian (NSE/BSE/NFO) and US (NASDAQ/NYSE) markets.

The platform is designed to serve traders across the full spectrum of experience using **Adaptive Progressive Complexity**:
1. **Tier 1 — Basic (Guided):** Clean charts, 20-EMA trend guide, automatic Support/Resistance zones, mandatory Stop-Loss, automatic 1% account-risk position sizer, and plain-English AI coach guidance.
2. **Tier 2 — Active Trader:** Multi-timeframe candlesticks, VWAP, Bollinger Bands, RSI(14), dual-market watchlists, Bracket OCO (One-Cancels-the-Other) orders, and automated trade journaling.
3. **Tier 3 — Pro Quant:** 20-level Depth of Market (DOM) order book ladder, Black-Scholes Options Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$), vectorized strategy backtester, and institutional-grade risk controls.

---

## 2. Canonical Backend Architecture & Responsibilities

The system operates a dual-tier backend architecture with distinct, non-overlapping ownership:

### Authoritative Backend: Java 21 Spring Boot (`backend-spring/`, Port 8080)
The **sole authoritative system of record** for:
- **Authentication & Security:** User registration, bcrypt password hashing, stateless JWT issuance/validation, multi-tenant isolation, rate limiting (Sliding window on `/api/auth/*` and `/api/orders/*`).
- **Account & Cash Management:** Virtual starting capital, transactional cash balance updates, multi-currency support (INR/USD).
- **Order Management System (OMS):** Idempotent order placement, order state machine (`PENDING`, `FILLED`, `CANCELLED`, `REJECTED`), bracket child order tracking.
- **Pre-Trade Risk Gatekeeper:** Hard Stop-Loss validation, 1% single-trade max loss enforcement, 3% daily drawdown circuit breaker, portfolio balance reconciliation.
- **Persistence:** Relational schema backed by PostgreSQL with Flyway migrations and immutable event history.

### Market Feed & Quant Engine: Node.js Microstructure Engine (`backend/`, Port 8000)
Dedicated high-throughput simulation and market streaming:
- **24/7 Zero-Key Market Simulator:** Geometric Brownian Motion (GBM) with volatility clustering and ATR price movement.
- **Microstructure Engine:** Simulated 20-level Depth of Market (DOM) order book ladder with realistic liquidity distribution.
- **WebSocket Feed:** High-frequency binary/JSON tick stream (`/ws/ticks`) for zero-lag chart and ladder updates.
- **Quantitative Research Services:** Black-Scholes options pricing and Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$ via Newton-Raphson), vectorized strategy backtesting engine, and deterministic AI risk coach.
- *Notice:* Node.js order and account endpoints are deprecated and return HTTP 410 (`MIGRATED_TO_SPRING_BOOT`).

### Quantitative Investment Research Engine: Python FastAPI (`quant-engine/`, Port 8100)
Dedicated autonomous multi-agent quantitative analytics and investment research service:
- **7 Specialist Agents:** Market Data, News Intelligence, Technical Analysis, Historical Similarity, Forecasting, Risk Management, Quantitative Strategy.
- **Orchestration & Verification:** Intent-based selective routing and independent Evidence Verification auditing outputs against regulatory and mathematical invariants.
- **Quantitative Analytics:** Markowitz MPT, Efficient Frontier, one-sided VaR/CVaR, path-based Monte Carlo (with empirical path maximum drawdown), SIP planning, goal-based scenario modeling, and Strategy Lab.
- *Invariant:* Read-only research engine. The Python engine has zero order execution authority and never writes directly into paper-trading accounts.

---

## 3. Architectural Invariants (Non-Negotiable Rules)

### Rule A: The Pre-Trade Risk Gatekeeper Invariant
**No order shall ever be executed without passing the synchronous Pre-Trade Risk Gatekeeper.**
- **Single-Trade Max Loss Cap:** $\text{abs}(\text{Entry} - \text{StopLoss}) \times \text{Qty} \le \text{User Max Risk \% of Equity}$ (default 1.0%).
- **Strict Safe Sizing Rule:** If the risk for even a single share/contract exceeds the 1.0% maximum risk allocation, position sizing **must return 0 units** with an explicit risk breach warning. Sizing must NEVER round up to a minimum of 1 unit.
- **Daily Drawdown Circuit Breaker:** If realized + unrealized daily drawdown hits 3.0% of starting equity, all new opening orders are locked for the remainder of the session.
- **Mandatory Hard Stop-Loss:** In Basic and Active tiers, orders cannot be placed without a hard Stop-Loss price attached.
- **Bracket OCO State Machine:** When a bracket order fills, Take-Profit and Stop-Loss child legs are actively monitored; when one triggers, the counter-leg is immediately canceled.

### Rule B: Market Data & Execution Decoupling
- **Zero UI Lag:** High-frequency WebSocket ticks stream directly into transient state stores (e.g. Zustand transient listeners or Canvas drawing loops) without triggering re-renders of the entire React component hierarchy.
- **24/7 Zero-Key Fallback:** The system includes a realistic Geometric Brownian Motion (GBM) + ATR tick and simulated 20-level DOM that runs automatically if exchange feeds are offline or no API credentials are provided.
- **Data Integrity:** Synthetic development data must always be clearly distinguished and labeled `SIMULATED` from live exchange data.

### Rule C: Progressive Complexity UI Boundaries
- Components must cleanly adapt according to the selected mode (`basic`, `active`, `pro`).
- Complex widgets (Simulated 20-level DOM, Options Chain Greeks, Backtester) are hidden by default in Basic Mode to prevent cognitive overload for novice traders.

### Rule D: Financial Calculation Exactness
- All price calculations, PnL, position sizing, margin, and Black-Scholes Greeks must use IEEE double-precision mathematics or fixed-decimal equivalents (`BigDecimal` in Spring Boot) with zero rounding errors.
- Options Greeks must accurately calculate:
  - $\Delta$ (Delta), $\Gamma$ (Gamma), $\Theta$ (Theta), $\nu$ (Vega), and Implied Volatility (IV via Newton-Raphson).

---

## 4. Directory Layout
```text
TR AI/
├── AGENTS.md                  # System architecture, invariants & engineering rules
├── start.js                   # Unified multi-process local launcher (Spring + Node + Next.js)
├── render.yaml                # Render cloud deployment specification (backend-spring)
├── .github/workflows/ci.yml   # Production CI pipeline (Security, Frontend, Spring, Node, Python)
├── scripts/                   # SRE automation, secret scanner, SAST, dependency audit, backup
│   ├── security/              # Secret scanner, SAST, and dependency audit tools
│   ├── backup_restore.sh      # PostgreSQL backup, checksum verification & restore
│   └── healthcheck.js         # Deployment readiness diagnostics probe
├── tests/                     # Monorepo integration and high-throughput load tests
│   ├── integration/           # Cross-service API contract integration tests
│   └── load/                  # 120k+ DOM updates/sec microstructure load benchmarks
├── docs/                      # Complete specifications & audits
│   ├── REPOSITORY_AUDIT.md    # Full source-code and architectural audit
│   ├── BACKEND_CONFLICTS.md   # Endpoint migration and ownership resolution
│   ├── API_DEPENDENCY_MAP.md  # Frontend-to-backend dependency mapping
│   ├── DATA_FLOW_AUDIT.md     # Market data and transactional event flows
│   ├── SECURITY_AUDIT.md      # Tenant isolation and vulnerability report
│   ├── INCIDENT_RUNBOOKS.md   # Production incident response & P1/P2/P3 SOPs
│   ├── QUANT_INTEGRATION_PLAN.md # Roadmap for future Python quantitative engine
│   ├── PRD.md                 # Product Requirements Document
│   ├── ARCHITECTURE.md        # Architecture & Data Workflows
│   ├── DATABASE.md            # Schema, Entities & Tables
│   ├── API_SPEC.md            # REST & WebSocket API Specs
│   └── DEPLOYMENT_GUIDE.md    # Multi-target deployment runbook
├── backend-spring/            # Java 21 Spring Boot Authoritative OMS & Auth Service
│   ├── src/main/java/com/tradesphere/
│   │   ├── common/            # Security (JWT, rate limiter), config, exceptions
│   │   ├── modules/auth/      # User identity, registration, login
│   │   ├── modules/paper/     # Paper account, order execution, position & ledger engine
│   │   ├── modules/portfolio/ # Mark-to-market portfolio & risk checks
│   │   ├── modules/instrument/# Instrument registry & market quotes
│   │   └── modules/watchlist/ # Multi-tenant user watchlists
│   ├── src/main/resources/    # Flyway SQL migrations (V1-V7) & application profiles
│   ├── Dockerfile             # Multi-stage production container build
│   └── pom.xml                # Maven project definition
├── backend/                   # Node.js Market Feed & Microstructure Engine
│   ├── src/
│   │   ├── market_data/       # 24/7 GBM tick simulator & 20-level DOM generator
│   │   ├── quant/             # Black-Scholes Greeks, backtesting engine
│   │   └── coach/             # Deterministic AI Risk Coach
│   ├── test/                  # Node.js market feed test suite
│   ├── package.json           # Node scripts and dependencies
│   └── server.js              # Express REST & WebSocket server (Port 8000)
├── quant-engine/              # Python FastAPI Quantitative Research Engine (Port 8100)
│   ├── agents/                # 7 Specialist Agents (Market, News, Tech, Sim, Forecast, Risk, Strategy)
│   ├── core/                  # Pydantic schemas, Evidence Verification & Research store
│   ├── wealth/                # SIP calculator, mutual funds & scenario modeler
│   ├── reporting/             # ReportLab institutional PDF generator
│   ├── api/                   # Versioned REST routers (/api/v1/quant, /api/v1/wealth)
│   ├── tests/                 # 34 pytest unit & integration tests
│   ├── requirements.txt       # Dependencies (FastAPI, NumPy, Pandas, SciPy, ReportLab)
│   └── main.py                # Service entry point
└── frontend/                  # Next.js 14/15 React Trading Terminal
    ├── src/
    │   ├── app/               # App Router pages (/terminal, /app/*, /login, etc.)
    │   ├── components/        # Watchlist, Chart, Ticket, DOM, Greeks, Backtester
    │   ├── lib/               # Typed apiClient, config resolver, indicators, market-data
    │   └── styles/            # Tailwind theme & CSS
    ├── package.json           # Frontend dependencies & test runner
    └── next.config.mjs        # Production rewrites & security headers
```
