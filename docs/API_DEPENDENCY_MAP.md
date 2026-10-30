# API DEPENDENCY MAP — APEXTRADEOS / TRADESPHERE AI

**Date:** October 31, 2026  
**Auditor:** Principal Software Architect  
**Scope:** Route-by-route and component-by-component dependency audit across all frontend pages, API clients, and backend endpoints.

---

## 1. Frontend-to-Backend Route Dependency Matrix

This matrix maps every Next.js page and UI component to its respective backend endpoint, protocol, transport target, and fallback behavior.

| Page / Route | Component | Backend Endpoint | Protocol | Transport Target | Fallback / Failure Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** (Home) | `HeroQuotes` | `GET /api/tickers` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/page.tsx:35](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/page.tsx#L35)) | Silent error; renders empty ticker bar if :8000 is down. |
| **`/login`** | `LoginForm` | `POST /api/auth/login` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/login/page.tsx:21](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/login/page.tsx#L21)) | Displays red error banner: "Unable to authenticate with backend server." |
| **`/register`** | `RegisterForm` | `POST /api/auth/register` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/register/page.tsx:24](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/register/page.tsx#L24)) | Displays red error banner: "Unable to connect to backend registration service." |
| **`/markets`** | `MarketGrid` | `GET /api/tickers` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/markets/page.tsx:24](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/markets/page.tsx#L24)) | Silent error; renders empty table if :8000 is down. |
| **`/terminal`** | `TerminalPage` | `GET /api/tickers` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/terminal/page.tsx:35](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/terminal/page.tsx#L35)) | Console warning: "Backend connecting..."; displays empty watchlist. |
| **`/terminal`** | `TerminalPage` | `GET /api/portfolio` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/terminal/page.tsx:48](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/terminal/page.tsx#L48)) | Console warning: "Failed to load portfolio"; metrics show null/zero. |
| **`/terminal`** | `TerminalPage` | `GET /api/candles` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/terminal/page.tsx:60](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/terminal/page.tsx#L60)) | Console warning: "Failed to load candles"; chart shows blank canvas. |
| **`/terminal`** | `TerminalPage` | `WS /ws/ticks` | WebSocket | Hardcoded `ws://localhost:8000/ws/ticks` ([src/app/terminal/page.tsx:89](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/terminal/page.tsx#L89)) | Attempts reconnect every 2000ms indefinitely; WS indicator shows red. |
| **`/terminal`** | `OrderTicket` | `POST /api/orders` | HTTP REST | Hardcoded `http://localhost:8000` ([src/components/OrderTicket.jsx:71](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/components/OrderTicket.jsx#L71)) | Displays error banner with Pre-Trade Risk Gatekeeper reason. |
| **`/terminal`** | `OptionsChain` | `GET /api/options-chain` | HTTP REST | Hardcoded `http://localhost:8000` ([src/components/OptionsChain.jsx:12](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/components/OptionsChain.jsx#L12)) | Displays error state; options ladder remains unrendered. |
| **`/terminal`** | `Backtester` | `POST /api/backtest` | HTTP REST | Hardcoded `http://localhost:8000` ([src/components/Backtester.jsx:15](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/components/Backtester.jsx#L15)) | Displays error message: "Failed to execute backtest." |
| **`/terminal`** | `AICoachModal` | `GET /api/coach` | HTTP REST | Hardcoded `http://localhost:8000` ([src/components/AICoachModal.jsx:9](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/components/AICoachModal.jsx#L9)) | Falls back to generic tip: "Always size positions using the 1% risk rule." |
| **`/terminal`** | `PortfolioBlotter` | `POST /api/positions/close` | HTTP REST | Hardcoded `http://localhost:8000` ([src/app/terminal/page.tsx:196](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/src/app/terminal/page.tsx#L196)) | Console error: "Failed to close position." |
| **`/app/dashboard`** | `DashboardView` | `GET /api/portfolio` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Falls back to labeled `STANDALONE_DEMO` account (₹10,00,000 equity). |
| **`/app/dashboard`** | `DashboardView` | `GET /api/tickers` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Falls back to 10 simulated demo fixtures labeled with `isSimulated: true`. |
| **`/app/charts`** | `TradingViewChart` | `GET /api/candles` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Falls back to deterministic mathematical demo candles generator. |
| **`/app/paper-trading`**| `OrderForm` | `POST /api/orders` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Displays user feedback banner; fails if Spring Boot is unreachable. |
| **`/app/paper-trading`**| `BlotterTables` | `GET /api/portfolio` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Displays cached or demo portfolio blotter. |
| **`/app/portfolio`** | `PortfolioView` | `GET /api/portfolio` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Displays net liquidation and open positions from `apiClient`. |
| **`/app/portfolio`** | `LedgerView` | `GET /api/ledger` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Displays cash ledger entries or empty state. |
| **`/app/portfolio`** | `ReconcileBtn` | `GET /api/accounts/reconcile`| HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Generates live mathematical reconciliation audit report. |
| **`/app/screener`** | `ScreenerView` | `GET /api/screener` | HTTP REST | `apiClient` (Mock in `apiClient:421`) | Returns hardcoded 7-stock screener list if backend route unmapped. |
| **`/app/research`** | `ResearchView` | `GET /api/research` | HTTP REST | `apiClient` (Mock in `apiClient:432`) | Returns structured fundamental & technical dossier. |
| **`/app/risk`** | `RiskDashboard` | `GET /api/coach` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Falls back to deterministic risk analysis object. |
| **`/app/watchlists`** | `WatchlistView` | `GET /api/watchlists` | HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Renders user watchlists from Spring Boot or local fallback. |
| **`/app/settings`** | `SettingsForm` | `POST /api/accounts/configure`| HTTP REST | `apiClient` via Next.js Rewrite (`:8080`) | Updates virtual capital, slippage, and fee rates in DB/memory. |

---

## 2. Inventory of Hardcoded Endpoint References

The audit detected 14 instances of hardcoded `localhost:8000` and 2 instances of hardcoded `localhost:8080` in frontend source code. These prevent clean deployment to staging or production environments.

### 2.1 Hardcoded `localhost:8000` Instances (Bypassing `NEXT_PUBLIC_API_URL`)

| # | File Path | Line | Code Snippet | Impact |
| :---: | :--- | :---: | :--- | :--- |
| 1 | `frontend/src/app/terminal/page.tsx` | 14 | `const API_BASE = 'http://localhost:8000';` | Terminal REST calls fail in cloud deployment. |
| 2 | `frontend/src/app/terminal/page.tsx` | 15 | `const WS_URL = 'ws://localhost:8000/ws/ticks';` | Terminal WebSocket fails in cloud deployment. |
| 3 | `frontend/src/app/login/page.tsx` | 21 | `fetch('http://localhost:8000/api/auth/login', ...)` | User login fails when frontend is hosted on Vercel. |
| 4 | `frontend/src/app/register/page.tsx` | 24 | `fetch('http://localhost:8000/api/auth/register', ...)` | Registration fails when frontend is hosted on Vercel. |
| 5 | `frontend/src/app/page.tsx` | 35 | `fetch('http://localhost:8000/api/tickers')` | Home page ticker carousel fails in production. |
| 6 | `frontend/src/app/markets/page.tsx` | 24 | `fetch('http://localhost:8000/api/tickers')` | Markets page table fails in production. |
| 7 | `frontend/src/components/OrderTicket.jsx` | 71 | `fetch('http://localhost:8000/api/orders', ...)` | Terminal order placement fails in production. |
| 8 | `frontend/src/components/OptionsChain.jsx` | 12 | `fetch('http://localhost:8000/api/options-chain?symbol=' + symbol)` | Options chain fails in production. |
| 9 | `frontend/src/components/Backtester.jsx` | 15 | `fetch('http://localhost:8000/api/backtest', ...)` | Backtest executions fail in production. |
| 10 | `frontend/src/components/AICoachModal.jsx` | 9 | `fetch('http://localhost:8000/api/coach?symbol=' + symbol)` | Contextual AI coach fails in production. |
| 11 | `frontend/src/legacy_pages_backup/MarketsPage.jsx` | 21 | `fetch('http://localhost:8000/api/tickers')` | Legacy backup file reference. |
| 12 | `frontend/src/legacy_pages_backup/AboutPage.jsx` | 11 | `fetch('http://localhost:8000/api/tickers')` | Legacy backup file reference. |
| 13 | `frontend/src/legacy_pages_backup/TerminalPage.jsx` | 12 | `const API_BASE = 'http://localhost:8000';` | Legacy backup file reference. |
| 14 | `frontend/src/legacy_pages_backup/TerminalPage.jsx` | 13 | `const WS_URL = 'ws://localhost:8000/ws/ticks';` | Legacy backup file reference. |

### 2.2 Hardcoded `localhost:8080` Instances

| # | File Path | Line | Code Snippet | Impact |
| :---: | :--- | :---: | :--- | :--- |
| 1 | `frontend/src/lib/api-client.ts` | 194 | `(typeof window !== 'undefined' ? '' : 'http://localhost:8080')` | SSR fallback defaults to localhost:8080. |
| 2 | `frontend/src/lib/market-data/synthetic-provider.ts` | 23 | `const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:8080';` | Provider fallback defaults to localhost:8080. |
| 3 | `frontend/next.config.mjs` | 2 | `const backendUrl = ... \|\| 'http://localhost:8080';` | Rewrite target defaults to localhost:8080. |

---

## 3. Next.js API Rewrite Architecture

In [frontend/next.config.mjs](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/frontend/next.config.mjs#L1-L22):
```javascript
const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  }
};
```

### Analysis of Rewrite Behavior:
1. In the browser (`typeof window !== 'undefined'`), `apiClient` uses `BACKEND_BASE = ''` (relative URL).
2. Any request to `/api/portfolio` goes to the Next.js server (`http://localhost:3000/api/portfolio`).
3. Next.js checks `rewrites()` and proxies the request to `http://localhost:8080/api/portfolio` (Spring Boot).
4. **The Flaw:** This rewrite mechanism applies **only to `apiClient`** in `/app/*`. The `/terminal`, `/login`, and `/register` pages bypass this mechanism completely by calling `fetch('http://localhost:8000/api/...')` directly.
