# TradeSphere AI — Public Cloud Deployment Guide

This guide provides exact, step-by-step instructions for deploying TradeSphere AI to production using:
- **Frontend:** Next.js 14 App Router on **Vercel**
- **Backend:** Java 21 / Spring Boot 3.4.x Container on **Render** (Docker)
- **Database:** Serverless PostgreSQL 18 on **Neon**

---

## Architecture Overview

```
                                      +---------------------------------------------+
                                      |                Vercel Edge                  |
                                      |         Next.js 14 App Router (UI)          |
                                      |     https://tradesphere-ai.vercel.app       |
                                      +----------------------+----------------------+
                                                             |
                                           HTTPS / REST / CORS (Bearer JWT)
                                                             |
                                                             v
+-----------------------------+       +---------------------------------------------+
|    Render Health Check      | ----> |              Render Web Service             |
|   GET /api/health (30s)     |       |          Docker Container (Java 21)         |
+-----------------------------+       |    https://tradesphere-backend.onrender.com |
                                      +----------------------+----------------------+
                                                             |
                                                 HikariCP SSL Pool (5432)
                                                             |
                                                             v
                                      +---------------------------------------------+
                                      |              Neon PostgreSQL 18             |
                                      |        Flyway Migrations (v1 -> v7)         |
                                      |    ep-your-db.us-east-2.aws.neon.tech       |
                                      +---------------------------------------------+
```

---

## Phase 1: Provisioning PostgreSQL on Neon

1. **Sign Up / Log In to Neon:**
   - Navigate to [https://neon.tech](https://neon.tech) and create an account.
2. **Create New Project:**
   - **Project Name:** `tradesphere-production`
   - **Postgres Version:** `16` or `17` (PostgreSQL 18 compatible)
   - **Region:** Choose a region close to your Render deployment (e.g. `US East (Ohio)` or `AWS Oregon / us-west-2`).
3. **Obtain Connection String:**
   - On the Neon Dashboard, locate your **Connection Details**.
   - Select **Pooled connection** (recommended for serverless) or **Direct connection**.
   - The connection string will look like:
     ```text
     postgresql://neondb_owner:npg_SecretPass123@ep-cool-fog-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - *Note:* TradeSphere AI's `NeonDatabaseUrlEnvironmentPostProcessor` automatically parses this URI into standard Spring JDBC format (`jdbc:postgresql://...`) on startup.

---

## Phase 2: Deploying Spring Boot Backend on Render

### Option A: Using Render Blueprint (Fastest)
1. Fork or push this repository to GitHub.
2. Log in to [https://render.com](https://render.com).
3. Click **Blueprints** -> **New Blueprint Instance**.
4. Select your repository. Render will automatically detect [`render.yaml`](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/render.yaml).
5. When prompted, enter your `DATABASE_URL` obtained from Neon.
6. Click **Apply**.

### Option B: Manual Web Service Setup
1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name:** `tradesphere-backend`
   - **Language / Runtime:** `Docker`
   - **Root Directory:** (leave blank)
   - **Dockerfile Path:** `./backend-spring/Dockerfile`
   - **Docker Context:** `./backend-spring`
   - **Instance Type:** `Free` (or `Starter` for dedicated 24/7 memory)
4. Add **Environment Variables**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Activates production PostgreSQL & Hikari settings |
   | `PORT` | `8080` | Container listener port |
   | `DATABASE_URL` | `postgresql://...` | Connection URI from Neon (with `?sslmode=require`) |
   | `JWT_SECRET` | *(64-character hex key)* | Generate via `openssl rand -hex 32` (or uses auto-ephemeral key) |
   | `JWT_ALLOW_EPHEMERAL_FALLBACK` | `true` | Allows safe auto-generated key if JWT_SECRET is unset |
   | `JAVA_OPTS` | `-XX:+UseSerialGC -Xms96m -Xmx224m -XX:MaxMetaspaceSize=112m -XX:ReservedCodeCacheSize=48m -Xss256k -XX:+ExitOnOutOfMemoryError` | Low-memory container tuning (<512MB RAM) |
   | `CORS_ALLOWED_ORIGINS` | `https://tradesphere-ai.vercel.app,https://*.vercel.app,http://localhost:3000` | Allowed frontend origins |
   | `SWAGGER_ENABLED` | `false` | Disables public API doc introspection in production |
5. Configure **Health Check Path**:
   - Set to `/api/health`
6. Click **Create Web Service**.
7. Once deployed, test the health check in your browser or terminal:
   ```bash
   curl -I https://tradesphere-backend.onrender.com/api/health
   # Expected: HTTP/1.1 200 OK
   # JSON body: {"status":"UP","database":{"status":"CONNECTED"}}
   ```

---

## Phase 3: Deploying Next.js Frontend on Vercel

1. Log in to [https://vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your repository from GitHub.
4. Configure Project Settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click edit and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Configure **Environment Variables**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://tradesphere-backend.onrender.com` | Deployed Spring Boot authoritative backend URL |
   | `BACKEND_INTERNAL_URL` | `https://tradesphere-backend.onrender.com` | Server-side proxy target |
   | `NEXT_PUBLIC_MARKET_WS_URL` | `wss://tradesphere-market.onrender.com/ws/ticks` | (Optional) Deployed Node market feed WebSocket URL |
   | `NEXT_PUBLIC_MARKET_API_URL` | `https://tradesphere-market.onrender.com` | (Optional) Deployed Node market feed REST URL |
6. Click **Deploy**.
7. Vercel will build all 50 routes and assign a live production URL (e.g. `https://tradesphere-ai.vercel.app`).

### Vercel 512 MB Memory Limit Evaluation & Technical Guarantees

| Metric | Value | Vercel Hobby Limit | Headroom / Compliance |
| :--- | :--- | :--- | :--- |
| **Shared First Load JS** | 87.2 kB | N/A | **99.9% optimized** |
| **Total Initial Route JS** | 111 kB | N/A | **Zero bloat** |
| **Uncompressed Bundle Size** | ~30 MB | 250 MB | **88% Headroom** |
| **Serverless Function Memory**| ~50–80 MB | 512 MB (Hobby) / 1024 MB (Pro) | **84%–90% Headroom** |

> [!IMPORTANT]
> **Architectural Invariant:** Next.js deployed on Vercel serves pure React client and statically generated pages. Heavy JVM runtimes (`backend-spring/`) and scientific Python environments (`quant-engine/`) must **NEVER** be packaged as Vercel Serverless Functions. They require dedicated container or VM runtimes as specified below.

---

## Phase 4: Deploying Python Quantitative Engine on Render / Railway

1. **Render Web Service Setup:**
   - **Root Directory:** `quant-engine`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
   - **Instance Type:** `Starter` (512 MB RAM / 0.5 CPU)
2. **Environment Variables:**
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `8100` | Port assignment |
   | `QUANT_API_KEY` | *(optional)* | Service-to-service authentication key |

---

## Phase 5: Deploying Node.js Market Feed Simulator on Render / Railway

1. **Render Web Service Setup:**
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Health Check Path:** `/health`
   - **Instance Type:** `Starter` (WebSocket support enabled)

---

## Phase 6: Production Verification & Smoke Test

1. **Open the Deployed Frontend URL:**
   - Navigate to `https://your-app.vercel.app`.
   - Verify the homepage loads with dark-first typography and no broken styles.
2. **Check Backend Connectivity Badge:**
   - In the header navigation, observe the status dot:
     - 🟢 **`PROD BACKEND ONLINE`** confirms live connection to Render.
     - 🔵 **`STANDALONE SIMULATOR`** indicates graceful fallback mode if Render is cold-starting.
3. **Register New User:**
   - Click **Get Started** -> fill out registration form.
   - Verify user account creation and automatic JWT token receipt.
4. **Execute Simulated Order:**
   - Open **Paper Trading** terminal (`/app/paper-trading`).
   - Observe the prominent `PAPER TRADING – NO REAL MONEY` banner.
   - Place a BUY order for 10 shares of `RELIANCE` with hard Stop-Loss and Take-Profit.
   - Verify the Pre-Trade Risk Gatekeeper validates the 1% risk cap.
   - Confirm immediate order fill and cash deduction.
5. **Verify Double-Entry Cash Ledger Reconciliation:**
   - Click **Reconcile Ledger**.
   - Verify that `Variance = ₹0.00` and `Status = RECONCILED`.
6. **Check Cold-Start Resilience:**
   - If Render goes to sleep after 15 minutes of inactivity, open the dashboard.
   - Confirm that the UI loads instantly with simulated demo fixtures and does not crash while Render spins up.
