# API Specification — ApexTradeOS / TradeSphere AI

## 1. Architecture Overview
TradeSphere AI features a canonical decoupled backend architecture with distinct, non-overlapping ownership:
- **Authoritative OMS & Auth Service:** Java 21 Spring Boot 3.4.x running on port `8080`, backed by Flyway migrations and PostgreSQL 18. Owns authentication, tenant isolation, virtual accounts, paper order execution, pre-trade risk checks, portfolio calculations, double-entry cash ledger, and immutable audit logs.
- **Market Feed & Microstructure Engine:** Node.js service running on port `8000`. Exposes 24/7 Geometric Brownian Motion simulated tick streams (`/ws/ticks`), Level 2 Depth of Market order books (`/api/dom`), Black-Scholes Options Greeks (`/api/options-chain`), strategy backtesting (`/api/backtest`), and AI risk coaching (`/api/coach`). Duplicate account and order endpoints on Node return HTTP 410 (`MIGRATED_TO_SPRING_BOOT`).
- **Quantitative Research Engine:** Python 3.11 FastAPI service running on port `8100`. Exposes 7 specialist quantitative agents (`/api/v1/quant/research-runs`), Modern Portfolio Theory (`/api/v1/wealth/optimizations`), Efficient Frontier, path-based Monte Carlo, Systematic Investment Planning (`/api/v1/wealth/sip-plans`), goal scenarios, and ReportLab PDF generation. Read-only invariant enforced (zero execution authority).

Interactive OpenAPI documentation is hosted at:
- **Spring Boot Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **Spring Boot OpenAPI JSON:** `http://localhost:8080/v3/api-docs`
- **Python Quant Engine Docs:** `http://localhost:8100/docs`
- **Python Quant Engine OpenAPI JSON:** `http://localhost:8100/openapi.json`

---

## 2. Authentication & Authorization

All authenticated endpoints require an `Authorization: Bearer <JWT>` header.

### 2.1 Register New User
`POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "trader@tradesphere.ai",
    "password": "SecurePassword2026!",
    "fullName": "Priya Sharma",
    "tier": "ACTIVE"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 2,
    "email": "trader@tradesphere.ai",
    "fullName": "Priya Sharma",
    "tier": "ACTIVE",
    "roles": ["ROLE_USER"],
    "expiresIn": 86400
  }
  ```
- **Behavior:** Automatically provisions a ₹10,00,000 virtual paper trading account, double-entry cash ledger entry, and a default `"Core Market Watch"` watchlist.

### 2.2 Authenticate / Login
`POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "demo.trader@tradesphere.ai",
    "password": "TradeSafe2026!"
  }
  ```
- **Response (200 OK):** Returns JWT token and user profile summary.

---

## 3. User Profiles & Settings

### 3.1 Get Current User Profile
`GET /api/users/me`
- **Access:** Authenticated (`ROLE_USER`)
- **Response:**
  ```json
  {
    "id": 1,
    "email": "demo.trader@tradesphere.ai",
    "fullName": "Professional Demo Trader",
    "tier": "PRO",
    "riskCapPct": 1.00,
    "dailyDrawdownLimitPct": 3.00,
    "isActive": true,
    "roles": ["ROLE_USER"]
  }
  ```

### 3.2 Update User Settings & Tier
`PUT /api/users/me`
- **Access:** Authenticated (`ROLE_USER`)
- **Request Body:**
  ```json
  {
    "fullName": "Professional Demo Trader",
    "tier": "PRO",
    "riskCapPct": 1.00,
    "dailyDrawdownLimitPct": 3.00
  }
  ```

---

## 4. Master Instrument Catalogue & Search

### 4.1 List All Active Instruments
`GET /api/instruments`
- **Access:** Public
- **Response:** Array of instruments across Indian (NSE/BSE) and US (NASDAQ/NYSE) markets.

### 4.2 Search Instruments
`GET /api/instruments/search?q={query}`
- **Access:** Public
- **Parameters:** `q` (e.g. `REL`, `Apple`, `NIFTY`)

### 4.3 Get Instrument by Symbol
`GET /api/instruments/{symbol}`
- **Access:** Public

---

## 5. Market Data & GBM Simulator

### 5.1 Ticker Quotes
`GET /api/market-data/quotes` (or `/api/tickers`, `/api/quotes`)
- **Access:** Public
- **Response:** Array of real-time quotes with LTP, change %, bid/ask, day high/low, and simulated flags.

### 5.2 Historical OHLCV Candles
`GET /api/market-data/candles/{symbol}?timeframe=5m&count=60` (or `/api/candles`)
- **Access:** Public
- **Response:** Array of candles with open, high, low, close, volume, 20-EMA, VWAP, support, and resistance.

### 5.3 Level 2 Depth of Market (DOM)
`GET /api/market-data/dom/{symbol}?depth=10` (or `/api/dom/{symbol}`)
- **Access:** Public
- **Response:** 20-level order book ladder with bids, asks, depth volumes, and spread.

---

## 6. Watchlists & Custom Baskets

### 6.1 List User Watchlists
`GET /api/watchlists`
- **Access:** Authenticated

### 6.2 Create Watchlist
`POST /api/watchlists`
- **Access:** Authenticated
- **Request Body:** `{"name": "Tech Momentum"}`

### 6.3 Add Item to Watchlist
`POST /api/watchlists/{id}/items`
- **Access:** Authenticated
- **Request Body:** `{"symbol": "NVDA"}`

### 6.4 Remove Item from Watchlist
`DELETE /api/watchlists/{id}/items/{itemId}`
- **Access:** Authenticated (enforces user ownership isolation)

---

## 7. Stock Screener

### 7.1 Filter Screener
`GET /api/screener` or `POST /api/screener`
- **Access:** Public
- **Parameters:** `market` (`IN`/`US`), `trend` (`BULLISH`/`BEARISH`), `minRsi`, `maxRsi`, `sector`
- **Response:** Array of screened equities with technical patterns (e.g. `Ascending Triangle`, `20-EMA Bounce`).

---

## 8. Paper Trading & Pre-Trade Risk Gatekeeper

### 8.1 Place Paper Order
`POST /api/orders`
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "symbol": "RELIANCE",
    "side": "BUY",
    "orderType": "BRACKET",
    "quantity": 100,
    "stopLoss": 2950.00,
    "takeProfit": 3075.00
  }
  ```
- **Pre-Trade Gatekeeper Validations:**
  1. **Mandatory Hard Stop-Loss:** Order is rejected with `422 Unprocessable Entity` if Stop-Loss is omitted.
  2. **Single-Trade Max Loss Cap:** $\text{Risk} = \text{abs}(\text{Entry} - \text{StopLoss}) \times \text{Qty} \le \text{User Max Risk \% of Equity}$ (1.0% = ₹10,000). Excess risk is rejected with `422 MAX_LOSS_CAP_EXCEEDED`.
  3. **Risk-to-Reward Ratio:** Must satisfy $\ge 1.50\text{R}$. Sub-optimal setups rejected with `422 SUBOPTIMAL_RISK_REWARD`.
  4. **Daily Drawdown Circuit Breaker:** If realized + unrealized drawdown reaches 3.0%, all new opening orders are blocked.
  5. **Cash Solvency:** Account must have sufficient unencumbered cash balance.

### 8.2 Cancel Paper Order
`DELETE /api/orders/{id}`
- **Access:** Authenticated
- **Behavior:** Cancels an active `OPEN` limit or bracket order.
- **Invariant:** Cancelled orders transition to `CANCELLED` status and are **never** filled under any circumstances. Attempting to cancel already filled or cancelled orders returns `400 Bad Request`.

### 8.3 Close Open Position
`POST /api/positions/close`
- **Access:** Authenticated
- **Request Body:** `{"symbol": "RELIANCE"}`
- **Behavior:** Sells open position at market, records realized PnL in trade blotter, credits cash ledger, and removes position.

### 8.4 Configure Virtual Paper Account
`POST /api/accounts/configure`
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "startingCapital": 2500000.00,
    "slippageRate": 0.0004,
    "feeRate": 0.0002
  }
  ```
- **Behavior:** Configures virtual starting equity, simulated slippage multiplier, and brokerage fee percentage.

### 8.5 Reset Paper Account
`POST /api/accounts/reset`
- **Access:** Authenticated
- **Request Body:** `{"customCapital": 1000000.00}` (Optional)
- **Behavior:** Clears all open positions, cancels all pending limit orders, resets cash and net liquidation to starting capital, and logs an `ACCOUNT_RESET` entry in the double-entry cash ledger.

### 8.6 Mathematical Cash Ledger Reconciliation
`GET /api/accounts/reconcile`
- **Access:** Authenticated
- **Response:**
  ```json
  {
    "status": "RECONCILED",
    "reconciled": true,
    "variance": 0.00,
    "currency": "INR",
    "startingCapital": 1000000.00,
    "totalLedgerDebits": 29709.10,
    "totalLedgerCredits": 29672.70,
    "totalCommissionFees": 17.81,
    "calculatedCash": 999945.79,
    "currentCash": 999945.79,
    "netLiquidation": 999945.79,
    "auditFormula": "ActualCash = StartingDeposits - TradeDebits + TradeCredits - Fees",
    "disclaimer": "PAPER TRADING – NO REAL MONEY",
    "simulated": true
  }
  ```
- **Invariant:** Confirms zero mathematical variance (`variance = 0.00`) between immutable cash ledger debits/credits and account cash balance.

---

## 9. Portfolio Calculations & Ledger

### 9.1 Portfolio Summary
`GET /api/portfolio`
- **Access:** Public demo preview (defaults to demo user ID 1) or Authenticated (user-specific)
- **Response:**
  ```json
  {
    "account": {
      "netLiquidation": 999839.00,
      "currentCash": 999839.00,
      "dayStartEquity": 1000000.00,
      "dailyRealizedPnl": -161.00,
      "dailyUnrealizedPnl": 0.00,
      "drawdownPct": 0.016,
      "tradingLocked": false
    },
    "positions": [],
    "recentTrades": [...]
  }
  ```

### 9.2 Double-Entry Cash Ledger
`GET /api/ledger`
- **Access:** Authenticated
- **Response:** Complete audit trail of `INITIAL_DEPOSIT`, `TRADE_DEBIT`, and `TRADE_CREDIT` transactions.

### 9.3 Reset Portfolio
`POST /api/portfolio/reset`
- **Access:** Authenticated
- **Behavior:** Clears open positions, pending orders, and restores virtual cash balance.

### 9.4 Pre-Trade Safe Position Sizing
`POST /api/orders/size` (also mapped to `POST /api/risk/size`)
- **Access:** Public or Authenticated
- **Request Body:**
  ```json
  {
    "symbol": "RELIANCE",
    "entryPrice": 2985.40,
    "stopLossPrice": 2940.00,
    "equity": 1000000.00,
    "riskPct": 1.00
  }
  ```
- **Response:**
  ```json
  {
    "symbol": "RELIANCE",
    "recommendedQuantity": 220,
    "maxAllowableRiskAmount": 10000.00,
    "perUnitRisk": 45.40,
    "totalRiskAmount": 9988.00,
    "riskBreached": false,
    "message": "Sizing approved within 1% risk threshold."
  }
  ```
- **Invariant:** If per-unit risk exceeds max allowable risk amount, `recommendedQuantity` strictly returns `0` and `riskBreached` is `true`. Never rounds up to 1 unit.

---

## 10. Audit Trail
`GET /api/audit-events`
- **Access:** Authenticated
- **Response:** Immutable log of authentication attempts, order placements, risk breaches, and circuit lock events.

---

## 11. Node.js Market Feed & Microstructure Engine (Port 8000)

### 11.1 Black-Scholes Options Greeks
`GET /api/options-chain?symbol={symbol}&days={days}`
- **Parameters:** `symbol` (default: `NIFTY50`), `days` (default: 7)
- **Response:** Spot price, strike ladder, and computed Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$ via Newton-Raphson).

### 11.2 Strategy Backtester
`POST /api/backtest`
- **Request Body:**
  ```json
  {
    "strategy": "EMA_CROSSOVER",
    "symbol": "RELIANCE",
    "fastPeriod": 9,
    "slowPeriod": 21,
    "initialCapital": 1000000
  }
  ```
- **Response:** Vectorized trade history, win rate, net return %, max drawdown %, and equity curve coordinates.

### 11.3 AI Risk Coach & Tilt Auditor
`GET /api/coach?symbol={symbol}`
- **Response:** Technical regime evaluation (trend strength, 20-EMA, VWAP, key levels) and behavioral trade journal tilt analysis.

### 11.4 Real-time WebSocket Tick Stream
`WebSocket /ws/ticks`
- **Stream:** 120ms tick stream broadcasting price deltas, volume, and 20-level Level 2 DOM depth updates.

### 11.5 Migrated Endpoints Notice
All order, portfolio, ledger, and authentication endpoints on Node.js return HTTP 410:
```json
{
  "error": "MIGRATED_TO_SPRING_BOOT",
  "message": "Order, portfolio, ledger, and auth management are handled authoritatively by the Spring Boot backend on port 8080."
}
```

---

## 12. Quantitative Research & Wealth Engine (Python FastAPI :8100)

Autonomous Multi-Agent Alpha Modeling & Risk Invariant Service with independent Evidence Verification.

### 12.1 Multi-Agent Research Run
`POST /api/v1/quant/research-runs`
- **Request Body:**
  ```json
  {
    "query": "Evaluate technical regime, forecast, and sentiment for RELIANCE",
    "symbol": "RELIANCE",
    "requested_agents": ["MarketDataAgent", "TechnicalAnalysisAgent", "ForecastingAgent"]
  }
  ```
- **Response:** Structured research run with synthesized executive summary, specialist agent results, and evidence verification report.

### 12.2 Get Research Run by ID
`GET /api/v1/quant/research-runs/{id}`

### 12.3 Multi-Horizon Calibrated Return Forecast
`POST /api/v1/quant/forecasts`
- **Request Body:** `{"symbol": "RELIANCE", "history_bars": 252}`
- **Response:** Probabilistic forecasts across 1d, 5d, 20d horizons with 80% and 95% confidence intervals, Student's t distribution stats, and out-of-sample validation metrics (MAE, RMSE, directional accuracy).

### 12.4 Historical Similarity & Analogues
`POST /api/v1/quant/analogues`
- **Request Body:** `{"symbol": "RELIANCE", "target_window_bars": 20, "history_bars": 500, "top_k": 5}`
- **Response:** Top normalized Euclidean trajectory analogue matches and forward return distributions across 1d, 5d, and 20d.

### 12.5 Modern Portfolio Theory & Efficient Frontier
`POST /api/v1/wealth/optimizations`
- **Request Body:**
  ```json
  {
    "symbols": ["RELIANCE", "TCS", "INFY", "HDFCBANK"],
    "return_assumption_method": "Historical Annualized Mean Return",
    "frontier_points_count": 20
  }
  ```
- **Response:** Covariance & correlation matrices, Maximum Sharpe weights, Minimum Variance weights, and 20 Efficient Frontier points.

### 12.6 Efficient Frontier Retrieval
`GET /api/v1/wealth/optimizations/{id}/frontier`

### 12.7 Systematic Investment Plan (SIP) Planning
`POST /api/v1/wealth/sip-plans`
- **Request Body:**
  ```json
  {
    "monthly_investment": 10000.0,
    "annual_step_up_pct": 10.0,
    "expected_return_cagr": 12.0,
    "investment_horizon_years": 15
  }
  ```
- **Response:** Total invested, estimated future value, wealth gain, and year-by-year step-up schedule.

### 12.8 Goal-Based Scenario Modeling
`POST /api/v1/wealth/scenarios`
- **Request Body:**
  ```json
  {
    "goal_name": "Retirement Independence",
    "target_amount": 20000000.0,
    "horizon_years": 15,
    "inflation_rate_pct": 6.0,
    "expected_return_cagr": 12.0
  }
  ```
- **Response:** Inflation-adjusted target, suggested monthly SIP, recommended asset allocation, and Monte Carlo shortfall probability.

### 12.9 Mutual Fund Research Database
`GET /api/v1/wealth/mutual-funds?category=Large+Cap&query=UTI`

### 12.10 Vectorized Strategy Lab Backtest
`POST /api/v1/quant/backtests`
- **Request Body:**
  ```json
  {
    "strategy_name": "EMA_CROSSOVER",
    "symbol": "RELIANCE",
    "initial_capital": 1000000.0,
    "risk_per_trade_pct": 1.0,
    "bars": 252
  }
  ```
- **Response:** Sharpe ratio, Sortino ratio, max drawdown %, Calmar ratio, win rate %, profit factor, detailed trade log, and equity curve.

### 12.11 Research Dossier Export (JSON & PDF)
`GET /api/v1/quant/reports/{id}?format=pdf` (or `format=json`)
- **Response:** Formatted institutional PDF research dossier with typography, metadata tables, technical breakdowns, verification audit stamps, and statutory disclosures.
