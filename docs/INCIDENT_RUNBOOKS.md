# TradeSphere AI / ApexTradeOS — Production Incident Runbooks & SOPs

This document details the authoritative Standard Operating Procedures (SOPs) for triage, mitigation, recovery, and post-mortem analysis of operational incidents across the TradeSphere AI distributed infrastructure.

---

## 1. Incident Classification & Severity Matrix

| Severity | Definition | Target MTTA | Target MTTR | Examples |
|---|---|---|---|---|
| **P1 — Critical** | Complete service outage, data corruption, financial calculation invariant violation, or ledger discrepancy. | < 5 mins | < 30 mins | Pre-trade risk gatekeeper failure, database down, order blotter corrupted. |
| **P2 — Major** | Partial service degradation affecting active traders, but core safety invariants remain intact. | < 15 mins | < 2 hours | 20-level DOM WebSocket latency > 500ms, external market feed dropout. |
| **P3 — Moderate** | Non-critical component or background analytic worker failure with working fallbacks. | < 1 hour | < 8 hours | Quant Python engine slow response, PDF report generation queue stall. |
| **P4 — Minor** | Cosmetic defects, minor metric calculation delays, non-blocking UI quirks. | < 4 hours | < 24 hours | Color rendering discrepancy in dark mode, tooltips misaligned. |

---

## 2. Standard Operating Procedures (SOPs)

### Runbook 1: Pre-Trade Risk Circuit Breaker Triggered (3.0% Daily Drawdown Lock)
- **Trigger:** Account `tradingLocked = true` with reason `Daily drawdown circuit breaker engaged`.
- **Root Cause:** Realized + Unrealized intraday losses exceeded the user's configured daily drawdown threshold (default: 3.0% of day-start net liquidation equity).
- **Invariants:** Under **Rule A**, no new opening orders can be placed. Existing positions may ONLY be closed.
- **Verification Steps:**
  1. Inspect user account status:
     ```bash
     curl -H "Authorization: Bearer <ADMIN_OR_USER_TOKEN>" http://localhost:8080/api/accounts/me
     ```
  2. Verify that `tradingLocked` is `true` and `dailyPnLPct <= -3.0%`.
  3. Verify that square-off (`POST /api/positions/close`) continues to succeed, while opening orders (`POST /api/orders`) receive `HTTP 400 Risk Gatekeeper breach`.
- **Resolution Procedure:**
  1. Circuit breakers naturally reset at the start of the next trading session (09:15:00 IST / 09:30:00 EST).
  2. If the user explicitly requests an emergency account reset in paper-trading mode:
     ```bash
     curl -X POST -H "Authorization: Bearer <USER_TOKEN>" http://localhost:8080/api/portfolio/reset
     ```
  3. Validate that `POST /api/accounts/reconcile` returns `reconciled: true` post-reset.

---

### Runbook 2: Cash Ledger Discrepancy & MTM Reconciliation Mismatch
- **Trigger:** `GET /api/accounts/reconcile` reports `isReconciled: false` or mismatch between Cash Ledger and Net Liquidation Equity.
- **Mathematical Invariant:**
  $$\text{Net Liquidation} \equiv \text{Starting Capital} + \sum \text{Realized PnL (INR)} + \sum \text{Unrealized MTM (INR)}$$
  $$\text{Available Cash} \equiv \text{Starting Capital} + \sum \text{Realized PnL (INR)} - \sum \text{Margin Blocked / Utilized}$$
- **Verification Steps:**
  1. Run authoritative reconciliation diagnostic:
     ```bash
     curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/accounts/reconcile
     ```
  2. Inspect differences between `calculatedCash` vs `persistedCash` and `calculatedNetLiq` vs `persistedNetLiq`.
- **Resolution Procedure:**
  1. Put account into temporary maintenance lock (`is_trading_locked = true`).
  2. Replay all `cash_ledger_entries` from baseline (`INITIAL_DEPOSIT` / `ACCOUNT_RESET`) using `PaperAccountService.reconcileAccount(userId)`.
  3. Verify zero rounding discrepancies (`BigDecimal.ROUND_HALF_UP` with 4 decimal places).
  4. Unlock account once reconciliation returns `difference = 0.00`.

---

### Runbook 3: PostgreSQL Database Corruption / Disaster Recovery Failover
- **Trigger:** Database unreachable (`ECONNREFUSED`), Flyway migration error, or storage corruption.
- **Recovery Procedure:**
  1. Check database connectivity:
     ```bash
     psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT count(*) FROM users;"
     ```
  2. In the event of primary database corruption, initiate point-in-time restore from latest verified snapshot:
     ```bash
     # List available verified backups
     ./scripts/backup_restore.sh list

     # Verify SHA-256 integrity and gzip health
     ./scripts/backup_restore.sh verify ./backups/postgres/tradesphere_latest.sql.gz

     # Restore into clean database instance
     ./scripts/backup_restore.sh restore ./backups/postgres/tradesphere_latest.sql.gz
     ```
  3. Run Flyway migration validation in Spring Boot:
     ```bash
     mvn flyway:info -f backend-spring/pom.xml
     ```
  4. Execute full multi-tenant isolation integration test suite:
     ```bash
     mvn test -Dtest=MultiTenantIsolationIntegrationTest -f backend-spring/pom.xml
     ```

---

### Runbook 4: Real-Time Market Feed Outage & Synthetic Fallback Activation
- **Trigger:** Upstream exchange data provider (Shoonya / Yahoo Finance / NSE) returns continuous timeouts or `HTTP 502/503`.
- **Behavior:** The system MUST decouple market data from order execution (Rule B). If exchange feeds disconnect, the 24/7 Geometric Brownian Motion (GBM) engine with ATR tick volatility must automatically supply synthetic ticks labeled `SIMULATED`.
- **Verification Steps:**
  1. Inspect Node microstructure engine health:
     ```bash
     curl http://localhost:8000/api/health
     ```
  2. Verify WebSocket tick stream is emitting ticks:
     ```bash
     wscat -c ws://localhost:8000/ws/ticks
     ```
  3. In Frontend UI, ensure quotes and DOM show the badge `SIMULATED` to maintain regulatory transparency.

---

### Runbook 5: Sliding-Window Rate Limiting & DoS Mitigation
- **Trigger:** High volume of `HTTP 429 Too Many Requests` logged on `/api/auth/*` or `/api/orders/*`.
- **Mitigation:**
  1. Inspect IP distribution in Spring Boot structured logs:
     ```bash
     grep "RATE_LIMIT_EXCEEDED" /var/log/tradesphere/backend.log | awk '{print $NF}' | sort | uniq -c | sort -nr
     ```
  2. If legitimate burst from institutional test harness, dynamically adjust rate limit threshold in `application.yml`:
     ```yaml
     security:
       rate-limit:
         requests-per-minute: 200
     ```
  3. For malicious floods, drop abusive IP addresses at Cloudflare / Nginx edge gateway.

---

## 3. Incident Post-Mortem Requirements

Within 24 hours of resolving any P1 or P2 incident:
1. Conduct an engineering blameless post-mortem.
2. Complete timeline: Detection -> Triage -> Mitigation -> Permanent Resolution.
3. Quantify financial impact: virtual paper ledger variance, failed orders count, affected tenants.
4. Define at least two automated regression tests (unit or integration) preventing reoccurrence.
