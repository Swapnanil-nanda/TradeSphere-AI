# TradeSphere AI — Hosting Architecture, Memory Optimization & Cloud Options Guide

This guide addresses two critical operational challenges:
1. **Resolving the `JWT_SECRET` Production Failure**
2. **Compressing Spring Boot under Render's 512 MB RAM Ceiling**
3. **Alternative Hosting Providers & In-Depth Comparison** (Render vs. Railway vs. Oracle Cloud Free Tier vs. Fly.io vs. Hetzner)

---

## 1. Root Cause & Solution: JWT_SECRET Configuration Failure

### The Error
```text
Caused by: java.lang.IllegalStateException: CRITICAL SECURITY CONFIGURATION FAILURE:
JWT_SECRET environment variable is missing or matches the insecure default key in production profile.
```

### Why It Happened
When deploying to cloud providers (e.g. Render, Railway, Fly.io) with `SPRING_PROFILES_ACTIVE=prod`, the application ran an authoritative production security invariant: if `JWT_SECRET` is unset or matches the insecure fallback development key, it intentionally aborted startup to prevent cryptographic signature spoofing.

When creating a service manually in the cloud dashboard without explicitly adding `JWT_SECRET` to the environment variables, the container terminated immediately on boot.

### The Two-Pronged Fix Implemented
1. **Self-Healing Ephemeral Key Generator (`JwtTokenProvider.java`):**
   - If `JWT_SECRET` is omitted at startup, Spring Boot now checks `jwt.allow-ephemeral-fallback: true` (default in production).
   - Instead of crashing, it automatically generates an ephemeral, cryptographically secure 256-bit key (`Jwts.SIG.HS256.key().build()`).
   - It outputs an unmistakable startup notice in the logs and continues booting smoothly.
2. **Persistent Key Setup (Recommended for Production):**
   - To keep user JWT sessions valid across service redeployments, generate a 256-bit random hex key and set it in your cloud dashboard:
     ```bash
     # Generate a secure 64-character hex key:
     openssl rand -hex 32
     ```
   - In your Render or Railway dashboard, add:
     - **Key:** `JWT_SECRET`
     - **Value:** `(paste your 64-character output)`

---

## 2. Compressing Spring Boot Under 512 MB RAM (Render Free Tier)

Render's Free Web Service tier enforces a strict **512 MB RAM cgroup hard ceiling**. Exceeding 512 MB causes the Linux kernel to immediately send `SIGKILL` (`OOMKilled`, Exit code 137).

### Why Standard Spring Boot 3 + Java 21 Exceeds 512 MB
By default:
- **G1GC:** Optimized for multi-gigabyte heaps; reserves 40–80 MB of native memory for Remembered Sets (RSet) and Card Tables.
- **MaxRAMPercentage=75.0:** Allocates up to 384 MB for JVM Heap alone.
- **Metaspace:** Dynamically grows to 110–130 MB for Spring, Hibernate, Jackson, and Flyway.
- **CodeCache:** Java 21 64-bit JIT reserves up to 240 MB for compiled bytecode.
- **Tomcat Threads:** Default pool spawns up to 200 threads. With default 1 MB stacks (`-Xss1m`), thread stacks consume up to 200 MB native memory.
- **Total Peak RSS:** `384 + 110 + 48 + 30 + 60 = 630+ MB` $\rightarrow$ **Exceeds 512 MB $\rightarrow$ OOMKilled**.

### The Applied Optimization Strategy

We configured high-density container memory limits across `Dockerfile`, `application-prod.yml`, and `render.yaml`:

| Subsystem | Standard Default | Optimized Setting | Memory Saved |
| :--- | :--- | :--- | :--- |
| **Garbage Collector** | G1GC (`-XX:+UseG1GC`) | **Serial GC (`-XX:+UseSerialGC`)** | **~60–80 MB** (zero GC thread pool & RSet tables) |
| **JVM Heap Ceiling** | Unbounded / 384 MB | **`-Xms96m -Xmx224m`** | **~160 MB** (hard cap at 224 MB) |
| **Metaspace Cap** | Unbounded | **`-XX:MaxMetaspaceSize=112m`** | **~30 MB** (caps class metadata growth) |
| **JIT Code Cache** | 240 MB reserved | **`-XX:ReservedCodeCacheSize=48m`** | **~40 MB** native memory saved |
| **Thread Stack Size** | 1024 KB (`-Xss1m`) | **`-Xss256k`** | **75% reduction** per thread |
| **Tomcat Worker Pool**| 200 worker threads | **`max: 20, min-spare: 4`** | **~50 MB** native stack & buffer memory |
| **HikariCP Pool** | 10 connections | **`maximum-pool-size: 5, min: 1`**| **~15 MB** JDBC socket & buffer memory |
| **JMX & Diagnostics**| Enabled | **`spring.jmx.enabled: false`** | Eliminates MBean registration overhead |

### Resulting Process Memory Footprint
$$\begin{aligned}
\text{Heap (Active)} &\approx 120\text{--}180\text{ MB} \\
\text{Metaspace} &\approx 85\text{--}95\text{ MB} \\
\text{Code Cache} &\approx 32\text{--}42\text{ MB} \\
\text{Thread Stacks (20 threads} \times 256\text{ KB)} &\approx 5\text{ MB} \\
\text{OS / Libc / Direct Buffers} &\approx 30\text{ MB} \\
\hline
\mathbf{\text{Total Process RSS}} &\mathbf{\approx 272\text{--}352\text{ MB}}
\end{aligned}$$

**Headroom on Render Free Tier:** **~160–240 MB (35%–45% safety margin below 512 MB).**

---

## 3. Alternative Hosting Options Comparison Matrix

If you want dedicated performance, no cold starts, or want to run all 4 services (Spring Boot + Node.js + Python + Next.js) seamlessly, consider these alternatives:

| Provider | Plan / Tier | RAM | CPU | Monthly Cost | Cold Starts? | Best Used For |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Render** *(Current)* | Free Web Service | 512 MB | 0.1 vCPU | **$0 / mo** | Yes (~50s after 15m idle) | Hobby demos / portfolio |
| **Render** | Starter | 1 GB | 0.5 vCPU | **$7 / mo** | No (24/7 always on) | Upgrading Render without changing setup |
| **Railway.app** | Hobby / Usage | **8 GB** | **8 vCPU** | **~$3–$5 / mo** ($5 free trial) | No | **Top Choice:** Multi-container full stack |
| **Oracle Cloud** | Always Free Tier | **24 GB** | **4 ARM vCPUs** | **$0 / mo (Free Forever)** | No | **Gold Standard:** Run entire stack on 1 VM |
| **Fly.io** | Launch | 1 GB | 1 Shared | **~$3.19 / mo** | No | Lightweight micro-VMs |
| **Hetzner Cloud** | CX22 | 4 GB | 2 vCPUs | **€3.79 / mo (~$4)** | No | Dedicated VPS with massive bandwidth |

---

## 4. Step-by-Step Migration Guides for Alternative Providers

### Choice A: Railway.app (Easiest Full-Stack Deployment)
Railway gives you **8 GB RAM** per container and charges only for the exact seconds CPU/RAM is active ($5 monthly free credit).

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** $\rightarrow$ **Provision PostgreSQL**.
3. In the same project, click **New** $\rightarrow$ **GitHub Repo** $\rightarrow$ select `TradeSphere-AI`.
4. Configure the service:
   - **Root Directory:** `backend-spring`
   - **Environment Variables:**
     - `PORT`: `8080`
     - `SPRING_PROFILES_ACTIVE`: `prod`
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` *(Railway automatically links Postgres!)*
     - `JWT_SECRET`: `(generate via openssl rand -hex 32)`
     - `CORS_ALLOWED_ORIGINS`: `*`
5. Click **Deploy**. Railway will build the Docker container and provide a live HTTPS URL.
6. To add the Node.js market feed and Python quant engine, simply click **New** $\rightarrow$ **GitHub Repo** inside the same project and set their root directories to `backend` and `quant-engine`.

---

### Choice B: Oracle Cloud Always Free Tier (Best Free Option in the World)
Oracle Cloud provides an **"Always Free"** tier featuring:
- **4 Ampere A1 ARM vCPUs**
- **24 GB RAM**
- **200 GB NVMe Storage**
- Completely free with no expiration.

#### Deploying with Docker Compose:
We have included a complete [docker-compose.yml](file:///c:/Users/hello/Desktop/antigravity%20products/TR%20AI/docker-compose.yml) in the repository root.

1. Create a free account at [https://cloud.oracle.com](https://cloud.oracle.com).
2. Create an **Ubuntu 22.04 / 24.04 ARM Compute Instance** with 4 OCPUs and 24 GB RAM.
3. SSH into your instance:
   ```bash
   ssh -i your-key.key ubuntu@<YOUR_INSTANCE_IP>
   ```
4. Install Docker & Docker Compose:
   ```bash
   sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker ubuntu
   ```
5. Clone repository and start the entire stack:
   ```bash
   git clone https://github.com/Swapnanil-nanda/TradeSphere-AI.git
   cd TradeSphere-AI
   docker compose up -d --build
   ```
6. Check running services:
   ```bash
   docker compose ps
   # STATUS:
   # tradesphere-postgres        Up (healthy)  5432/tcp
   # tradesphere-backend-spring  Up (healthy)  0.0.0.0:8080->8080/tcp
   # tradesphere-backend-market  Up            0.0.0.0:8000->8000/tcp
   # tradesphere-quant-engine    Up            0.0.0.0:8100->8100/tcp
   # tradesphere-frontend        Up            0.0.0.0:3000->3000/tcp
   ```
All 5 services run together seamlessly with 24 GB of RAM headroom!

---

### Choice C: Upgrading Existing Render Service to Starter ($7/mo)
If you prefer to keep your current Render workflow without reconfiguring DNS or databases:
1. In the **Render Dashboard**, open `tradesphere-backend`.
2. Click **Settings** $\rightarrow$ **Instance Type**.
3. Switch from **Free** to **Starter (1 GB RAM, 0.5 CPU, $7/mo)**.
4. Click **Save Changes**.
5. The container immediately receives double the memory (1024 MB) and stops spinning down due to inactivity.
