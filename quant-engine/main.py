"""
TradeSphere AI - Quantitative Investment Research Microservice
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import config
from api.quant_router import router as quant_router
from api.wealth_router import router as wealth_router

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("quant-engine.main:app", host=config.host, port=config.port, reload=True)
