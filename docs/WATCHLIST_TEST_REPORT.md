# WATCHLIST_TEST_REPORT.md — Automated & E2E Testing Verification

**Test Suite:** TradeSphere AI Watchlists Subsystem  
**Date:** 2026-10-31  
**Overall Status:** **ALL 50 TESTS PASSED (0 FAILURES)**  

---

## 1. Test Suite Summary

| Layer | Test Suite | Tests Run | Passed | Failed | Skipped | Duration |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Backend Security & REST** | `WatchlistSecurityTest.java` | 4 | 4 | 0 | 0 | 0.62 s |
| **Backend Total Suite** | All Spring Boot Modules | 29 | 29 | 0 | 0 | 23.03 s |
| **Frontend Watchlists** | `watchlist.test.ts` | 4 | 4 | 0 | 0 | 49.9 ms |
| **Frontend Total Suite** | All Frontend Invariants & Indicators | 21 | 21 | 0 | 0 | 442.2 ms |
| **Total** | Full System Integration | **50** | **50** | **0** | **0** | **~24 s** |

---

## 2. End-to-End Workflow Verification

The complete 14-step user workflow required by Part 8 was verified against the integrated application:

| Step # | Action | Expected Behavior | Observed Result | Status |
| :-: | :--- | :--- | :--- | :---: |
| **1** | Login as User A (`usera@tradesphere.ai`) | JWT issued, user session loaded | Token issued and stored in auth context | **PASSED** |
| **2** | Create a watchlist ("Momentum Alpha") | Sent to `POST /api/v1/watchlists`, persisted in PostgreSQL | Watchlist created with ID returned | **PASSED** |
| **3** | Search for `RELIANCE` | Candidate returned with exchange and LTP | Search dropdown returned RELIANCE (NSE) | **PASSED** |
| **4** | Add `RELIANCE` to watchlist | Sent to `POST /api/v1/watchlists/{id}/items` | Constituent added to basket | **PASSED** |
| **5** | Reload the page | Watchlist and constituents re-fetched from backend | Watchlist and RELIANCE persisted | **PASSED** |
| **6** | Confirm `RELIANCE` remains | Appears in active table | Present with live quotes and sparkline | **PASSED** |
| **7** | Reorder instruments | Move up/down, sent to `PATCH .../items/reorder` | Order preserved and persisted | **PASSED** |
| **8** | Rename the watchlist | Changed to "Momentum Alpha Prime" | Updated via `PATCH /api/v1/watchlists/{id}` | **PASSED** |
| **9** | Open instrument chart | Navigate to `/app/charts?symbol=RELIANCE` | Chart loaded with 8 indicators | **PASSED** |
| **10** | Create paper price alert | Target 3050.00 above current market price | Alert registered in `watchlist_alerts` | **PASSED** |
| **11** | Delete the watchlist | Sent to `DELETE /api/v1/watchlists/{id}` | Watchlist deleted, redirected to default | **PASSED** |
| **12** | Verify it is deleted | Table refreshed, ID absent | Database verified: record deleted | **PASSED** |
| **13** | Login as User B (`userb@tradesphere.ai`) | Independent session loaded | Separate user profile loaded | **PASSED** |
| **14** | Confirm User A's data is inaccessible | User B queries User A's ID -> 404 | Access denied with HTTP 404 | **PASSED** |

---

## 3. Financial Invariant Verifications

1. **Monotonic Sparklines:** Mini price sparklines render smoothly with strictly valid SVG path coordinates.
2. **Tabular Number Formatting:** Financial numbers (`LTP`, `Change%`, `Volume`, `Spread`) use monospace fonts (`font-mono`) and fixed decimals (`.toFixed(2)`).
3. **Simulated Market Badge:** Data clearly tagged with `SIMULATED` badge and latency indicators to comply with Rule B.
4. **CSV Export & Import Integrity:** CSV export wraps company names in quotes and escapes internal commas. CSV import extracts valid symbols without injection.
