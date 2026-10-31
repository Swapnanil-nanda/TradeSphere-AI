# WATCHLIST_AUDIT.md — TradeSphere AI Watchlists Audit

**Audit Timestamp:** 2026-10-31  
**Auditor:** Principal FinTech Systems Engineer, Senior AppSec Engineer & Product Architect  
**Scope:** Frontend Workstation, Spring Boot Backend, Database Persistence, Real-time Market Feeds & Multi-Tenant Security

---

## 1. Executive Summary

A comprehensive source code, architecture, and security audit was conducted on the Watchlists subsystem across `frontend/`, `backend-spring/`, `backend/`, and database migration scripts.

The audit revealed that while an initial basic schema (`V3__create_watchlists.sql`) and foundational Spring Boot service existed, the frontend was operating largely in disconnected local-storage mode (`UI_ONLY`). Real-time quote integration, drag-and-drop reordering, price/volume/indicator alerts, CSV import/export, and versioned `/api/v1/watchlists` endpoints required complete engineering and end-to-end integration.

---

## 2. Component Inventory

| Subsystem | File / Component | Role / Purpose | Current Status |
| :--- | :--- | :--- | :--- |
| **Frontend Page** | `frontend/src/app/app/watchlists/page.tsx` | Main Watchlists workspace page | `INTEGRATION_PENDING` (Migrating from localStorage to Spring Boot API) |
| **Frontend Table** | `frontend/src/components/app/WatchlistTable.tsx` | Tabular display of watchlist constituents | `COMPLETE` (Needs reorder handles & sparklines) |
| **Frontend Spotlight** | `frontend/src/components/app/StockCard.tsx` | Selected instrument card & metrics | `COMPLETE` (Fixed undefined variable references) |
| **Frontend API Client** | `frontend/src/lib/api-client.ts` | HTTP client for backend communication | `INTEGRATION_PENDING` (Needs `/api/v1/watchlists` methods) |
| **Backend Controller** | `backend-spring/.../WatchlistController.java` | REST endpoints for watchlists | `INTEGRATION_PENDING` (Needs `/api/v1/watchlists` & reorder/quotes) |
| **Backend Service** | `backend-spring/.../WatchlistService.java` | Business logic & tenant isolation | `COMPLETE` (Needs reorder & duplicate methods) |
| **Backend Repositories** | `WatchlistRepository.java`, `WatchlistItemRepository.java` | JPA repositories with user isolation | `COMPLETE` |
| **Database Migrations** | `V3__create_watchlists.sql` | PostgreSQL Flyway migration | `COMPLETE` (Needs `display_order` & alerts in V9) |
| **Market Data Feed** | `backend/src/market_data/simulator.js` | 24/7 Geometric Brownian Motion tick feed | `COMPLETE` |
| **WebSocket Client** | `frontend/src/lib/market-data/websocket-feed.ts` | High-frequency binary/JSON tick stream | `COMPLETE` |
| **Security & Auth** | `backend-spring/.../JwtAuthenticationFilter.java` | Stateless JWT Bearer validation | `COMPLETE` |
| **Automated Tests** | `backend-spring/.../WatchlistSecurityTest.java` | Multi-tenant IDOR isolation tests | `TESTING` (Needs comprehensive test coverage) |

---

## 3. Feature Classification Matrix

Every requirement from Part 3 & 4 has been audited and classified according to standard engineering lifecycle statuses:
- `NOT_IMPLEMENTED`: No code exists.
- `UI_ONLY`: Only UI mock exists; not persisted to authoritative backend.
- `BACKEND_ONLY`: API exists but frontend is not wired.
- `INTEGRATION_PENDING`: Components exist on both sides but need integration.
- `TESTING`: Integrated and currently undergoing automated test validation.
- `COMPLETE`: Fully verified end-to-end with persistent storage and security.
- `FAILED`: Implementation attempted but failing invariants or tests.

| # | Feature Requirement | Initial Audit Status | Target Production Status | Notes |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Create Watchlist | `UI_ONLY` | `COMPLETE` | Wire to `POST /api/v1/watchlists` with title validation |
| 2 | Rename Watchlist | `NOT_IMPLEMENTED` | `COMPLETE` | Wire to `PATCH /api/v1/watchlists/{id}` |
| 3 | Delete Watchlist | `UI_ONLY` | `COMPLETE` | Wire to `DELETE /api/v1/watchlists/{id}` (prevent deleting default) |
| 4 | Duplicate Watchlist | `NOT_IMPLEMENTED` | `COMPLETE` | Wire to `POST /api/v1/watchlists/{id}/duplicate` |
| 5 | Add Instruments | `UI_ONLY` | `COMPLETE` | Wire to `POST /api/v1/watchlists/{id}/items` |
| 6 | Remove Instruments | `UI_ONLY` | `COMPLETE` | Wire to `DELETE /api/v1/watchlists/{id}/items/{itemId}` |
| 7 | Drag-and-Drop / Reordering | `NOT_IMPLEMENTED` | `COMPLETE` | Wire to `PATCH /api/v1/watchlists/{id}/items/reorder` |
| 8 | Instrument Search | `COMPLETE` | `COMPLETE` | Search across NSE and US equities with debouncing |
| 9 | Exchange Filtering | `NOT_IMPLEMENTED` | `COMPLETE` | Filter by NSE, BSE, NASDAQ, NYSE, ALL |
| 10 | Asset-Category Filtering | `NOT_IMPLEMENTED` | `COMPLETE` | Filter by Equities, Indices, ETFs, Derivatives |
| 11 | Price Sorting | `NOT_IMPLEMENTED` | `COMPLETE` | Ascending / descending numeric sorting |
| 12 | Percentage-Change Sorting | `NOT_IMPLEMENTED` | `COMPLETE` | Real-time gainers / losers rank sorting |
| 13 | Volume Sorting | `NOT_IMPLEMENTED` | `COMPLETE` | Liquidity and volume sorting |
| 14 | Alphabetical Sorting | `NOT_IMPLEMENTED` | `COMPLETE` | Symbol and name A-Z / Z-A sorting |
| 15 | Persistent User Storage | `UI_ONLY` | `COMPLETE` | PostgreSQL Flyway + Spring Boot JPA tenant isolation |
| 16 | Mini Price Charts (Sparklines) | `NOT_IMPLEMENTED` | `COMPLETE` | Inline SVG sparklines showing recent candle trajectory |
| 17 | Instrument Spotlight | `COMPLETE` | `COMPLETE` | Real-time detail card with day range and spread |
| 18 | Price Alerts | `NOT_IMPLEMENTED` | `COMPLETE` | Price above / below threshold alerts |
| 19 | Volume Alerts | `NOT_IMPLEMENTED` | `COMPLETE` | Volume spike alerts |
| 20 | Indicator-Based Alerts | `NOT_IMPLEMENTED` | `COMPLETE` | RSI overbought/oversold and EMA crossover alerts |
| 21 | Instrument Comparison | `NOT_IMPLEMENTED` | `COMPLETE` | Side-by-side metric and valuation comparison modal |
| 22 | CSV Import / Export | `NOT_IMPLEMENTED` | `COMPLETE` | Export watchlist to CSV and import symbol lists |
| 23 | Quick Chart Navigation | `COMPLETE` | `COMPLETE` | Link to `/app/charts?symbol={sym}` |
| 24 | Quick Paper-Order Navigation| `COMPLETE` | `COMPLETE` | Link to `/app/paper-trading?symbol={sym}` |

---

## 4. Security & Architecture Findings

1. **Authentication Enforcement:** All `/api/watchlists` and `/api/v1/watchlists` endpoints require authenticated JWT Bearer tokens with active `UserPrincipal`.
2. **Multi-Tenant Isolation (IDOR / BOLA Prevention):**
   - The Spring Boot service strictly queries `watchlistRepository.findByIdAndUserId(id, userId)`.
   - If User B queries or attempts to delete User A's watchlist ID, the service returns `404 Not Found`, revealing zero existence information about other users' data.
3. **Data Integrity & Simulated Labeling:**
   - Synthetic GBM market data is explicitly marked `SIMULATED` across all quote badges and UI headers to comply with regulatory clarity.
   - Prices cannot be spoofed by client-side requests; all quotes are authoritatively calculated or validated server-side.
4. **Resilient Local Synchronization:**
   - To guarantee zero downtime if the backend is waking up from idle or in demo preview, the frontend implements an optimistic offline sync with `localStorage` fallback.

---

## 5. Audit Recommendations & Action Plan

1. **Migration V9:** Create `V9__enhance_watchlists_ordering_and_alerts.sql` to add `display_order` to `watchlist_items` and create `watchlist_alerts` table.
2. **Spring Boot Updates:**
   - Expose dual route `@RequestMapping({"/api/v1/watchlists", "/api/watchlists"})`.
   - Implement `PATCH /{id}` (rename), `POST /{id}/duplicate`, `PATCH /{id}/items/reorder`, and `GET /{id}/quotes`.
   - Implement Alert management endpoints (`GET /api/v1/watchlists/alerts`, `POST /api/v1/watchlists/alerts`, `DELETE /api/v1/watchlists/alerts/{id}`).
3. **Frontend Redesign:**
   - Apply TradeSphere Institutional Dark styling (`#090D12` background, `#111922` panels, `#25313D` borders, tabular numerals).
   - Implement all 24 capabilities with rich interactive controls, CSV handling, mini sparklines, and alert triggers.
4. **Verification & Testing:**
   - Expand `WatchlistSecurityTest.java` with tests for User A vs. User B, XSS sanitization, reordering, and alert isolation.
