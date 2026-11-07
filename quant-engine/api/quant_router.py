"""
TradeSphere AI - Quantitative Research API Router (/api/v1/quant/*)
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Header, Response, Body
from pydantic import BaseModel, Field
from agents.orchestrator import orchestrator
from agents.forecasting import ForecastingAgent
from agents.historical_similarity import HistoricalSimilarityAgent
from agents.strategy_lab import StrategyLabAgent
from agents.document_intelligence import DocumentIntelligenceAgent
from wealth.portfolio_attribution import PortfolioAttributionEngine
from reporting.pdf_generator import PDFReportGenerator
from reporting.reproducibility import StrategyReproducibilityGenerator
from agents.experiments import experiments_store, PaperExperiment
from core.store import research_store

router = APIRouter(prefix="/api/v1/quant", tags=["Quantitative Research"])

forecaster = ForecastingAgent()
analogue_finder = HistoricalSimilarityAgent()
strategy_lab = StrategyLabAgent()
doc_intelligence = DocumentIntelligenceAgent()

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

class DocumentAnalysisRequest(BaseModel):
    symbol: str = Field("RELIANCE", description="Ticker symbol, e.g. RELIANCE, TCS, AAPL, NVDA")
    query: Optional[str] = Field("Analyze revenue growth, margins, capital expenditure, and risk factors", description="Research query")

class PortfolioHoldingItem(BaseModel):
    symbol: str = Field(..., description="Asset ticker symbol, e.g. RELIANCE, TCS, AAPL")
    value: float = Field(100000.0, ge=1.0, description="Holding value in portfolio currency")
    sector: Optional[str] = Field(None, description="Sector override (optional)")
    return_pct: Optional[float] = Field(None, description="Realized or benchmark annual return (optional)")

class PortfolioAttributionRequest(BaseModel):
    holdings: List[PortfolioHoldingItem] = Field(..., description="Portfolio constituent positions")
    benchmark: str = Field("NIFTY50", description="Benchmark index: 'NIFTY50' or 'SP500'")

class RiskDecompositionRequest(BaseModel):
    holdings: List[PortfolioHoldingItem] = Field(..., description="Portfolio constituent positions")
    confidence_level: float = Field(0.95, ge=0.90, le=0.99, description="Confidence level for VaR calculation (0.95 or 0.99)")

class ReproducibilityPackageRequest(BaseModel):
    strategy_name: str = Field("EMA_CROSSOVER", description="Strategy identifier")
    symbol: str = Field("RELIANCE", description="Ticker symbol")
    initial_capital: float = Field(1000000.0, ge=1000.0)
    risk_per_trade_pct: float = Field(1.0, ge=0.1, le=5.0)
    bars: int = Field(252, ge=60, le=1000)
    strategy_params: Optional[Dict[str, Any]] = Field(default_factory=dict)
    seed: Optional[int] = Field(42)
    format: Optional[str] = Field("json", description="Export format: 'json' or 'pdf'")

class CreateExperimentRequest(BaseModel):
    name: str = Field(..., description="Experiment title")
    strategy_name: str = Field("EMA_CROSSOVER", description="Strategy identifier")
    symbol: str = Field("RELIANCE", description="Target asset")
    initial_capital: float = Field(1000000.0, ge=1000.0)
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    benchmark_metrics: Optional[Dict[str, float]] = None

class AddExperimentVersionRequest(BaseModel):
    version: str = Field(..., description="Semantic version string, e.g. 'v1.1.0'")
    parameters: Dict[str, Any] = Field(..., description="Updated strategy parameters")
    changelog: str = Field(..., description="Tuning rationale")
    benchmark_metrics: Optional[Dict[str, float]] = None

class UpdateExperimentStatusRequest(BaseModel):
    status: str = Field(..., description="ACTIVE, PAUSED, or RETIRED")

class DriftUpdateRequest(BaseModel):
    realized_return_pct: float
    realized_sharpe: float
    realized_drawdown_pct: float
    trades_count: int
    win_rate_pct: float

# --- Multi-Agent & Quantitative Endpoints ---

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

@router.post("/documents/analyze", summary="Extract cross-document filings, consensus, and evidence trail")
async def analyze_documents(req: DocumentAnalysisRequest):
    res = doc_intelligence.analyze_symbol_documents(symbol=req.symbol, query=req.query)
    return res

@router.post("/portfolio/attribution", summary="Compute Brinson-Fachler sector attribution vs benchmark")
async def compute_portfolio_attribution(req: PortfolioAttributionRequest):
    holdings_dict = [h.model_dump() for h in req.holdings]
    attribution = PortfolioAttributionEngine.compute_brinson_attribution(
        portfolio_holdings=holdings_dict,
        benchmark_name=req.benchmark
    )
    return attribution

@router.post("/portfolio/risk-decomposition", summary="Compute Component VaR, Marginal VaR & Factor Risk Breakdown")
async def compute_portfolio_risk_decomposition(req: RiskDecompositionRequest):
    holdings_dict = [h.model_dump() for h in req.holdings]
    decomposition = PortfolioAttributionEngine.compute_risk_decomposition(
        portfolio_holdings=holdings_dict,
        confidence_level=req.confidence_level
    )
    return decomposition

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

@router.post("/reports/reproducibility-package", summary="Export cryptographic reproducible strategy bundle")
async def export_reproducibility_package(req: ReproducibilityPackageRequest):
    backtest = strategy_lab.run_backtest(
        strategy_name=req.strategy_name,
        symbol=req.symbol,
        initial_capital=req.initial_capital,
        risk_per_trade_pct=req.risk_per_trade_pct,
        bars=req.bars,
        strategy_params=req.strategy_params,
        seed=req.seed
    )
    package = StrategyReproducibilityGenerator.build_package(backtest)

    if req.format and req.format.lower() == "pdf":
        pdf_bytes = PDFReportGenerator.generate_strategy_pdf(package)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="Strategy_Reproducibility_{req.symbol}_{req.strategy_name}.pdf"'}
        )

    return package

@router.get("/reports/{report_id}", summary="Export research report as structured JSON or PDF")
async def export_report(
    report_id: str,
    format: Optional[str] = Query(None, description="Export format: 'pdf' or 'json'"),
    accept: Optional[str] = Header(None)
):
    run = research_store.get_run(report_id)
    if not run:
        raw_rep = research_store.get_report(report_id)
        if not raw_rep:
            raise HTTPException(status_code=404, detail=f"Report with ID '{report_id}' not found.")
        run_data = raw_rep
    else:
        run_data = run.model_dump()

    is_pdf = (format and format.lower() == "pdf") or (accept and "application/pdf" in accept.lower())
    if is_pdf:
        pdf_bytes = PDFReportGenerator.generate_research_pdf(run_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="TradeSphere_Report_{report_id}.pdf"'}
        )

    return run_data

# --- Persistent Paper Experiments Endpoints ---

@router.get("/experiments", summary="List all persistent paper experiments")
async def list_experiments():
    return experiments_store.list_experiments()

@router.get("/experiments/{experiment_id}", summary="Get paper experiment details by ID")
async def get_experiment(experiment_id: str):
    exp = experiments_store.get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found.")
    return exp

@router.post("/experiments", summary="Create new persistent paper experiment")
async def create_experiment(req: CreateExperimentRequest):
    exp = experiments_store.create_experiment(
        name=req.name,
        strategy_name=req.strategy_name,
        symbol=req.symbol,
        initial_capital=req.initial_capital,
        parameters=req.parameters,
        benchmark_metrics=req.benchmark_metrics
    )
    return exp

@router.post("/experiments/{experiment_id}/versions", summary="Upgrade experiment strategy version with changelog")
async def add_experiment_version(experiment_id: str, req: AddExperimentVersionRequest):
    try:
        exp = experiments_store.add_version(
            experiment_id=experiment_id,
            version=req.version,
            parameters=req.parameters,
            changelog=req.changelog,
            benchmark_metrics=req.benchmark_metrics
        )
        return exp
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found.")

@router.patch("/experiments/{experiment_id}/status", summary="Update experiment active status")
async def update_experiment_status(experiment_id: str, req: UpdateExperimentStatusRequest):
    try:
        exp = experiments_store.update_status(experiment_id, req.status)
        return exp
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/experiments/{experiment_id}/drift-update", summary="Simulate paper execution and update drift tracking")
async def update_experiment_drift(experiment_id: str, req: DriftUpdateRequest):
    try:
        exp = experiments_store.update_drift_monitoring(
            experiment_id=experiment_id,
            realized_return_pct=req.realized_return_pct,
            realized_sharpe=req.realized_sharpe,
            realized_dd_pct=req.realized_drawdown_pct,
            trades_count=req.trades_count,
            win_rate_pct=req.win_rate_pct
        )
        return exp
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Experiment '{experiment_id}' not found.")
