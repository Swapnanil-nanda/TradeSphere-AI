# Test Acceptance Criteria — TradeSphere AI
## Comprehensive Quality Assurance & Verification Standards

**Document Version:** 1.0.0  
**Date:** October 31, 2026  
**Author:** Principal FinTech Systems QA & Reliability Engineer  
**Status:** Canonical Acceptance Standard

---

## 1. Core Invariant Test Suites

### 1.1 Invariant A: Pre-Trade Risk Gatekeeper (Rule A)
- **Standard:** No order shall ever be executed without passing the synchronous Pre-Trade Risk Gatekeeper.
- **Test Case A1 (Risk Cap Breach):** Submit an order risking ₹48,500 on a ₹10,00,000 equity account (4.85% risk).
  - *Expected Outcome:* Immediate `HTTP 422 Unprocessable Entity` with `code: "SINGLE_TRADE_MAX_LOSS_EXCEEDED"`. Zero changes to cash ledger or positions.
- **Test Case A2 (Safe Position Sizing Zero-Unit Fallback):** Request position sizing for an instrument where single-share risk (Entry ₹25,000, SL ₹5,000 $\implies$ ₹20,000 risk) exceeds the 1.0% risk cap (₹10,000).
  - *Expected Outcome:* API and UI return strictly `recommendedQuantity: 0` and `riskBreached: true`. Sizing must NEVER round up to 1 share.
- **Test Case A3 (Daily Drawdown Circuit Breaker):** Simulate consecutive realized/unrealized losses reaching 3.0% of day-start equity.
  - *Expected Outcome:* All subsequent opening order requests are rejected with `HTTP 422 (DAILY_DRAWDOWN_LIMIT_REACHED)`. Closing orders remain permitted.

### 1.2 Invariant B: Multi-Tenant Isolation & Authentication Guard
- **Test Case B1 (Unauthenticated Access):** Send unauthenticated `GET /api/portfolio`, `POST /api/orders`, or `GET /api/watchlists`.
  - *Expected Outcome:* Strict `HTTP 401 Unauthorized`. No data leakage of any demo user.
- **Test Case B2 (Cross-Tenant Mutation):** User B attempts to delete User A's custom watchlist (`DELETE /api/watchlists/{user_a_id}`).
  - *Expected Outcome:* `HTTP 404 Not Found` (ownership isolation). Database record remains intact.

### 1.3 Invariant C: Idempotency & Concurrency Stress Test
- **Test Case C1 (Duplicate Submission):** Submit two identical orders simultaneously with the same `clientOrderId` (UUID v4).
  - *Expected Outcome:* The first order fills (`HTTP 201 Created`). The second request returns the exact same order receipt without re-executing or double-debiting cash. Total position quantity equals 1 order volume.

### 1.4 Invariant D: Financial Ledger Reconciliation
- **Test Case D1 (Zero-Variance Balance Audit):** Place and fill multiple BUY and SELL paper orders with slippage and exchange fees. Call `GET /api/accounts/reconcile`.
  - *Expected Outcome:* Formula holds with zero floating-point variance:
    $$\text{Actual Cash} - (\text{Starting Cash} + \text{Movements}) == \text{₹0.0000}$$
    Response returns `reconciled: true` and `cashVariance: 0.00`.

---

## 2. 33-Feature Specific Acceptance Criteria

| # | Feature | Verification Standard & Acceptance Criteria |
| :---: | :--- | :--- |
| **1** | **Overview Dashboard** | Net Liquidation Value updates dynamically with live tick prices; market breadth Adv/Dec ratio matches simulated ticker pool. |
| **2** | **Trading Terminal** | TradingView Lightweight Charts canvas runs smoothly at 60fps under 120ms tick stream; crosshair displays exact OHLCV. |
| **3** | **Market Explorer** | Searching "RELIANCE" filters instantaneously; exchange tabs toggle cleanly between NSE equities and US equities. |
| **4** | **Stock Screener** | Setting RSI slider between 30 and 50 filters tickers strictly within that regime; results exportable to clean CSV. |
| **5** | **Technical Analysis** | RSI(14) calculation matches Welles Wilder benchmark (70.46 on standard 14-period dataset); EMA-20 smoothing multiplier is $2/(20+1)$. |
| **6** | **Fundamental Analysis** | P/E, P/B, ROE, and Debt/Equity display exact financial ratios; negative earnings flag loss-making status without NaN. |
| **7** | **News & Sentiment** | VADER sentiment compounds headlines into Bullish (>0.05), Bearish (<-0.05), or Neutral; entity tagging matches symbol. |
| **8** | **Seven-Agent Command** | Intent routing selectively invokes only relevant agents (e.g. query on "technicals" leaves news and wealth dormant); evidence verification runs. |
| **9** | **AI Forecasting** | 95% confidence interval is strictly wider than 80% CI; returns calibrated probabilistic price returns for 5d, 10d, 20d. |
| **10** | **Historical Similarity** | Normalized Euclidean matching returns top 5 analogous historical windows ranked by distance ascending. |
| **11** | **Strategy Lab** | Parameter validation rejects invalid strategy inputs (e.g. Fast EMA $\ge$ Slow EMA); risk per trade capped at 5%. |
| **12** | **Backtesting** | Vectorized backtester computes Sharpe, Sortino, Max Drawdown %, and Win Rate % with exact daily equity curve matching trade sum. |
| **13** | **Paper Trading** | Market orders execute at Ask (Buy) / Bid (Sell) plus slippage; Limit orders enter OPEN state if unmarketable; cancel updates status. |
| **14** | **Portfolio Management** | Positions aggregate long/short units; average buy price adjusts on partial fills; realized PnL computed on position reduction. |
| **15** | **Markowitz Optimizer** | MPT SLSQP solver returns asset weights summing to $1.0000 \pm 10^{-5}$; long-only constraint enforces $w_i \ge 0$. |
| **16** | **Maximum Sharpe** | Tangency portfolio Sharpe ratio is strictly $\ge$ any individual constituent asset's Sharpe ratio. |
| **17** | **Global Min Variance** | GMV portfolio volatility is strictly $\le$ any constituent asset's volatility. |
| **18** | **Efficient Frontier** | Frontier curve is convex and strictly monotonically increasing in expected return with respect to standard deviation above GMV. |
| **19** | **Mutual Fund Research** | AMFI scheme query returns matching NAV records; category filters isolate Large Cap vs Flexi Cap accurately. |
| **20** | **SIP Planner** | Annual step-up SIP calculation compounds monthly investments; total invested equals exact summation of contribution installments. |
| **21** | **Monte Carlo Wealth** | Simulates 1,000 paths; empirical path max drawdown captures peak-to-trough drops along each simulated path. |
| **22** | **Options Chain** | Multi-strike chain returns 11 strikes around spot price; Call prices strictly decrease as strike price increases. |
| **23** | **Black-Scholes Pricing** | Analytical Call and Put prices satisfy Put-Call Parity: $C - P = S - K e^{-rT} \pm 10^{-4}$. |
| **24** | **Options Greeks** | Delta, Gamma, Theta, Vega match analytical partial derivatives; ATM Call Delta $\approx 0.50$, Gamma $> 0$, Vega $> 0$, Theta $< 0$. |
| **25** | **Implied Volatility** | Newton-Raphson IV solver converges within 20 iterations to tolerance $\epsilon < 10^{-6}$; volatility smile displays OTM skew. |
| **26** | **Portfolio Risk Centre** | Displays 95% and 99% one-sided VaR using parametric Gaussian and historical methods; circuit breaker gauge alerts at 2.5% loss. |
| **27** | **Simulated 20-Level DOM** | Best Bid is strictly $\le$ Best Ask; bids sorted descending by price; asks sorted ascending by price across all 20 levels. |
| **28** | **Trade Journal** | User can attach setup categories (Breakout, Pullback) and emotional tags to executed trades; persisted across user sessions. |
| **29** | **AI Tilt Auditor** | Placing a new order within 60 seconds of a stop-out triggers "Revenge Trading Alert"; moving stop loss wider flags discipline warning. |
| **30** | **PDF/JSON Reports** | PDF generator outputs valid `%PDF-1.4` binary stream containing metadata tables, verification audit stamps, and disclosures. |
| **31** | **Learning Academy** | Interactive learning modules render educational content; quizzes score user understanding instantly. |
| **32** | **Saved Research Runs** | Research run stored with unique ID; retrieving by ID reproduces identical parameters, specialist outputs, and synthesis summary. |
| **33** | **Custom Workspaces** | Workspace layout preset persists across reloads; toggling between Basic, Active, and Pro reconfigures layout instantly. |

---

## 3. Performance & Resource Constraints

1. **Vercel Hobby Plan Memory Ceiling:**
   - Client bundle must remain $\le 30\text{ MB}$ uncompressed (well below 250 MB ceiling).
   - Serverless function runtime memory must not exceed $80\text{ MB}$ (well below 512 MB ceiling).
   - Initial First Load JavaScript must remain $\le 125\text{ kB}$.
2. **WebSocket Latency:**
   - Ticks broadcasted on `/ws/ticks` every 120ms with local network transit latency $\le 5\text{ms}$.
3. **UI Thread Responsiveness:**
   - Chart canvas redraws on transient Zustand state changes without re-rendering parent React components or causing dropped frames.
