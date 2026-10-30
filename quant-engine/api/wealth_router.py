"""
TradeSphere AI - Wealth Management & Optimization Router (/api/v1/wealth/*)
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from agents.risk_management import RiskManagementAgent
from wealth.sip_calculator import SIPCalculator
from wealth.mutual_funds import MutualFundService
from wealth.scenarios import ScenarioModeler
from core.store import research_store

router = APIRouter(prefix="/api/v1/wealth", tags=["Wealth & Optimization"])

risk_agent = RiskManagementAgent()

# --- Request Schemas ---

class OptimizationRequest(BaseModel):
    symbols: List[str] = Field(default_factory=lambda: ["RELIANCE", "TCS", "INFY", "HDFCBANK"])
    risk_free_rate: Optional[float] = Field(None, description="Annual risk-free rate (e.g. 0.0675 for 6.75%)")
    return_assumption_method: str = Field(
        "Historical Annualized Mean Return",
        description="Explicit return methodology: e.g. Historical Annualized Mean Return, CAPM, or User-Provided"
    )
    custom_returns: Optional[Dict[str, float]] = Field(None, description="Optional custom annualized return per symbol")
    frontier_points_count: int = Field(20, ge=5, le=50)
    seed: Optional[int] = Field(42)

class SIPPlanRequest(BaseModel):
    monthly_investment: float = Field(10000.0, ge=500.0)
    annual_step_up_pct: float = Field(10.0, ge=0.0, le=100.0)
    expected_return_cagr: float = Field(12.0, ge=1.0, le=40.0)
    investment_horizon_years: int = Field(15, ge=1, le=50)

class ScenarioRequest(BaseModel):
    goal_name: str = Field("Retirement Independence")
    target_amount: float = Field(20000000.0, ge=10000.0)
    horizon_years: int = Field(15, ge=1, le=40)
    inflation_rate_pct: float = Field(6.0, ge=0.0, le=20.0)
    expected_return_cagr: float = Field(12.0, ge=1.0, le=30.0)
    seed: int = Field(42)

class MonteCarloRequest(BaseModel):
    simulation_type: str = Field("MONTHLY_SIP", description="'LUMP_SUM' or 'MONTHLY_SIP'")
    initial_investment: float = Field(100000.0, ge=0.0)
    monthly_contribution: float = Field(10000.0, ge=0.0)
    horizon_months: int = Field(60, ge=6, le=360)
    annual_expected_return: float = Field(0.12, ge=0.01, le=0.50)
    annual_volatility: float = Field(0.18, ge=0.01, le=0.80)
    simulation_count: int = Field(1000, ge=100, le=5000)
    seed: int = Field(42)

# --- Endpoints ---

@router.post("/optimizations", summary="Calculate Markowitz MPT, Max Sharpe, Min Variance & Efficient Frontier")
async def optimize_portfolio(req: OptimizationRequest):
    if len(req.symbols) < 2:
        raise HTTPException(status_code=400, detail="Portfolio optimization requires at least 2 distinct assets.")
    
    res = risk_agent.optimize_portfolio(
        symbols=req.symbols,
        risk_free_rate=req.risk_free_rate,
        return_assumption_method=req.return_assumption_method,
        custom_returns=req.custom_returns,
        frontier_points_count=req.frontier_points_count,
        seed=req.seed
    )
    research_store.save_optimization(res)
    return res

@router.get("/optimizations/{opt_id}/frontier", summary="Retrieve Efficient Frontier points for optimization ID")
async def get_optimization_frontier(opt_id: str):
    opt = research_store.get_optimization(opt_id)
    if not opt:
        raise HTTPException(status_code=404, detail=f"Optimization ID '{opt_id}' not found.")
    return {
        "id": opt.id,
        "symbols": opt.symbols,
        "risk_free_rate": opt.risk_free_rate,
        "frontier_points": opt.frontier_points,
        "max_sharpe_portfolio": opt.max_sharpe_portfolio,
        "min_variance_portfolio": opt.min_variance_portfolio
    }

@router.post("/sip-plans", summary="Calculate regular & step-up Systematic Investment Plan (SIP)")
async def calculate_sip_plan(req: SIPPlanRequest):
    return SIPCalculator.calculate_sip(
        monthly_investment=req.monthly_investment,
        annual_step_up_pct=req.annual_step_up_pct,
        expected_return_cagr=req.expected_return_cagr,
        investment_horizon_years=req.investment_horizon_years
    )

@router.post("/scenarios", summary="Simulate goal-based financial scenario with inflation adjustment")
async def simulate_goal_scenario(req: ScenarioRequest):
    return ScenarioModeler.evaluate_goal_scenario(
        goal_name=req.goal_name,
        target_amount=req.target_amount,
        horizon_years=req.horizon_years,
        inflation_rate_pct=req.inflation_rate_pct,
        expected_return_cagr=req.expected_return_cagr,
        seed=req.seed
    )

@router.get("/mutual-funds", summary="Search and list mutual fund performance database")
async def list_mutual_funds(
    category: Optional[str] = Query(None, description="Category filter (e.g. 'Large Cap', 'Flexi Cap', 'Debt')"),
    query: Optional[str] = Query(None, description="Search term for scheme name or fund house")
):
    return MutualFundService.list_funds(category=category, query=query)

@router.post("/monte-carlo", summary="Run path-based Monte Carlo simulation with true path drawdown")
async def run_monte_carlo_simulation(req: MonteCarloRequest):
    return risk_agent.run_monte_carlo(
        simulation_type=req.simulation_type,
        initial_investment=req.initial_investment,
        monthly_contribution=req.monthly_contribution,
        horizon_months=req.horizon_months,
        annual_expected_return=req.annual_expected_return,
        annual_volatility=req.annual_volatility,
        simulation_count=req.simulation_count,
        seed=req.seed
    )
