# User Flows, UI Specification & Security Policies — ApexTradeOS

## 1. User Flows Across Experience Modes

### Flow 1: Novice Trader (Basic Guided Mode)
1. User opens the terminal; the **Basic Guided** mode is active by default.
2. The user sees a clean chart of NIFTY 50 / RELIANCE with EMA-20 (green line = uptrend guide) and clear Support/Resistance bands.
3. The AI Coach summary states in plain English: *"Market in strong consolidation near Support. Key level: ₹2,960."*
4. User selects Buy. The **1% Risk Auto-Sizer** automatically reads their ₹10,00,000 equity, detects the proposed stop at ₹2,955, and caps the quantity so total risk cannot exceed ₹10,000 (1%).
5. The order executes with mandatory Stop-Loss protection.

### Flow 2: Active Trader Mode
1. User switches to **Active Trader** mode via the top selector.
2. The interface reveals multi-timeframe charts (1m/5m/15m), VWAP, Bollinger Bands, and RSI(14).
3. The user places a Bracket OCO order with explicit Stop-Loss and Take-Profit target prices.
4. The background OCO engine monitors ticks; upon target fill, the Stop-Loss leg is instantly canceled.
5. Trade details are automatically recorded in the Trade Journal with R-multiple calculation.

### Flow 3: Pro Quant Mode
1. User switches to **Pro Quant** mode.
2. The 20-level Level 2 DOM (Depth of Market) ladder opens, visualizing institutional bid/ask liquidity clusters.
3. User opens the **Options Chain** tab, viewing real-time Black-Scholes Greeks ($\Delta, \Gamma, \Theta, \nu, \text{IV}$).
4. User navigates to the **Strategy Backtester**, selects EMA Crossover or RSI Mean Reversion, executes a vectorized backtest over 500 historical candles, and inspects the equity curve, Sharpe ratio, and drawdown metrics.

---

## 2. UI Specifications & Design Tokens
- **Theme:** Institutional Dark Mode (Deep Charcoal `#0b0f17`, Slate `#161f30`, Accent Blue `#2563eb`).
- **Typography:** Inter / Google Sans Flex with monospace numbers for prices and order books (`tabular-nums`).
- **Color Coding:**
  - Bullish / Profit / Up Tick: Emerald Green `#10b981` (Background flash: `#064e3b`).
  - Bearish / Loss / Down Tick: Rose Red `#f43f5e` (Background flash: `#4c0519`).
  - Neutral / Indicators: Electric Amber `#f59e0b` (VWAP) / Cyan `#06b6d4` (EMA).

---

## 3. Security, Risk & Guardrail Policies
1. **Pre-Trade Risk Invariant:** No order bypasses risk limits.
2. **Circuit Breaker:** Trading locks at 3% daily drawdown to prevent catastrophic tilt.
3. **Data Classification:** Simulated / synthetic market ticks are explicitly watermarked `[PAPER / SIMULATED FEED]` in the UI to prevent any ambiguity.
4. **Credential Isolation:** Broker API keys (when added) are stored strictly in local `.env` and never exposed to client-side bundles.
