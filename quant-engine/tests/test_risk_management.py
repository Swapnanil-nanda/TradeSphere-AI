import pytest
import numpy as np
from agents.risk_management import RiskManagementAgent

def test_markowitz_mpt_optimization():
    agent = RiskManagementAgent()
    symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK"]
    res = agent.optimize_portfolio(symbols=symbols, seed=42)

    assert res.id is not None
    assert len(res.symbols) == 4
    # Weights must sum to 1.0
    ms_weights = res.max_sharpe_portfolio["weights"]
    assert round(sum(ms_weights.values()), 2) == 1.00

    mv_weights = res.min_variance_portfolio["weights"]
    assert round(sum(mv_weights.values()), 2) == 1.00

    # Efficient frontier points
    assert len(res.frontier_points) > 5
    for pt in res.frontier_points:
        assert pt.volatility > 0
        assert round(sum(pt.weights.values()), 2) == 1.00

    # Explicit return assumption
    assert res.return_assumption_method == "Historical Annualized Mean Return"

def test_explicit_one_sided_var_metrics():
    agent = RiskManagementAgent()
    rng = np.random.default_rng(42)
    daily_returns = rng.normal(0.0005, 0.015, 252)

    var_res = agent.calculate_var_metrics(daily_returns, horizon_days=1, confidence_level=0.95)

    # Invariant: strict one-sided left tail
    assert var_res.is_one_sided_left_tail is True
    assert var_res.parametric_var_pct > 0.0
    assert var_res.historical_var_pct > 0.0
    assert var_res.cornish_fisher_var_pct > 0.0
    # Expected Shortfall (CVaR) must be greater than or equal to VaR
    assert var_res.expected_shortfall_cvar_pct >= var_res.historical_var_pct

def test_monte_carlo_path_based_drawdown():
    agent = RiskManagementAgent()
    mc_res = agent.run_monte_carlo(
        simulation_type="MONTHLY_SIP",
        initial_investment=50000.0,
        monthly_contribution=10000.0,
        horizon_months=36,
        simulation_count=500,
        seed=42
    )

    assert mc_res.simulation_type == "MONTHLY_SIP"
    assert mc_res.total_invested == 50000.0 + 10000.0 * 36
    assert mc_res.median_final_value > 0
    assert 0.0 <= mc_res.probability_of_loss <= 1.0

    # INVARIANT: Path-based maximum drawdown is computed and verified
    assert mc_res.path_max_drawdown_median > 0.0
    assert mc_res.path_max_drawdown_p95 >= mc_res.path_max_drawdown_median
    assert mc_res.path_max_drawdown_worst >= mc_res.path_max_drawdown_p95
    assert mc_res.var_metrics.is_one_sided_left_tail is True

def test_monte_carlo_reproducibility():
    agent = RiskManagementAgent()
    res1 = agent.run_monte_carlo(seed=12345, simulation_count=200)
    res2 = agent.run_monte_carlo(seed=12345, simulation_count=200)

    assert res1.median_final_value == res2.median_final_value
    assert res1.path_max_drawdown_median == res2.path_max_drawdown_median
