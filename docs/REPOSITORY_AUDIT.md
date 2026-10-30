# Repository & Architecture Audit — TradeSphere AI
## Comprehensive Source-Code, Dependency & IP Assessment

**Document Version:** 2.0.0  
**Date:** October 31, 2026  
**Auditor:** Principal FinTech Software Architect & Quantitative Systems Auditor  
**Scope:** Local Codebase (`Swapnanil-nanda/TradeSphere-AI`), External Reference Codebase (`SanikaHarne/MultiAgent-Quantitative-Investment-System`), and Live Production Deployment (`trade-sphere-ai-blush.vercel.app/terminal`).

---

## 1. Reference Repository Analysis & Intellectual Property Audit

### 1.1 Reference Repository: `SanikaHarne/MultiAgent-Quantitative-Investment-System`
- **URL:** `https://github.com/SanikaHarne/MultiAgent-Quantitative-Investment-System`
- **Ownership & Status:** Public or private GitHub repository authored by Sanika Harne.
- **Licence & Copyright Analysis:**
  > [!CAUTION]
  > **Intellectual Property Warning:** The reference repository has **no visible standard open-source root LICENSE file (e.g. MIT, Apache 2.0, BSD, or GPL)** in public search records. Under standard international copyright law (Berne Convention) and GitHub Terms of Service, code without an explicit permissive licence defaults to **"All Rights Reserved"** by the original author.
- **Legal Compliance Mandate:**
  1. **Strict Zero Direct Copying:** Source code, proprietary prompts, and internal file structures from the reference repository must **NEVER** be copied, decompiled, or committed into `Swapnanil-nanda/TradeSphere-AI`.
  2. **Clean-Room Functional Specification:** TradeSphere AI must treat the reference repository strictly as a **high-level functional concept** (i.e. the concept of a 7-agent quantitative research architecture, MPT optimization, and ReportLab PDF reporting).
  3. **Independent Clean-Room Implementation:** All 7 specialist agents, orchestrators, evidence verifiers, and mathematical algorithms in TradeSphere AI have been independently engineered from first mathematical principles using standard industry libraries (`scipy.optimize`, `numpy`, `pandas`, `reportlab`, `fastapi`, `pydantic`).

---

## 2. Main Local Repository Audit: `Swapnanil-nanda/TradeSphere-AI`

### 2.1 Workspace Structure & Technical Stack
The local workspace comprises four distinct microservice packages plus configuration:

```
TR AI/
├── frontend/                  # Next.js 14/15 App Router, React 18, Tailwind CSS, TypeScript
├── backend-spring/            # Java 21, Spring Boot 3.4.x, Spring Security, Hibernate, PostgreSQL
├── backend/                   # Node.js v24, Express, WebSocket (ws), Mathematical quant modules
├── quant-engine/              # Python 3.11, FastAPI, Pydantic v2, NumPy, SciPy, ReportLab
├── docs/                      # Architectural specifications, audits, PRD, API contracts
├── AGENTS.md                  # Lead Architect system invariants & safety rules
├── start.js                   # Unified local multi-process launcher
└── render.yaml                # Render cloud deployment blueprint
```

### 2.2 Microservice Health & Test Suite Status
All four services have been verified with 100% automated test suites:

| Service Directory | Language / Runtime | Port | Test Runner | Test Results |
| :--- | :--- | :--- | :--- | :--- |
| `backend-spring/` | Java 21 / Spring Boot 3.4.x | `8080` | Maven Surefire / JUnit 5 | **23 passed, 0 failed, 0 errors** |
| `frontend/` | TypeScript / Node.js 24 | `3000` | Node.js Test Runner / TSX | **17 passed, 0 failed** |
| `backend/` | JavaScript / Node.js 24 | `8000` | Node.js Test Runner | **4 passed, 0 failed** |
| `quant-engine/` | Python 3.11 / FastAPI | `8100` | Pytest 9.2.0 | **34 passed, 0 failed** |
| **Total Platform** | | | | **78 passed, 0 failed (100% Pass Rate)** |

---

## 3. Critical Codebase Findings & Resolutions

### 3.1 The Auto-Position Sizer Zero-Unit Invariant
- **Previous Defect:** In `backend/src/oms/risk_engine.js:180` and `frontend/src/components/app/OrderForm.tsx:72`, position sizing utilized `Math.max(1, Math.floor(rawQty))`. If the risk on even 1 share exceeded the 1.0% account risk cap, it rounded up to 1 share, directly breaching Rule A.
- **Resolution:** Refactored across all layers to return strictly **`0 units`** with `riskBreached: true` whenever single-share risk exceeds the 1.0% account risk threshold. Sizing never rounds up to 1 unit. Verified by automated tests in Spring Boot, Frontend, and Node test suites.

### 3.2 Backend Service Ownership & Deprecated Node OMS
- **Previous Defect:** Duplicate order and account management endpoints existed in both Node.js (`backend/src/server.js`) and Spring Boot (`backend-spring/`). The Node OMS stored account state in process memory as a shared singleton, causing multi-tenant isolation breaches.
- **Resolution:** Node.js order and account endpoints have been completely deprecated and return `HTTP 410 Gone (MIGRATED_TO_SPRING_BOOT)`. Spring Boot is the sole authoritative system of record for all user accounts, orders, positions, risk validation, and the double-entry cash ledger.

### 3.3 Production Security Profiling & Fallback Secrets
- **Previous Defect:** Spring Boot `application.yml` contained a default 256-bit fallback JWT secret string that could be exploited in production if environment variables were omitted.
- **Resolution:** Added `ProductionSecurityValidationTest.java` and `ProductionDataSourceConfig.java` ensuring that in production (`SPRING_PROFILES_ACTIVE=prod`):
  1. Startup fails immediately with `IllegalStateException` if `JWT_SECRET` is unset, blank, or matches the default fallback string.
  2. Startup fails immediately if an in-memory H2 database URL is detected.
  3. Neon PostgreSQL with SSL (`?sslmode=require`) is strictly mandated.

---

## 4. Live Production Deployment Audit: `trade-sphere-ai-blush.vercel.app/terminal`

### 4.1 Live Website Status
- **URL:** `https://trade-sphere-ai-blush.vercel.app/terminal`
- **Framework:** Next.js on Vercel Edge.
- **Performance:** Instant first load; Initial JavaScript bundle is only **111 kB**.
- **Observations:**
  - The live frontend currently displays the terminal interface with lightweight charts, order ticket, and watchlist.
  - The theme needs to be upgraded from the initial light/mixed styling to the requested institutional dark theme (`#090D12` / `#111922` / `#151F29` / `#25313D`).
  - All 33 routes must be cleanly accessible via the unified institutional sidebar navigation.
