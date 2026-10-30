"""
TradeSphere AI - Quantitative Data Models & Schemas
Enforces strict financial metadata, reproducibility, and non-guaranteed probabilistic framing.
"""
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
import datetime

# --- Metadata & Reproducibility Schemas ---

class ReproducibilityMetadata(BaseModel):
    random_seed: Optional[int] = Field(None, description="PRNG seed for stochastic simulations")
    execution_timestamp: str = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp of calculation"
    )
    algorithm_signature: str = Field(..., description="Hash or identifier of algorithmic implementation")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Exact parameters supplied")

class ResearchMetadata(BaseModel):
    methodology_version: str = Field("2026.Q4-Institutional", description="Version of research methodology")
    data_source: str = Field(..., description="Origin of input market data")
    data_timestamp: str = Field(..., description="Timestamp of underlying market data")
    limitations: List[str] = Field(default_factory=list, description="Explicit modeling limitations & assumptions")
    reproducibility: ReproducibilityMetadata
    is_simulated: bool = Field(True, description="Always flags simulated or theoretical nature")
    disclaimer: str = Field(
        "QUANTITATIVE RESEARCH ONLY – NOT FINANCIAL ADVICE. NO PREDICTIONS ARE GUARANTEED.",
        description="Mandatory compliance disclaimer"
    )

# --- Market Data & News Intelligence Models ---

class CandlePoint(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class DataQualityReport(BaseModel):
    total_bars: int
    missing_bars: int
    outliers_detected: int
    freshness_seconds: float
    is_valid: bool

class HeadlineSentiment(BaseModel):
    headline: str
    source: str
    publication_time: str
    category: Literal["MACRO", "EARNINGS", "REGULATORY", "TECHNICAL", "GENERAL"]
    vader_compound: float = Field(..., ge=-1.0, le=1.0)
    sentiment_label: Literal["POSITIVE", "NEUTRAL", "NEGATIVE"]
    relevance_score: float = Field(..., ge=0.0, le=1.0)

class NewsIntelligenceResult(BaseModel):
    symbol: str
    overall_sentiment_score: float = Field(..., ge=-1.0, le=1.0)
    sentiment_label: Literal["POSITIVE", "NEUTRAL", "NEGATIVE"]
    headline_count: int
    headlines: List[HeadlineSentiment]
    historical_sentiment_trend: List[Dict[str, Any]]
    signal_guaranteed: bool = Field(False, description="Must always be False; sentiment is noisy auxiliary information")
    metadata: ResearchMetadata

# --- Technical Analysis Models ---

class TechnicalIndicatorsOutput(BaseModel):
    symbol: str
    timeframe: str
    current_price: float
    sma_20: float
    sma_50: float
    sma_200: Optional[float]
    ema_20: float
    rsi_14: float
    macd_line: float
    macd_signal: float
    macd_hist: float
    bb_upper: float
    bb_middle: float
    bb_lower: float
    atr_14: float
    supertrend_val: float
    supertrend_direction: Literal["BULLISH", "BEARISH"]
    donchian_high_20: float
    donchian_low_20: float
    regime: Literal["BULLISH_TREND", "BEARISH_TREND", "MEAN_REVERSION_RANGE", "HIGH_VOLATILITY_EXPANSION"]
    metadata: ResearchMetadata

# --- Historical Similarity / Analogue Models ---

class HistoricalAnalogueMatch(BaseModel):
    match_id: str
    reference_start: str
    reference_end: str
    historical_start: str
    historical_end: str
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Normalized similarity metric (1.0 = identical)")
    distance_metric: str = Field("Normalized Euclidean / Dynamic Time Warping")
    forward_1d_return: float
    forward_5d_return: float
    forward_20d_return: float

class HistoricalAnalogueResult(BaseModel):
    symbol: str
    target_window_bars: int
    total_candidates_scanned: int
    top_matches: List[HistoricalAnalogueMatch]
    forward_distribution: Dict[str, Dict[str, float]]  # { '5d': {'mean': ..., 'median': ..., 'p10': ..., 'p90': ...} }
    analogue_certainty: bool = Field(False, description="Must always be False; analogues do not guarantee future trajectory")
    metadata: ResearchMetadata

# --- Probabilistic Forecasting Models ---

class HorizonForecast(BaseModel):
    horizon_days: int
    expected_return_pct: float
    median_return_pct: float
    confidence_interval_80: List[float] = Field(..., min_length=2, max_length=2)
    confidence_interval_95: List[float] = Field(..., min_length=2, max_length=2)
    distribution_stats: Dict[str, float]  # mean, std, skew, kurtosis
    out_of_sample_metrics: Dict[str, float]  # mae, rmse, directional_accuracy, calibration_score
    certainty_claimed: bool = Field(False, description="Must always be False")

class MultiHorizonForecastResult(BaseModel):
    symbol: str
    as_of_date: str
    horizons: List[HorizonForecast]
    calibration_method: str = Field("Student's t Kernel Estimation", description="Methodology for distribution fitting")
    metadata: ResearchMetadata

# --- Risk Management & Portfolio Optimization Models ---

class FrontierPoint(BaseModel):
    volatility: float
    expected_return: float
    sharpe_ratio: float
    weights: Dict[str, float]

class OptimizationResult(BaseModel):
    id: str
    symbols: List[str]
    risk_free_rate: float
    return_assumption_method: str = Field(..., description="Explicit method: e.g. Historical CAGR, CAPM, or User-Defined")
    covariance_matrix: Dict[str, Dict[str, float]]
    correlation_matrix: Dict[str, Dict[str, float]]
    max_sharpe_portfolio: Dict[str, Any]
    min_variance_portfolio: Dict[str, Any]
    frontier_points: List[FrontierPoint]
    metadata: ResearchMetadata

class VaRMetrics(BaseModel):
    horizon_days: int
    confidence_level: float
    parametric_var_pct: float
    historical_var_pct: float
    cornish_fisher_var_pct: float
    expected_shortfall_cvar_pct: float
    is_one_sided_left_tail: bool = Field(True, description="Must be True; VaR is strictly a left-tail loss metric")

class MonteCarloResult(BaseModel):
    simulation_type: Literal["LUMP_SUM", "MONTHLY_SIP"]
    initial_investment: float
    monthly_contribution: float
    horizon_months: int
    simulation_count: int
    random_seed: int
    median_final_value: float
    total_invested: float
    percentile_distribution: Dict[str, float]  # p5, p10, p25, p50, p75, p90, p95
    probability_of_loss: float = Field(..., ge=0.0, le=1.0, description="P(Final Value < Total Invested)")
    path_max_drawdown_median: float
    path_max_drawdown_p95: float
    path_max_drawdown_worst: float
    var_metrics: VaRMetrics
    metadata: ResearchMetadata

# --- Wealth & Financial Planning Models ---

class SIPPlanResult(BaseModel):
    monthly_investment: float
    annual_step_up_pct: float
    expected_return_cagr: float
    investment_horizon_years: int
    total_invested: float
    estimated_future_value: float
    wealth_gain: float
    yearly_schedule: List[Dict[str, Any]]
    metadata: ResearchMetadata

class ScenarioResult(BaseModel):
    goal_name: str
    target_amount: float
    horizon_years: int
    inflation_rate_pct: float
    inflation_adjusted_target: float
    suggested_monthly_sip: float
    shortfall_probability: float
    recommended_asset_allocation: Dict[str, float]  # equity, debt, gold, cash
    metadata: ResearchMetadata

class MutualFundPerformance(BaseModel):
    scheme_code: str
    scheme_name: str
    category: str
    fund_house: str
    nav: float
    cagr_1y: float
    cagr_3y: float
    cagr_5y: float
    expense_ratio: float
    sharpe_ratio: float
    standard_deviation: float
    tracking_error: float
    benchmark_index: str
    metadata: ResearchMetadata

# --- Strategy Lab & Backtesting Models ---

class TradeRecord(BaseModel):
    entry_date: str
    exit_date: str
    symbol: str
    side: Literal["BUY", "SELL"]
    entry_price: float
    exit_price: float
    quantity: int
    return_pct: float
    pnl: float
    holding_period_bars: int
    exit_reason: str

class StrategyBacktestResult(BaseModel):
    strategy_name: str
    symbol: str
    initial_capital: float
    final_equity: float
    net_return_pct: float
    cagr_pct: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown_pct: float
    calmar_ratio: float
    profit_factor: float
    win_rate_pct: float
    total_trades: int
    trades: List[TradeRecord]
    equity_curve: List[Dict[str, Any]]
    metadata: ResearchMetadata

# --- Composite Research Run & Evidence Verification Models ---

class EvidenceVerificationReport(BaseModel):
    is_verified: bool
    unsupported_claims_found: List[str]
    input_validation_passed: bool
    var_definitions_compliant: bool
    path_drawdown_verified: bool
    return_assumptions_explicit: bool
    disclaimers_present: bool
    audit_notes: List[str]

class ResearchRun(BaseModel):
    id: str
    user_query: str
    invoked_agents: List[str]
    timestamp: str
    market_data: Optional[Dict[str, Any]] = None
    news_intelligence: Optional[NewsIntelligenceResult] = None
    technical_analysis: Optional[TechnicalIndicatorsOutput] = None
    historical_similarity: Optional[HistoricalAnalogueResult] = None
    forecasting: Optional[MultiHorizonForecastResult] = None
    risk_management: Optional[Dict[str, Any]] = None
    strategy_lab: Optional[StrategyBacktestResult] = None
    evidence_verification: EvidenceVerificationReport
    synthesis_summary: str
    metadata: ResearchMetadata
