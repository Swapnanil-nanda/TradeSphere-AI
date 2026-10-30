# Feature Inventory — TradeSphere AI
## Comprehensive Analysis of 33 Platform Features

**Document Version:** 1.0.0  
**Date:** October 31, 2026  
**Auditor:** Principal FinTech Software Architect & Senior Full-Stack Engineer  
**Status:** Canonical Reference

---

## Complete Inventory of Features (1 to 33)

### 1. Overview Dashboard
- **Existing Source File(s):** `frontend/src/app/page.tsx`, `frontend/src/app/terminal/page.tsx`
- **Existing Backend Endpoint:** `GET /api/portfolio`, `GET /api/accounts/me` (Spring Boot :8080)
- **Missing Backend Functionality:** Aggregate market breadth endpoint (Adv/Dec ratio, Sector heat index).
- **Missing Frontend Functionality:** Institutional dark redesign (`#090D12` / `#111922`), sector heatmap widget, quick blotter integration.
- **Database Requirements:** `paper_account`, `paper_positions`, `cash_ledger_entries`.
- **Dependencies:** Spring Boot `PortfolioService`, Next.js React client.
- **Required Test Cases:** Correct calculation of Total Net Liquidation, Day PnL, cash available vs margin locked, responsive grid collapse.

### 2. Professional Trading Terminal
- **Existing Source File(s):** `frontend/src/app/terminal/page.tsx`, `frontend/src/components/ChartContainer.tsx`, `frontend/src/components/OrderTicket.tsx`
- **Existing Backend Endpoint:** `WS /ws/ticks` (Node :8000), `POST /api/orders` (Spring :8080)
- **Missing Backend Functionality:** Bracket OCO cancellation webhook synchronization.
- **Missing Frontend Functionality:** Full dark institutional theme, hotkey order ticket triggers (e.g. `Shift+B` for Buy, `Shift+S` for Sell), multi-layout dock switcher.
- **Database Requirements:** `orders`, `paper_positions`, `instruments`.
- **Dependencies:** Lightweight Charts 4.x, Zustand transient tick store.
- **Required Test Cases:** Chart rendering at 60fps under 120ms tick stream without React re-render spikes; keyboard order shortcut triggers.

### 3. Market Explorer
- **Existing Source File(s):** `frontend/src/app/app/screener/page.tsx`, `frontend/src/lib/market-data.ts`
- **Existing Backend Endpoint:** `GET /api/instruments` (Spring Boot :8080), `GET /api/market/overview` (Node :8000)
- **Missing Backend Functionality:** Real-time sector classification and index constituent weighting.
- **Missing Frontend Functionality:** Unified multi-market tab switching (NSE vs NASDAQ), compact institutional table view.
- **Database Requirements:** `instruments` table with sector and exchange columns.
- **Dependencies:** React Query / SWR / API Client.
- **Required Test Cases:** Instrument search fuzzy matching; filtering by exchange (NSE vs NASDAQ).

### 4. Stock Screener
- **Existing Source File(s):** `frontend/src/app/app/screener/page.tsx`
- **Existing Backend Endpoint:** `GET /api/instruments/search` (Spring :8080), `SyntheticMarketDataProvider.search()`
- **Missing Backend Functionality:** Server-side multi-factor screening filter (filtering simultaneously by RSI, P/E, 20-EMA distance).
- **Missing Frontend Functionality:** Range slider controls for RSI, P/E, Market Cap; export screener results to CSV.
- **Database Requirements:** Materialized view or cached instrument metrics table.
- **Dependencies:** TanStack Table / custom compact data table.
- **Required Test Cases:** Multi-criteria filter query returns accurate intersection; zero results displays empty state without crashing.

### 5. Technical Analysis
- **Existing Source File(s):** `frontend/src/app/app/research/technical/page.tsx`, `frontend/src/lib/indicators.ts`
- **Existing Backend Endpoint:** `POST /api/v1/quant/research-runs` (Python :8100, `TechnicalAnalysisAgent`)
- **Missing Backend Functionality:** Historical multi-timeframe indicator caching (1m, 5m, 15m, 1h, 1d).
- **Missing Frontend Functionality:** Overlay toggle panel on the main canvas chart for dynamic indicator display (RSI pane, MACD sub-chart).
- **Database Requirements:** Historical candles cache.
- **Dependencies:** `indicators.ts` (SMA, EMA, RSI, BB, MACD, ATR, VWAP, Supertrend).
- **Required Test Cases:** RSI(14) matches Welles Wilder benchmark dataset (RSI = 70.46); Supertrend ratchet bands maintain upward trail.

### 6. Fundamental Analysis
- **Existing Source File(s):** `frontend/src/app/app/research/fundamental/page.tsx`
- **Existing Backend Endpoint:** `GET /api/instruments/{symbol}` (Spring :8080)
- **Missing Backend Functionality:** Detailed multi-quarter financial statements (Balance Sheet, Cash Flow, Income Statement) API.
- **Missing Frontend Functionality:** Financial statement comparison tabs (YoY vs QoQ), DuPont ROE breakdown tree.
- **Database Requirements:** `company_fundamentals` table with quarterly financial metrics.
- **Dependencies:** Lucide React icons, Tailwind table formatting.
- **Required Test Cases:** Ratio calculations handle zero or negative denominator gracefully (e.g. negative debt or loss-making P/E).

### 7. Financial News and Sentiment
- **Existing Source File(s):** `frontend/src/app/app/research/sentiment/page.tsx`, `quant-engine/agents/news_intelligence.py`
- **Existing Backend Endpoint:** `POST /api/v1/quant/research-runs` (Python :8100, `NewsIntelligenceAgent`)
- **Missing Backend Functionality:** Real-time RSS news aggregator scraping Indian financial outlets (Moneycontrol, Economic Times, LiveMint).
- **Missing Frontend Functionality:** Live sentiment timeline feed with color-coded VADER compound badges (`#35C69A` Bullish, `#EF6468` Bearish).
- **Database Requirements:** `news_articles` table with sentiment scores.
- **Dependencies:** Python NLTK / VADER sentiment analyzer.
- **Required Test Cases:** Headlines with positive keywords receive compound score > 0.05; neutral headlines score between -0.05 and +0.05.

### 8. Seven-Agent Research Command Center
- **Existing Source File(s):** `frontend/src/app/app/quant/multi-agent/page.tsx`, `quant-engine/agents/orchestrator.py`
- **Existing Backend Endpoint:** `POST /api/v1/quant/research-runs` (Python :8100)
- **Missing Backend Functionality:** Streaming agent execution steps via Server-Sent Events (SSE) or WebSocket so user sees agents activating in real time.
- **Missing Frontend Functionality:** Interactive agent workflow graph visualizing the activation pipeline (Intent Router $\to$ Active Agents $\to$ Evidence Verifier).
- **Database Requirements:** `research_runs` persistent storage.
- **Dependencies:** FastAPI, Pydantic v2, Python `asyncio`.
- **Required Test Cases:** Query regarding "technicals" only invokes TechnicalAnalysisAgent and skips news/wealth; evidence verification flags unsupported claims.

### 9. AI Forecasting
- **Existing Source File(s):** `frontend/src/app/app/quant/predictions/page.tsx`, `quant-engine/agents/forecasting.py`
- **Existing Backend Endpoint:** `POST /api/v1/quant/forecasts` (Python :8100)
- **Missing Backend Functionality:** Multi-factor calibration blending GARCH volatility modeling with drift momentum.
- **Missing Frontend Functionality:** Probability density cone chart visualizing the 50%, 80%, and 95% confidence intervals on the terminal chart.
- **Database Requirements:** None (stateless statistical computation).
- **Dependencies:** NumPy, SciPy `norm.ppf`.
- **Required Test Cases:** 95% confidence interval is strictly wider than 80% confidence interval; mean projection matches drift.

### 10. Historical Similarity Analysis
- **Existing Source File(s):** `frontend/src/app/app/research/analogues/page.tsx`, `quant-engine/agents/historical_similarity.py`
- **Existing Backend Endpoint:** `POST /api/v1/quant/analogues` (Python :8100)
- **Missing Backend Functionality:** Dynamic time warping (DTW) distance metric option in addition to Euclidean distance.
- **Missing Frontend Functionality:** Overlay of historical analogue trajectory onto the current price chart with projection fan.
- **Database Requirements:** Historical daily OHLCV dataset (minimum 500 bars per instrument).
- **Dependencies:** SciPy spatial distance.
- **Required Test Cases:** Top-K analogue matching ranks lowest Euclidean distance first; returns valid historical date intervals.

### 11. Quantitative Strategy Lab
- **Existing Source File(s):** `frontend/src/app/app/quant/strategy-lab/page.tsx`, `quant-engine/agents/strategy_lab.py`
- **Existing Backend Endpoint:** `POST /api/v1/quant/backtests` (Python :8100)
- **Missing Backend Functionality:** Multi-parameter grid search optimizer for algorithmic hyperparameters (e.g. optimal Fast/Slow EMA periods).
- **Missing Frontend Functionality:** Strategy rule builder UI allowing users to configure entry/exit conditions with sliders without writing code.
- **Database Requirements:** `saved_strategies` table.
- **Dependencies:** Pandas, NumPy.
- **Required Test Cases:** Parameter validation rejects invalid values (e.g. Fast EMA $\ge$ Slow EMA); risk per trade capped at 5%.

### 12. Historical Backtesting
- **Existing Source File(s):** `frontend/src/app/app/quant/backtesting/page.tsx`, `backend/src/quant/backtester.js`, `quant-engine/agents/strategy_lab.py`
- **Existing Backend Endpoint:** `POST /api/v1/quant/backtests` (Python :8100), `POST /api/backtest` (Node :8000)
- **Missing Backend Functionality:** Walk-forward out-of-sample backtest validation.
- **Missing Frontend Functionality:** Interactive equity curve chart with underwater drawdown visualization and trade entry/exit markers.
- **Database Requirements:** `backtest_results` cache.
- **Dependencies:** Lightweight Charts baseline series.
- **Required Test Cases:** Total trades $\ge$ win trades + loss trades; final equity reconciles with trade sum minus slippage and commission.

### 13. Paper Trading
- **Existing Source File(s):** `frontend/src/app/terminal/page.tsx`, `frontend/src/app/app/orders/page.tsx`, `backend-spring/src/.../OrderController.java`
- **Existing Backend Endpoint:** `POST /api/orders`, `DELETE /api/orders/{id}`, `GET /api/orders` (Spring :8080)
- **Missing Backend Functionality:** Trailing Stop-Loss order type.
- **Missing Frontend Functionality:** Quick-cancel hotkey (`Escape` key), bulk cancel open orders button.
- **Database Requirements:** `orders`, `order_audit_events`.
- **Dependencies:** Spring Boot JPA, PostgreSQL.
- **Required Test Cases:** Idempotency guard prevents duplicate order execution with same `clientOrderId`; insufficient cash rejects buy order.

### 14. Portfolio Management
- **Existing Source File(s):** `frontend/src/app/app/portfolio/page.tsx`, `backend-spring/src/.../PortfolioController.java`
- **Existing Backend Endpoint:** `GET /api/portfolio` (Spring :8080)
- **Missing Backend Functionality:** Real-time sector allocation percentage breakdown API.
- **Missing Frontend Functionality:** Interactive sector doughnut breakdown chart; position sizing rebalancer recommendation.
- **Database Requirements:** `paper_positions`, `cash_ledger_entries`.
- **Dependencies:** Spring Boot `PortfolioService`.
- **Required Test Cases:** Net Liquidation = Current Cash + $\sum(\text{Qty} \times \text{LTP})$; Day PnL reconciles with day-start equity.

### 15. Markowitz Portfolio Optimizer
- **Existing Source File(s):** `frontend/src/app/app/wealth/optimizer/page.tsx`, `quant-engine/agents/risk_management.py`
- **Existing Backend Endpoint:** `POST /api/v1/wealth/optimizations` (Python :8100)
- **Missing Backend Functionality:** Black-Litterman model integration blending market equilibrium with subjective views.
- **Missing Frontend Functionality:** Visual asset weight allocation bar with interactive constraint sliders (e.g. Max Weight per stock $\le 30\%$).
- **Database Requirements:** None.
- **Dependencies:** SciPy `optimize.minimize` (SLSQP solver).
- **Required Test Cases:** Portfolio weights sum to $1.0 \pm 10^{-5}$; no asset weight is negative (long-only constraint $w_i \ge 0$).

### 16. Maximum Sharpe Portfolio
- **Existing Source File(s):** `frontend/src/app/app/wealth/optimizer/page.tsx`, `quant-engine/agents/risk_management.py`
- **Existing Backend Endpoint:** `POST /api/v1/wealth/optimizations` (Python :8100)
- **Missing Backend Functionality:** Dynamic risk-free rate lookup from Reserve Bank of India (RBI) 91-day T-bill yields.
- **Missing Frontend Functionality:** Expected return vs volatility scatter plot showing the Capital Allocation Line (CAL).
- **Database Requirements:** None.
- **Dependencies:** NumPy, SciPy.
- **Required Test Cases:** Sharpe ratio of optimal portfolio is $\ge$ any individual asset's Sharpe ratio.

### 17. Global Minimum Variance Portfolio
- **Existing Source File(s):** `frontend/src/app/app/wealth/optimizer/page.tsx`, `quant-engine/agents/risk_management.py`
- **Existing Backend Endpoint:** `POST /api/v1/wealth/optimizations` (Python :8100)
- **Missing Backend Functionality:** Minimum variance under target return constraint.
- **Missing Frontend Functionality:** Comparison table displaying Max Sharpe vs Min Variance allocation differences.
- **Database Requirements:** None.
- **Dependencies:** SciPy quadratic optimization.
- **Required Test Cases:** Volatility of GMV portfolio is strictly $\le$ volatility of any constituent asset.

### 18. Efficient Frontier
- **Existing Source File(s):** `frontend/src/app/app/wealth/frontier/page.tsx`, `quant-engine/agents/risk_management.py`
- **Existing Backend Endpoint:** `GET /api/v1/wealth/optimizations/{id}/frontier` (Python :8100)
- **Missing Backend Functionality:** Dynamic frontier point resolution adjustment (10 to 50 points).
- **Missing Frontend Functionality:** Interactive Plotly or SVG hyper-surface curve with hover tooltips showing asset weight breakdowns at each point.
- **Database Requirements:** `optimization_runs` cache.
- **Dependencies:** SciPy, Next.js SVG chart.
- **Required Test Cases:** Frontier points curve is convex and strictly monotonically increasing in expected return with respect to standard deviation above GMV.

### 19. Mutual Fund Research
- **Existing Source File(s):** `frontend/src/app/app/wealth/mutual-funds/page.tsx`, `quant-engine/wealth/mutual_funds.py`
- **Existing Backend Endpoint:** `GET /api/v1/wealth/mutual-funds` (Python :8100)
- **Missing Backend Functionality:** Association of Mutual Funds in India (AMFI) live NAV synchronization job.
- **Missing Frontend Functionality:** Filter by Category (Large Cap, Mid Cap, Flexi Cap, Liquid), Sort by 3Y CAGR, Expense Ratio comparison.
- **Database Requirements:** `mutual_funds` table with historical NAV points.
- **Dependencies:** FastAPI, Pydantic.
- **Required Test Cases:** Searching for "Nifty Index" returns correct scheme records; filtering by category isolates matching schemes.

### 20. SIP Planner
- **Existing Source File(s):** `frontend/src/app/app/wealth/sip-planner/page.tsx`, `quant-engine/wealth/sip_calculator.py`
- **Existing Backend Endpoint:** `POST /api/v1/wealth/sip-plans` (Python :8100)
- **Missing Backend Functionality:** Tax-adjusted corpus projection (accounting for Indian Long-Term Capital Gains LTCG at 12.5%).
- **Missing Frontend Functionality:** Step-up vs Regular SIP comparison chart with interactive monthly contribution and step-up % sliders.
- **Database Requirements:** None.
- **Dependencies:** Exact compounding math engine.
- **Required Test Cases:** Step-up SIP total invested equals sum of monthly contributions; future corpus matches compound interest formula with periodic increases.

### 21. Monte Carlo Wealth Simulation
- **Existing Source File(s):** `frontend/src/app/app/wealth/scenarios/page.tsx`, `quant-engine/agents/risk_management.py`, `quant-engine/wealth/scenarios.py`
- **Existing Backend Endpoint:** `POST /api/v1/wealth/scenarios`, `POST /api/v1/wealth/monte-carlo` (Python :8100)
- **Missing Backend Functionality:** Fat-tailed Student-t return distribution generation to model black-swan crisis shocks.
- **Missing Frontend Functionality:** Multi-path fan chart displaying 1,000 simulated wealth trajectories with 10th, 50th, and 90th percentile bands.
- **Database Requirements:** None.
- **Dependencies:** NumPy vectorization.
- **Required Test Cases:** Empirical path drawdown correctly measures maximum peak-to-trough drop along each simulated path.

### 22. Options Chain
- **Existing Source File(s):** `frontend/src/app/app/risk/options/page.tsx`, `backend/src/quant/options_greeks.js`
- **Existing Backend Endpoint:** `GET /api/options-chain?symbol=NIFTY50` (Node :8000)
- **Missing Backend Functionality:** Multi-expiry date dropdown (Current weekly, Next weekly, Monthly expiry).
- **Missing Frontend Functionality:** Full-width institutional options matrix with highlighted At-the-Money (ATM) row and Call/Put split layout.
- **Database Requirements:** `options_contracts` cache.
- **Dependencies:** Node.js options pricing engine.
- **Required Test Cases:** Options chain returns exactly 11 symmetrical strike intervals around spot price; Call prices decrease with strike price.

### 23. Black-Scholes Pricing
- **Existing Source File(s):** `backend/src/quant/options_greeks.js`, `frontend/src/app/app/risk/options/page.tsx`
- **Existing Backend Endpoint:** `GET /api/options-chain` (Node :8000)
- **Missing Backend Functionality:** American and exotic option pricing models (Binomial Cox-Ross-Rubinstein tree).
- **Missing Frontend Functionality:** Standalone Black-Scholes calculator widget allowing user to input Spot, Strike, Expiry, Rate, Volatility and get Price.
- **Database Requirements:** None.
- **Dependencies:** Standard cumulative normal distribution function.
- **Required Test Cases:** Put-Call Parity holds: $C - P = S - K e^{-rT} \pm 10^{-4}$.

### 24. Options Greeks
- **Existing Source File(s):** `frontend/src/app/app/risk/greeks/page.tsx`, `backend/src/quant/options_greeks.js`
- **Existing Backend Endpoint:** `GET /api/options-chain` (Node :8000)
- **Missing Backend Functionality:** Second-order cross Greeks (Vanna, Volga, Charm).
- **Missing Frontend Functionality:** Greeks sensitivity surface chart plotting Delta and Gamma vs Spot Price movements.
- **Database Requirements:** None.
- **Dependencies:** IEEE double-precision math.
- **Required Test Cases:** ATM Call Delta $\approx 0.50$; Gamma $> 0$; Vega $> 0$; Theta $< 0$ (time decay).

### 25. Implied Volatility Analysis
- **Existing Source File(s):** `frontend/src/app/app/risk/options/page.tsx`, `backend/src/quant/options_greeks.js`
- **Existing Backend Endpoint:** `GET /api/options-chain` (Node :8000)
- **Missing Backend Functionality:** Analytical Newton-Raphson numerical solver resolving IV from live option market prices.
- **Missing Frontend Functionality:** Volatility smile / skew 2D chart plotting IV vs Strike price.
- **Database Requirements:** None.
- **Dependencies:** Newton-Raphson iteration.
- **Required Test Cases:** Newton-Raphson converges within 20 iterations to tolerance $\epsilon < 10^{-6}$; deep OTM options exhibit volatility skew.

### 26. Portfolio Risk Centre
- **Existing Source File(s):** `frontend/src/app/app/risk/page.tsx`, `backend-spring/src/.../PortfolioController.java`
- **Existing Backend Endpoint:** `GET /api/portfolio`, `GET /api/accounts/reconcile` (Spring :8080)
- **Missing Backend Functionality:** Portfolio Beta calculation against NIFTY50 benchmark; 95% and 99% one-sided VaR calculation.
- **Missing Frontend Functionality:** Circuit breaker proximity gauge (visual indicator of current daily loss vs 3.0% circuit breaker limit).
- **Database Requirements:** `portfolio_snapshots`, `daily_loss_trackers`.
- **Dependencies:** Spring Boot, PostgreSQL.
- **Required Test Cases:** Drawdown limit breach locks opening order submission; VaR calculation uses correct one-tailed critical z-values ($1.645$ for 95%, $2.326$ for 99%).

### 27. Simulated 20-Level DOM
- **Existing Source File(s):** `frontend/src/app/app/risk/depth/page.tsx`, `frontend/src/components/DepthOfMarket.tsx`, `backend/src/market_data/simulator.js`
- **Existing Backend Endpoint:** `GET /api/dom?symbol=RELIANCE` (Node :8000), `WS /ws/ticks`
- **Missing Backend Functionality:** Large-block order injection into depth ladder to simulate institutional iceberg orders.
- **Missing Frontend Functionality:** Bid/Ask cumulative volume depth bars and one-click order placement directly from ladder rungs.
- **Database Requirements:** None (in-memory microstructure simulation).
- **Dependencies:** Node.js 120ms tick loop.
- **Required Test Cases:** Level 1 Best Bid is strictly $\le$ Best Ask; 20 bids strictly sorted descending by price; 20 asks strictly sorted ascending by price.

### 28. Trade Journal
- **Existing Source File(s):** `frontend/src/app/app/risk/journal/page.tsx`
- **Existing Backend Endpoint:** `GET /api/portfolio` (Spring :8080)
- **Missing Backend Functionality:** Persistent trade journal notes and tag storage API (`POST /api/journal`, `GET /api/journal`).
- **Missing Frontend Functionality:** Setup categorization dropdown (e.g. Breakout, Pullback, Mean Reversion, Reversal), R:R multiple tracking, trade tagger.
- **Database Requirements:** `trade_journals` table linked to `orders` and `users`.
- **Dependencies:** Spring Boot JPA repository and controller.
- **Required Test Cases:** User can attach notes and emotion tags to an executed trade; tags persist across sessions.

### 29. AI Tilt Auditor
- **Existing Source File(s):** `frontend/src/app/app/risk/journal/page.tsx`, `backend/src/coach/ai_coach.js`
- **Existing Backend Endpoint:** `GET /api/coach?symbol=RELIANCE` (Node :8000)
- **Missing Backend Functionality:** Algorithmic tilt scoring engine detecting:
  - Revenge trading (placing order within 60 seconds of a stop-out).
  - Position sizing escalation (doubling quantity after a loss).
  - Stop-loss widening violation.
- **Missing Frontend Functionality:** Prominent Tilt Warning banner and discipline score badge (0 to 100) displayed in trading terminal.
- **Database Requirements:** Historical trade timestamps and sizing delta tracking.
- **Dependencies:** Behavioral rule evaluation engine.
- **Required Test Cases:** Rapid order after loss triggers "Revenge Trading Alert"; moving stop loss wider decreases discipline score.

### 30. PDF/JSON Research Reports
- **Existing Source File(s):** `quant-engine/reporting/pdf_generator.py`, `quant-engine/api/quant_router.py`
- **Existing Backend Endpoint:** `GET /api/v1/quant/reports/{id}?format=pdf` (Python :8100)
- **Missing Backend Functionality:** Support for custom branding logos and user-specific watermark metadata.
- **Missing Frontend Functionality:** "Export PDF Report" button in Multi-Agent, Strategy Lab, and Wealth pages triggering automatic browser download.
- **Database Requirements:** Research runs metadata.
- **Dependencies:** ReportLab, Python BytesIO.
- **Required Test Cases:** PDF generation returns valid binary starting with `%PDF-1.4`; document includes disclaimers and methodology version.

### 31. Learning Academy
- **Existing Source File(s):** `frontend/src/app/app/learning/guide/page.tsx`, `frontend/src/app/app/learning/strategies/page.tsx`
- **Existing Backend Endpoint:** None (Client-side static educational content).
- **Missing Backend Functionality:** User course completion progress tracking API (`POST /api/learning/progress`).
- **Missing Frontend Functionality:** Interactive quizzes at the end of each module with instant answer evaluation; progress tracker.
- **Database Requirements:** `user_learning_progress` table.
- **Dependencies:** Markdown renderer / structured course definitions.
- **Required Test Cases:** Progress counter increments when a user completes a module; answers scored correctly.

### 32. Saved Research Runs
- **Existing Source File(s):** `frontend/src/app/app/quant/saved/page.tsx`, `quant-engine/core/store.py`
- **Existing Backend Endpoint:** `GET /api/v1/quant/research-runs/{id}` (Python :8100)
- **Missing Backend Functionality:** Persistent search, pagination, and multi-run comparison API.
- **Missing Frontend Functionality:** Comparative side-by-side run viewer (comparing Run A vs Run B forecast and indicator regimes).
- **Database Requirements:** PostgreSQL or JSON filesystem store in `quant-engine/data/research_runs/`.
- **Dependencies:** Python file I/O or SQLite/Postgres.
- **Required Test Cases:** Saving research run generates unique ID; retrieving by ID returns identical parameters and synthesis summary.

### 33. Customisable Workspaces
- **Existing Source File(s):** `frontend/src/app/terminal/page.tsx`
- **Existing Backend Endpoint:** `PUT /api/users/me` (Spring :8080)
- **Missing Backend Functionality:** User workspace layout persistence API (`POST /api/users/workspace`, `GET /api/users/workspace`).
- **Missing Frontend Functionality:** Drag-and-drop or multi-preset dock manager (e.g. Layout 1: Chart Focus, Layout 2: DOM & Greeks, Layout 3: Research Grid).
- **Database Requirements:** `user_workspace_settings` table (storing JSON layout configuration).
- **Dependencies:** LocalStorage / Spring Boot user profile.
- **Required Test Cases:** Changing layout saves configuration to localStorage or backend; reload restores the saved layout seamlessly.
