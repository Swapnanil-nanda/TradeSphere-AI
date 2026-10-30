# REPOSITORY AUDIT — APEXTRADEOS / TRADESPHERE AI

**Date:** October 31, 2026  
**Auditor:** Principal Software Architect (FinTech, Quantitative Trading Systems)  
**Target Repository:** `https://github.com/Swapnanil-nanda/TradeSphere-AI`  
**Workspace Root:** `c:\Users\hello\Desktop\antigravity products\TR AI`  
**Scope:** Architectural decomposition, codebase inventory, component status, code quality, and technical debt audit.

---

## 1. Executive Summary

TradeSphere AI (ApexTradeOS) is architected as an institutional-grade, multi-tier paper trading and quantitative research platform covering Indian (NSE/BSE) and US (NASDAQ/NYSE) equities and indices.

A comprehensive source-code and operational audit reveals that the repository currently exists in a **bifurcated architectural state**:
1. **The In-Memory Node.js Microservice (`backend/`, Port 8000):** A lightweight Node.js HTTP and WebSocket server running a 24/7 Geometric Brownian Motion (GBM) tick engine, 20-depth Level 2 Depth-of-Market (DOM) ladder, Black-Scholes Options Greeks calculator, vectorized backtester, AI risk coach, and an in-memory paper Order Management System (OMS). It maintains all trading accounts, orders, positions, and cash ledgers exclusively in volatile process memory (`Map` and array data structures).
2. **The Relational Spring Boot Service (`backend-spring/`, Port 8080):** A production-grade Java 21 / Spring Boot 3.4.3 modular monolith backed by PostgreSQL 18 (Neon cloud) via Flyway migrations (`V1` through `V7`). It implements strict Spring Security with JWT, tenant isolation by `user_id`, a double-entry cash ledger, and a synchronous Pre-Trade Risk Gatekeeper.
3. **The Dual Frontend Application (`frontend/`, Port 3000):** A Next.js 15 application containing two parallel user interfaces:
   - *The Institutional Terminal (`frontend/src/app/terminal/page.tsx`):* Communicates directly via hardcoded URLs with the Node.js backend on `http://localhost:8000` and `ws://localhost:8000/ws/ticks`.
   - *The Modular Web Application (`frontend/src/app/app/*`):* Communicates through `frontend/src/lib/api-client.ts` and Next.js rewrites (`next.config.mjs`) targeting the Spring Boot backend on `http://localhost:8080`.

This structural bifurcation is the root cause of deployment discrepancies, state desynchronization, and authentication fragmentation.

---

## 2. Directory Layout & Codebase Inventory

```text
TradeSphere-AI/
├── AGENTS.md                                   # Engineering rules & architectural constraints
├── render.yaml                                 # Cloud deployment specification (Render Docker service)
├── start.js                                    # Local concurrent launcher (Node.js + Next.js)
│
├── frontend/                                   # Next.js 15 / React 19 Frontend
│   ├── src/
│   │   ├── app/                                # Next.js App Router
│   │   │   ├── page.tsx                        # Public landing page (Hardcoded :8000 quote ticker)
│   │   │   ├── login/page.tsx                  # Sign In (Hardcoded :8000 authentication call)
│   │   │   ├── register/page.tsx               # Account Registration (Hardcoded :8000 call)
│   │   │   ├── terminal/page.tsx               # 3-Tier Terminal (Hardcoded :8000 REST & :8000 WS)
│   │   │   ├── markets/page.tsx                # Market Overview (Hardcoded :8000 ticker call)
│   │   │   ├── app/                            # Modular App Router Suite
│   │   │   │   ├── dashboard/page.tsx          # Uses apiClient (routes to :8080 or demo)
│   │   │   │   ├── charts/page.tsx             # TradingView Lightweight Charts
│   │   │   │   ├── paper-trading/page.tsx      # Paper Order Blotter & Execution
│   │   │   │   ├── portfolio/page.tsx          # Positions, Ledger & Performance
│   │   │   │   ├── markets/page.tsx            # Market Quote Grid
│   │   │   │   ├── research/page.tsx           # Company Fundamentals & Technicals
│   │   │   │   ├── risk/page.tsx               # Pre-Trade Gatekeeper & Drawdown Monitor
│   │   │   │   ├── screener/page.tsx           # Stock Screener
│   │   │   │   ├── settings/page.tsx           # User Risk Parameters & Starting Capital
│   │   │   │   └── watchlists/page.tsx         # Multi-Market Watchlists
│   │   │   └── (public pages)/                 # about, contact, disclaimer, features, privacy, terms
│   │   ├── components/                         # Legacy Terminal Components
│   │   │   ├── Header.jsx                      # Terminal Header & Tier Selector
│   │   │   ├── Watchlist.jsx                   # Multi-Ticker Watchlist with tick flash
│   │   │   ├── TradingChart.jsx                # Canvas / Lightweight Chart component
│   │   │   ├── OrderTicket.jsx                 # Smart Order Entry Ticket (Hardcoded :8000)
│   │   │   ├── OrderBookDOM.jsx                # 20-Depth Level 2 DOM Ladder
│   │   │   ├── OptionsChain.jsx                # Black-Scholes Greeks Chain (Hardcoded :8000)
│   │   │   ├── Backtester.jsx                  # Strategy Backtesting UI (Hardcoded :8000)
│   │   │   ├── PortfolioBlotter.jsx            # Blotter, Positions, Journal
│   │   │   └── AICoachModal.jsx                # Contextual AI Risk Coach (Hardcoded :8000)
│   │   ├── components/app/                     # Modern Modular Components
│   │   │   ├── AppHeader.tsx                   # Top navigation with live status
│   │   │   ├── AppSidebar.tsx                  # Modular route sidebar navigation
│   │   │   ├── OrderForm.tsx                   # Order Ticket with 1% Auto-Sizer
│   │   │   ├── PriceChart.tsx                  # Lightweight Charts v4 integration
│   │   │   └── ...                             # StockCard, QuoteTable, PerformanceChart
│   │   ├── lib/
│   │   │   ├── api-client.ts                   # Unified API Client with demo fallbacks
│   │   │   ├── market-data/                    # Synthetic Market Data Provider & Types
│   │   │   └── indicators/                     # SMA, EMA, RSI, MACD, BB, ATR, VWAP, Supertrend
│   │   ├── legacy_pages_backup/                # Archived Vite page components
│   │   ├── App.jsx / main.jsx                  # Vestigial Vite entry points
│   │   ├── index.html / vite.config.js         # Vestigial Vite configuration
│   │   ├── next.config.mjs                     # Next.js configuration & API rewrites
│   │   └── package.json                        # Frontend dependencies
│
├── backend/                                    # Node.js Market Simulator & In-Memory OMS
│   ├── src/
│   │   ├── server.js                           # HTTP server (:8000) & WebSocket server (/ws/ticks)
│   │   ├── auth/auth_service.js                # In-memory user registration & mock JWT
│   │   ├── market_data/simulator.js            # 24/7 GBM Tick & 20-Depth DOM Simulator
│   │   ├── oms/risk_engine.js                  # In-memory OMS, Bracket OCO, & Double-Entry Ledger
│   │   ├── quant/options_greeks.js             # Black-Scholes Greeks (Delta, Gamma, Theta, Vega)
│   │   ├── quant/backtester.js                 # Vectorized Strategy Backtester
│   │   └── coach/ai_coach.js                   # Rule-based Contextual AI Risk Coach
│   └── package.json                            # Node.js dependencies (ws, express-less http)
│
├── backend-spring/                             # Java 21 Spring Boot Monolith
│   ├── src/
│   │   ├── main/java/com/tradesphere/
│   │   │   ├── TradeSphereApplication.java     # Spring Boot application entry point
│   │   │   ├── common/
│   │   │   │   ├── config/                     # ProductionDataSourceConfig, OpenApiConfig
│   │   │   │   ├── exception/                  # GlobalExceptionHandler, RiskGatekeeperException
│   │   │   │   └── security/                   # SecurityConfig, JwtTokenProvider, UserPrincipal
│   │   │   └── modules/
│   │   │       ├── auth/                       # User, Role, AuthController, AuthService
│   │   │       ├── instrument/                 # Instrument, MarketDataController, MarketDataService
│   │   │       ├── paper/                      # PaperAccount, Order, Trade, Position, CashLedger
│   │   │       │   ├── controller/             # OrderController, PaperAccountController, LedgerController
│   │   │       │   ├── service/                # PaperTradingService, RiskGatekeeper, PaperAccountService
│   │   │       │   └── entity/ & repository/   # JPA Entities & Spring Data Repositories
│   │   │       ├── portfolio/                  # PortfolioController, PortfolioService
│   │   │       ├── screener/                   # ScreenerController, ScreenerService
│   │   │       ├── watchlist/                  # WatchlistController, WatchlistService
│   │   │       └── audit/                      # AuditController, AuditEventService
│   │   ├── main/resources/
│   │   │   ├── application.yml                 # Default profile (H2, local development)
│   │   │   ├── application-prod.yml            # Production profile (PostgreSQL, Neon, Actuator)
│   │   │   └── db/migration/                   # Flyway Migrations V1 through V7
│   │   └── test/java/com/tradesphere/          # JUnit 5 & MockMvc Test Suite (6 Test Classes)
│   ├── Dockerfile                              # Multi-stage production container build
│   └── pom.xml                                 # Maven configuration (Java 21, Spring Boot 3.4.3)
│
└── docs/                                       # Specification Documents
    ├── PRD.md / ARCHITECTURE.md / DATABASE.md / API_SPEC.md / USER_FLOWS.md / ROADMAP.md
```

---

## 3. Technology Stack Matrix

| Layer | Component | Declared / Documented | Actual Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | Java SDK | Java 21 LTS | OpenJDK 21.0.6+7 (64-Bit) | **Verified** |
| **Framework** | Spring Boot | Spring Boot 4.1.x *(Claimed in PRD)* | Spring Boot 3.4.3 *(4.1.x does not exist)* | **Discrepancy (Doc Error)** |
| **Database** | PostgreSQL | PostgreSQL 18 on Neon | PostgreSQL Dialect / H2 (dev) / Neon | **Verified** |
| **Migration** | Schema Tool | Flyway | Flyway Core 10.x (`V1` to `V7` migrations) | **Verified** |
| **Security** | Auth / Identity | Spring Security + JWT | Spring Security 6.4 + JJWT 0.12.6 + BCrypt | **Verified** |
| **Node Service** | Tick Simulator | Node.js 20+ ES Modules | Node.js v20.12.2 + `ws` v8.18.0 | **Verified** |
| **Frontend** | Web Framework | Next.js 15 (React 19) | Next.js 15.0.0, React 19.0.0-rc | **Verified** |
| **Charts** | Charting Engine | Lightweight Charts | TradingView Lightweight Charts v4.2.1 | **Verified** |
| **Styling** | UI CSS | Tailwind CSS 3.4 | Tailwind CSS 3.4.14 + PostCSS | **Verified** |
| **Hosting** | Cloud PaaS | Vercel (FE) + Render (BE) | Render Blueprint (`render.yaml`) + Vercel config | **Verified** |

---

## 4. Component Inventory & Status Audit

| Subsystem | Spring Boot Implementation | Node.js Implementation | Actual Ownership | Gap / Anomaly |
| :--- | :--- | :--- | :--- | :--- |
| **User Registration & Login** | `AuthController.java` (DB + BCrypt) | `auth_service.js` (In-memory Map) | **Ambiguous / Colliding** | Frontend `/login` points to Node (`:8000`); ignores DB! |
| **User Identity & Profiles** | `UserController.java` | None | **Spring Boot** | Disconnected from `/terminal` |
| **Instrument Master** | `InstrumentController.java` (12 symbols) | `simulator.js` (10 symbols) | **Dual / Divergent** | Spring has ICICIBANK, SBIN, AMZN; Node has NIFTY50 |
| **Market Data Streaming** | None (Polling REST only) | `simulator.js` (`/ws/ticks`, 120ms) | **Node.js Only** | Spring Boot cannot stream WebSocket ticks |
| **Candle Data Engine** | `MarketDataController.java` (Static) | `simulator.js` (Dynamic rolling OHLCV) | **Node.js (Terminal) / Spring (App)** | Different candle histories returned |
| **Depth of Market (DOM)** | None | `simulator.js` (20-depth DOM ladder) | **Node.js Only** | Terminal DOM depends strictly on Node.js |
| **Order Management (OMS)** | `OrderController.java` (PostgreSQL) | `risk_engine.js` (In-memory) | **Ambiguous / Colliding** | Terminal routes orders to Node; App routes to Spring |
| **Pre-Trade Risk Gatekeeper** | `RiskGatekeeper.java` (DB Net Liq) | `risk_engine.js` (Memory Net Liq) | **Duplicate Logic** | Node auto-sizer returns 1; Gatekeeper rejects 1 |
| **Cash Ledger** | `LedgerController.java` (DB Ledger) | `risk_engine.js` (Memory array) | **Duplicate Logic** | Two independent ledger balances running |
| **Account Reconciliation** | `PaperAccountController.java` (DB check) | `risk_engine.js` (Array check) | **Duplicate Logic** | Disconnected reconciliation reports |
| **Options Greeks** | None | `options_greeks.js` (Black-Scholes) | **Node.js Only** | Spring has no options pricing math |
| **Backtesting Engine** | None | `backtester.js` (Vectorized) | **Node.js Only** | Spring has no backtester |
| **AI Risk Coach** | None | `ai_coach.js` (Deterministic rules) | **Node.js Only** | Spring has no coach endpoints |
| **Watchlists** | `WatchlistController.java` (DB CRUD) | None | **Spring Boot Only** | Terminal does not persist user watchlists |
| **Screener** | `ScreenerController.java` (DB Filter) | None (Mock in `api-client.ts`) | **Spring Boot Only** | Screener filters live only in Spring |
| **Audit Events** | `AuditController.java` (DB table) | None | **Spring Boot Only** | Node actions leave no immutable audit trail |

---

## 5. Code Quality & Technical Debt

### 5.1 Vestigial Vite Files in Frontend
The `frontend/` directory contains dead configuration and entry files from an earlier Vite build:
- [vite.config.js](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/vite.config.js)
- [index.html](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/index.html)
- [src/App.jsx](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/App.jsx)
- [src/main.jsx](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/main.jsx)
- [src/legacy_pages_backup/](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/legacy_pages_backup)
These files do not affect Next.js compilation, but cause developer confusion and clutter the codebase.

### 5.2 Frontend Routing Duplication
The frontend contains two competing application shells:
1. `/terminal` ([frontend/src/app/terminal/page.tsx](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/terminal/page.tsx)): Single-page 3-tier desktop layout hosting chart, DOM, options, ticket, and blotter.
2. `/app/*` ([frontend/src/app/app/layout.tsx](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/app/layout.tsx)): Multi-page dashboard with sidebar navigation hosting discrete pages for dashboard, charts, paper-trading, portfolio, screener, risk, settings, and watchlists.
Both shells attempt to solve the same user problem using different UI paradigms and different backend targets.
