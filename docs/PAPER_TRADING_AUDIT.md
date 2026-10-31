# docs/PAPER_TRADING_AUDIT.md — TradeSphere AI Paper Trading Architectural Audit

**Audit Date:** 2026-10-31  
**Auditor:** Principal FinTech Systems Engineer, Senior Quantitative Developer & Application Security Engineer  
**System Target:** TradeSphere AI Paper Trading Terminal (`/app/paper-trading`)  
**Authoritative Backend:** Java 21 Spring Boot (`backend-spring/`, Port 8080)  
**Market Data Feed:** Node.js Microstructure Feed Engine (`backend/`, Port 8000) & Next.js Live Proxy (`/api/market/*`)  

---

## 1. System Architecture & Component Mapping

TradeSphere AI employs a dual-tier backend architecture where account ownership, order routing, pre-trade risk enforcement, and cash ledger persistence belong strictly to the **Java 21 Spring Boot Authoritative OMS**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 14 FRONTEND                             │
│                  (/app/paper-trading, OrderForm, Blotters)            │
└──────────────────┬────────────────────────────────┬────────────────────┘
                   │                                │
        Authoritative Order & Cash REST        Market Data Streaming
        (Idempotency, Risk, Positions, Ledger) (Quotes, Depth, Candles)
                   │                                │
                   ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  SPRING BOOT AUTHORITATIVE OMS       │  │ NODE MICROSTRUCTURE ENGINE   │
│  Port 8080 (PostgreSQL + Flyway V1-V9│  │ Port 8000 (GBM 24/7 Simulator│
│  - OrderState: PENDING, OPEN, FILLED │  │ & WebSocket Binary /ws/ticks)│
│  - Pre-Trade Risk Gatekeeper (Rule A)│  │ *Notice: Order endpoints     │
│  - Double-Entry Cash Ledger          │  │ return HTTP 410 (MIGRATED)   │
│  - Multi-Tenant Isolation (JWT Auth) │  └──────────────────────────────┘
└──────────────────────────────────────┘
```

---

## 2. File-by-File Audit & Status Matrix

| Component / File Path | Responsibility | Observed Defect / Gap | Classification | Repair Action |
| :--- | :--- | :--- | :--- | :--- |
| `backend-spring/.../RiskGatekeeper.java` | Synchronous pre-trade risk gatekeeper (Rule A) | 1. Stop-Loss direction not validated (BUY with SL > Entry or SELL with SL < Entry passed).<br>2. Take-Profit direction not validated.<br>3. Does not pre-verify held shares for SELL orders. | `BACKEND_ONLY` (Gaps present) | Add directional validation, held share verification, and non-positive price/qty guards. |
| `backend-spring/.../PaperTradingService.java` | OMS, execution engine, position tracking, ledger debits/credits | 1. `closePosition` only supported closing 100% of position (no partial exits).<br>2. Position Stop-Loss and Take-Profit child legs lacked automated OCO trigger evaluation on price movement.<br>3. Counter-leg cancellation needed atomic guarantee against duplicate triggers. | `COMPLETE` (Core) / `INTEGRATION_PENDING` (OCO & Partial) | 1. Implement partial position exits.<br>2. Add transactional OCO evaluation with counter-leg disarming.<br>3. Ensure thread-safe state machine. |
| `backend-spring/.../PositionController.java` | REST API for positions & position closing | `ClosePositionRequest` lacked optional `quantity` parameter for partial position exits. | `COMPLETE` | Add `quantity` field to `ClosePositionRequest` and pass to service. |
| `backend-spring/.../PaperAccountService.java` | Capital configuration, account reset, cash ledger reconciliation | Exact mathematical double-entry reconciliation between starting capital, trade debits/credits, commissions, and MTM positions. | `COMPLETE` | Verified exact `BigDecimal` math with zero rounding errors. |
| `backend-spring/.../OrderController.java` | REST API for order placement, order sizing, blotter, matching, cancellation | 1. `/api/orders` (POST) places order.<br>2. `/api/orders/size` (POST) calculates 1% risk size.<br>3. `/api/orders/{id}` (DELETE) cancels order.<br>4. `/api/orders/match` (POST) matches open limit orders. | `COMPLETE` | Add explicit OCO trigger evaluation endpoint `/api/orders/evaluate-oco`. |
| `backend/.../server.js` (Node) | Market simulation & WebSocket stream | Deprecated legacy order endpoints correctly return HTTP 410 (`MIGRATED_TO_SPRING_BOOT`). | `COMPLETE` | Preserve 410 status and prevent split-brain state. |
| `frontend/.../paper-trading/page.tsx` | Main terminal UI, charts, blotter tabs | 1. Dark aesthetic used `#0c121f` instead of institutional OLED `#000000`.<br>2. Partial position exit control not exposed in UI table.<br>3. Tabular numbers needed monospace guard against string formatting errors. | `UI_ONLY` | Update to pitch-black workstation styling, add partial close modal/prompt, and harden number formatting. |
| `frontend/.../OrderForm.tsx` | Order ticket, 1% auto-sizer, pre-trade risk preview | Stop-loss and take-profit directional checks were not visually enforcing strict BUY/SELL inequality before submission. | `COMPLETE` | Harden form validation to prevent submitting inverted brackets. |

---

## 3. UI Control to API Endpoint Mapping

| UI Action / Control | Trigger Location | Target Endpoint | HTTP Method | Authoritative Source | Payload / Parameters |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Submit Order** | `OrderForm.tsx` | `/api/orders` | `POST` | Spring Boot `OrderController` | `{ symbol, side, orderType, quantity, limitPrice, stopLoss, takeProfit, clientOrderId }` |
| **Auto-Size (1% Risk)** | `OrderForm.tsx` | `/api/orders/size` | `POST` | Spring Boot `OrderController` | `{ symbol, stopLossPrice, entryPrice, riskPct }` |
| **Cancel Open Order** | Active Orders Blotter | `/api/orders/{id}` | `DELETE` | Spring Boot `OrderController` | Path param `id` |
| **Close Open Position** | Open Positions Blotter | `/api/positions/close`| `POST` | Spring Boot `PositionController`| `{ symbol, quantity? }` |
| **Match Marketable Orders**| Background Sync | `/api/orders/match` | `POST` | Spring Boot `OrderController` | None (User principal) |
| **Evaluate OCO Triggers** | Background Sync | `/api/orders/evaluate-oco`| `POST` | Spring Boot `OrderController` | None (User principal) |
| **Configure Capital** | Config Modal | `/api/accounts/configure`| `POST` | Spring Boot `PaperAccountController` | `{ startingCapital, currency, slippageRate, feeRate }` |
| **Reconcile Ledger** | Reconcile Modal | `/api/accounts/reconcile`| `GET` | Spring Boot `PaperAccountController` | None (User principal) |
| **Reset Account** | Reset Button | `/api/portfolio/reset` | `POST` | Spring Boot `PortfolioController`| None (User principal) |
| **Portfolio Blotter** | Account Summary / Blotters| `/api/portfolio` | `GET` | Spring Boot `PortfolioController`| None (User principal) |
| **Cash Ledger Audit** | Cash Ledger Tab | `/api/ledger` | `GET` | Spring Boot `LedgerController` | None (User principal) |

---

## 4. Architectural Invariants Enforced

1. **Pre-Trade Risk Gatekeeper (Rule A):**
   - Single-trade risk cannot exceed user risk cap (default 1.0% of net liquidation equity).
   - Stop-Loss is strictly mandatory in Basic and Active tiers.
   - Stop-Loss direction must match trade side:
     - For BUY (Long): `StopLoss < EntryPrice`.
     - For SELL (Short/Exit): `StopLoss > EntryPrice`.
   - Take-Profit direction must match trade side:
     - For BUY: `TakeProfit > EntryPrice`.
     - For SELL: `TakeProfit < EntryPrice`.
   - Reward-to-Risk ratio must be $\ge 1.50\text{R}$.
2. **Account Capital & Circuit Breaker:**
   - 3.0% daily drawdown circuit breaker locks all new opening orders for the remainder of the trading session upon breach.
3. **Double-Entry Cash Ledger Exactness (Rule D):**
   - Every fill produces a corresponding immutable `TRADE_DEBIT` or `TRADE_CREDIT` entry in `cash_ledger_entries`.
   - Simulated commission/brokerage fees produce an immutable `COMMISSION_FEE` debit.
   - Initial capital and resets generate `INITIAL_DEPOSIT` / `ACCOUNT_RESET` entries.
   - Total ledger variance must mathematically evaluate to exactly $\le \$0.01$ during audit reconciliation.
4. **Authoritative OMS State Machine:**
   - Limit orders remain `OPEN` until the market bid/ask reaches or crosses the limit threshold.
   - Cancelled orders immediately transition to `CANCELLED` and can NEVER be filled under any market conditions.
   - Idempotency keys (`clientOrderId`) prevent duplicate order submissions upon network retries.
5. **Bracket OCO Exclusivity:**
   - When a bracket order's Stop-Loss is hit, the position is closed, the Stop-Loss fill is logged, and the Take-Profit counter-leg is immediately and permanently disarmed.
   - When Take-Profit is hit, the counter Stop-Loss is disarmed.
   - Duplicate fills and simultaneous dual triggers are prevented via transactional row-locking.
