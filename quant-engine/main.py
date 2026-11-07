"""
TradeSphere AI - Quantitative Investment Research Microservice
FastAPI Application Entry Point
"""
import time
import os
import psutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config
from api.quant_router import router as quant_router
from api.wealth_router import router as wealth_router
from core.logging_middleware import StructuredLoggingMiddleware

_START_TIME = time.time()

app = FastAPI(
    title="TradeSphere AI — Quantitative Research Engine",
    description=(
        "Institutional Multi-Agent Quantitative Investment Research Service. "
        "Provides Markowitz MPT, Monte Carlo path drawdown, multi-horizon probabilistic forecasting, "
        "historical analogues, and Strategy Lab backtesting. "
        "INVARIANT: Read-only research engine with zero order execution authority."
    ),
    version=config.version,
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# Attach Logging & Tracing Middleware
app.add_middleware(StructuredLoggingMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8000",
        "https://tradesphere-ai.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Versioned Routers
app.include_router(quant_router)
app.include_router(wealth_router)

@app.get("/health", summary="Service Health Probe")
@app.get("/api/health", summary="Standard Health Probe")
async def health_check():
    return {
        "status": "UP",
        "service": config.service_name,
        "version": config.version,
        "methodology_version": config.methodology_version,
        "execution_mode": "RESEARCH_ONLY_NO_ORDER_AUTHORITY"
    }

@app.get("/metrics", summary="Service Metrics & Diagnostics")
@app.get("/api/metrics", summary="Service Metrics & Diagnostics")
async def metrics_probe():
    uptime_sec = int(time.time() - _START_TIME)
    mem_info = {}
    try:
        import psutil
        process = psutil.Process(os.getpid())
        mem_info = {
            "rss_bytes": process.memory_info().rss,
            "cpu_percent": process.cpu_percent(interval=None)
        }
    except Exception:
        pass

    return {
        "service": "tradesphere-quant-engine",
        "status": "HEALTHY",
        "uptime_seconds": uptime_sec,
        "active_specialist_agents": 7,
        "evidence_verification_enabled": True,
        "memory": mem_info,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("quant-engine.main:app", host=config.host, port=config.port, reload=True)
