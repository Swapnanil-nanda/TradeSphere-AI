"""
TradeSphere AI - Quantitative Research API Router (/api/v1/quant/*)
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Header, Response
from pydantic import BaseModel, Field
from agents.orchestrator import orchestrator
from agents.forecasting import ForecastingAgent
from agents.historical_similarity import HistoricalSimilarityAgent
from agents.strategy_lab import StrategyLabAgent
from core.store import research_store
from reporting.pdf_generator import PDFReportGenerator

router = APIRouter(prefix="/api/v1/quant", tags=["Quantitative Research"])

forecaster = ForecastingAgent()
analogue_finder = HistoricalSimilarityAgent()
strategy_lab = StrategyLabAgent()

# --- Request Schemas ---

class ResearchRunRequest(BaseModel):
    query: str = Field(..., description="Natural language question or multi-agent research objective")
    symbol: str = Field("RELIANCE", description="Target stock or index ticker")
    requested_agents: Optional[List[str]] = Field(None, description="Explicit agents to invoke (optional)")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Fine-grained hyperparameters")

class ForecastRequest(BaseModel):
    symbol: str = Field("RELIANCE", description="Ticker symbol")
    history_bars: int = Field(252, ge=60, le=1000)

class AnalogueRequest(BaseModel):
    symbol: str = Field("RELIANCE", description="Ticker symbol")
    target_window_bars: int = Field(20, ge=5, le=100)
    history_bars: int = Field(500, ge=100, le=1000)
    top_k: int = Field(5, ge=1, le=20)

class BacktestRequest(BaseModel):
    strategy_name: str = Field("EMA_CROSSOVER", description="Strategy identifier: EMA_CROSSOVER, RSI_MEAN_REVERSION, BOLLINGER_BANDS, DONCHIAN_MOMENTUM, SUPERTREND")
    symbol: str = Field("RELIANCE", description="Ticker symbol")
    initial_capital: float = Field(1000000.0, ge=1000.0)
    risk_per_trade_pct: float = Field(1.0, ge=0.1, le=5.0)
    bars: int = Field(252, ge=60, le=1000)
    strategy_params: Optional[Dict[str, Any]] = Field(default_factory=dict)
    seed: Optional[int] = Field(42)

# --- Endpoints ---

@router.post("/research-runs", summary="Execute multi-agent quantitative research run")
async def create_research_run(req: ResearchRunRequest):
    run = await orchestrator.execute_research_run(
        query=req.query,
        symbol=req.symbol,
        requested_agents=req.requested_agents,
        parameters=req.parameters
    )
    return run

@router.get("/research-runs/{run_id}", summary="Retrieve completed research run by ID")
async def get_research_run(run_id: str):
    run = research_store.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Research run with ID '{run_id}' not found.")
    return run

@router.post("/forecasts", summary="Generate multi-horizon calibrated return forecast")
async def compute_forecast(req: ForecastRequest):
    return forecaster.generate_forecasts(symbol=req.symbol, history_bars=req.history_bars)

@router.post("/analogues", summary="Scan and match historical price analogues")
async def compute_analogues(req: AnalogueRequest):
    return analogue_finder.find_analogues(
        symbol=req.symbol,
        target_window_bars=req.target_window_bars,
        history_bars=req.history_bars,
        top_k=req.top_k
    )

@router.post("/backtests", summary="Execute vectorized algorithmic strategy backtest")
async def execute_backtest(req: BacktestRequest):
    return strategy_lab.run_backtest(
        strategy_name=req.strategy_name,
        symbol=req.symbol,
        initial_capital=req.initial_capital,
        risk_per_trade_pct=req.risk_per_trade_pct,
        bars=req.bars,
        strategy_params=req.strategy_params,
        seed=req.seed
    )

@router.get("/reports/{report_id}", summary="Export research report as structured JSON or PDF")
async def export_report(
    report_id: str,
    format: Optional[str] = Query(None, description="Export format: 'pdf' or 'json'"),
    accept: Optional[str] = Header(None)
):
    run = research_store.get_run(report_id)
    if not run:
        # Fallback: check if report data was directly stored
        raw_rep = research_store.get_report(report_id)
        if not raw_rep:
            raise HTTPException(status_code=404, detail=f"Report with ID '{report_id}' not found.")
        run_data = raw_rep
    else:
        run_data = run.model_dump()

    # Determine if PDF was requested
    is_pdf = (format and format.lower() == "pdf") or (accept and "application/pdf" in accept.lower())

    if is_pdf:
        pdf_bytes = PDFReportGenerator.generate_research_pdf(run_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="TradeSphere_Report_{report_id}.pdf"'}
        )

    return run_data
