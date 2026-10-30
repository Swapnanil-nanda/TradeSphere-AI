# API Contracts & Wire Protocol Specifications — TradeSphere AI
## Canonical REST, WebSocket & Error Handling Schemas

**Document Version:** 1.0.0  
**Date:** October 31, 2026  
**Auditor:** Principal FinTech Systems Architect  
**Status:** Canonical Interface Specification

---

## 1. Network Topology & Port Bindings

| Service | Runtime | Base URL | Protocol | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Authoritative OMS & Auth** | Spring Boot 3.4.x / Java 21 | `http://localhost:8080` | HTTPS / REST | User identities, virtual cash ledger, orders, pre-trade risk checks. |
| **Market Feed & Microstructure** | Node.js v24 | `http://localhost:8000` | HTTP & WSS (`/ws/ticks`) | 24/7 GBM simulation, 20-level Level 2 DOM, options chain. |
| **Quantitative Research Engine** | Python 3.11 / FastAPI | `http://localhost:8100` | HTTPS / REST | 7 specialist agents, MPT, forecasts, backtests, PDF export. |
| **Frontend Application** | Next.js 14/15 / React | `http://localhost:3000` | Browser Client | Institutional dark trading terminal and research workstation. |

---

## 2. Spring Boot Authoritative OMS Endpoints (:8080)

All authenticated endpoints require an `Authorization: Bearer <JWT>` header.

### 2.1 User Authentication
- **Register:** `POST /api/auth/register`
  - *Request Body:*
    ```json
    {
      "email": "trader@tradesphere.ai",
      "password": "SecurePassword2026!",
      "fullName": "Arjun Patel",
      "tier": "ACTIVE"
    }
    ```
  - *Response (201 Created):* Returns JWT token, user ID, and provisions a default ₹10,00,000 paper trading account.
- **Login:** `POST /api/auth/login`
  - *Request Body:*
    ```json
    {
      "email": "trader@tradesphere.ai",
      "password": "SecurePassword2026!"
    }
    ```
  - *Response (200 OK):* Returns JWT Bearer token and user profile summary.

### 2.2 Paper Order Management & Execution
- **Submit Paper Order:** `POST /api/orders`
  - *Headers:* `Authorization: Bearer <JWT>`, `X-Client-Order-ID: <UUID-v4>`
  - *Request Body:*
    ```json
    {
      "symbol": "RELIANCE",
      "side": "BUY",
      "orderType": "MARKET",
      "quantity": 50,
      "limitPrice": null,
      "stopLoss": 2950.00,
      "takeProfit": 3075.00,
      "clientOrderId": "8f1a23c4-1234-5678-9abc-def012345678"
    }
    ```
  - *Response (201 Created — Filled):*
    ```json
    {
      "id": 104,
      "clientOrderId": "8f1a23c4-1234-5678-9abc-def012345678",
      "symbol": "RELIANCE",
      "side": "BUY",
      "orderType": "MARKET",
      "quantity": 50,
      "status": "FILLED",
      "executedPrice": 2985.40,
      "feeAmount": 29.85,
      "stopLoss": 2950.00,
      "takeProfit": 3075.00,
      "executedAt": "2026-10-31T03:45:00Z",
      "simulated": true,
      "disclaimer": "PAPER TRADING – NO REAL MONEY"
    }
    ```
  - *Response (422 Unprocessable Entity — Risk Breach):*
    ```json
    {
      "error": "RISK_GATEKEEPER_VIOLATION",
      "code": "SINGLE_TRADE_MAX_LOSS_EXCEEDED",
      "message": "Risk breach: Order risk (₹48,500.00) exceeds single-trade max loss cap (₹10,000.00, 1.0% of equity).",
      "timestamp": "2026-10-31T03:45:00Z"
    }
    ```

- **Cancel Open Order:** `DELETE /api/orders/{id}`
  - *Response (200 OK):* Returns updated order object with `status: "CANCELLED"`.

- **Safe Position Sizing Probe:** `POST /api/orders/size`
  - *Request Body:*
    ```json
    {
      "symbol": "RELIANCE",
      "entryPrice": 2985.00,
      "stopLossPrice": 2950.00,
      "riskPct": 1.0
    }
    ```
  - *Response (200 OK):*
    ```json
    {
      "recommendedQuantity": 285,
      "riskPerShare": 35.00,
      "maxAllowedRisk": 10000.00,
      "riskBreached": false
    }
    ```
  - *Invariant Note:* If single-share risk exceeds `maxAllowedRisk`, returns `recommendedQuantity: 0` and `riskBreached: true`.

### 2.3 Portfolio & Cash Reconciliation
- **Portfolio Summary:** `GET /api/portfolio`
  - *Response (200 OK):*
    ```json
    {
      "account": {
        "startingCapital": 1000000.00,
        "currentCash": 850640.44,
        "currency": "INR",
        "dayStartEquity": 1000000.00
      },
      "netLiquidationValue": 999910.44,
      "dayPnL": -89.56,
      "unrealizedPnL": 0.00,
      "realizedPnL": 0.00,
      "positions": [
        {
          "symbol": "RELIANCE",
          "quantity": 50,
          "averageBuyPrice": 2985.40,
          "currentPrice": 2985.40,
          "unrealizedPnL": 0.00,
          "currency": "INR"
        }
      ],
      "trades": []
    }
    ```

- **Audit & Reconcile Ledger:** `GET /api/accounts/reconcile`
  - *Response (200 OK):*
    ```json
    {
      "reconciled": true,
      "startingCapital": 1000000.00,
      "netLedgerMovements": -149359.56,
      "computedCash": 850640.44,
      "actualCurrentCash": 850640.44,
      "cashVariance": 0.00,
      "disclaimer": "PAPER TRADING – NO REAL MONEY"
    }
    ```

---

## 3. Node.js Market Feed & WebSocket Protocol (:8000)

### 3.1 Real-Time WebSocket Tick Feed
- **URL:** `ws://localhost:8000/ws/ticks`
- **Protocol:** JSON Tick Broadcast (120ms interval per instrument).
- **Message Format:**
  ```json
  {
    "type": "tick",
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "currency": "INR",
    "ltp": 2985.40,
    "bid": 2985.10,
    "ask": 2985.70,
    "change": 14.50,
    "changePct": 0.49,
    "volume": 3412500,
    "dayHigh": 2998.00,
    "dayLow": 2962.10,
    "timestamp": 1793374800000,
    "bids": [[2985.10, 150], [2984.80, 320], "...20 levels"],
    "asks": [[2985.70, 210], [2986.00, 450], "...20 levels"],
    "simulated": true
  }
  ```

### 3.2 Microstructure Level 2 DOM
- **REST Endpoint:** `GET /api/dom?symbol=RELIANCE`
  - *Response (200 OK):* 20 levels of sorted bids (descending) and 20 levels of sorted asks (ascending).

### 3.3 Options Chain & Black-Scholes Greeks
- **REST Endpoint:** `GET /api/options-chain?symbol=NIFTY50`
  - *Response (200 OK):* Symmetrical 11 strike intervals containing Call/Put strike prices, LTP, IV, $\Delta, \Gamma, \Theta, \nu$, and OI.

---

## 4. Python FastAPI Quantitative Engine Endpoints (:8100)

### 4.1 Multi-Agent Research Orchestrator
- **Execute Research Run:** `POST /api/v1/quant/research-runs`
  - *Request Body:*
    ```json
    {
      "query": "Assess RELIANCE technical trend and risk profile",
      "symbol": "RELIANCE",
      "requested_agents": null,
      "parameters": {}
    }
    ```
  - *Response (200 OK):* Returns `ResearchRun` containing invoked agents (`TechnicalAnalysisAgent`, `RiskManagementAgent`), specialist outputs, `EvidenceVerificationReport` (`is_verified: true`), and executive plain-English synthesis.

### 4.2 Modern Portfolio Theory (MPT) & Efficient Frontier
- **Optimize Portfolio:** `POST /api/v1/wealth/optimizations`
  - *Request Body:*
    ```json
    {
      "symbols": ["RELIANCE", "TCS", "INFY", "HDFCBANK"],
      "risk_free_rate": 0.0675,
      "return_assumption_method": "Historical Annualized Mean Return",
      "frontier_points_count": 20
    }
    ```
  - *Response (200 OK):* Returns Covariance Matrix, Correlation Matrix, `max_sharpe_portfolio` (weights, return %, volatility %), `min_variance_portfolio`, and 20 `frontier_points`.

### 4.3 Systematic Investment Plan (SIP) Planner
- **Calculate SIP:** `POST /api/v1/wealth/sip-plans`
  - *Request Body:*
    ```json
    {
      "monthly_investment": 10000.0,
      "annual_step_up_pct": 10.0,
      "expected_return_cagr": 12.0,
      "investment_horizon_years": 10
    }
    ```
  - *Response (200 OK):* Returns `total_invested`, `estimated_future_value`, `wealth_gain`, and 10-year step-up schedule breakdown.

### 4.4 Vectorized Strategy Lab Backtest
- **Run Backtest:** `POST /api/v1/quant/backtests`
  - *Request Body:*
    ```json
    {
      "strategy_name": "EMA_CROSSOVER",
      "symbol": "RELIANCE",
      "initial_capital": 1000000.0,
      "risk_per_trade_pct": 1.0,
      "bars": 252
    }
    ```
  - *Response (200 OK):* Returns `net_return_pct`, `sharpe_ratio`, `sortino_ratio`, `max_drawdown_pct`, `win_rate_pct`, `profit_factor`, trade logs, and daily equity curve.

### 4.5 Institutional PDF Research Dossier Export
- **Export PDF:** `GET /api/v1/quant/reports/{id}?format=pdf`
  - *Response (200 OK):* Direct binary stream `Content-Type: application/pdf` with disposition `attachment; filename="TradeSphere_Report_{id}.pdf"`.
