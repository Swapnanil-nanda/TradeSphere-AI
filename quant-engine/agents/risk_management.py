"""
TradeSphere AI - Agent 6: Risk Management Agent
Performs Markowitz Modern Portfolio Theory (MPT), Efficient Frontier calculation,
explicit one-sided Value at Risk (Parametric, Historical, Cornish-Fisher, CVaR),
and path-based Monte Carlo simulations (lump-sum & SIP) with true path-based maximum drawdown.
"""
from typing import List, Dict, Any, Optional
import datetime
import uuid
import numpy as np
import pandas as pd
import scipy.optimize as sco
import scipy.stats as stats
from agents.base import BaseQuantAgent
from core.models import (
    OptimizationResult, FrontierPoint, VaRMetrics, MonteCarloResult, ResearchMetadata
)
from agents.market_data import MarketDataAgent

class RiskManagementAgent(BaseQuantAgent):
    def __init__(self, market_data_agent: Optional[MarketDataAgent] = None):
        super().__init__(
            name="RiskManagementAgent",
            description="Executes Markowitz MPT, Efficient Frontier, one-sided VaR/CVaR, and path-based Monte Carlo simulations."
        )
        self.market_data = market_data_agent or MarketDataAgent()

    def optimize_portfolio(
        self,
        symbols: List[str],
        risk_free_rate: Optional[float] = None,
        return_assumption_method: str = "Historical Annualized Mean Return",
        custom_returns: Optional[Dict[str, float]] = None,
        frontier_points_count: int = 20,
        seed: Optional[int] = 42
    ) -> OptimizationResult:
        rf = risk_free_rate if risk_free_rate is not None else self.market_data.get_risk_free_rate()
        returns_df, _, _ = self.market_data.get_multi_asset_returns(symbols=symbols, bars=252, seed=seed)

        # Expected Returns (Annualized, 252 trading days)
        if custom_returns:
            exp_returns = np.array([custom_returns.get(s, returns_df[s].mean() * 252.0) for s in symbols])
            actual_method = f"User-Provided ({return_assumption_method})"
        else:
            exp_returns = returns_df.mean().values * 252.0
            actual_method = return_assumption_method

        cov_matrix = returns_df.cov().values * 252.0
        corr_matrix = returns_df.corr().values
        num_assets = len(symbols)

        def portfolio_performance(weights):
            p_ret = float(np.sum(exp_returns * weights))
            p_vol = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))
            sharpe = (p_ret - rf) / (p_vol + 1e-8)
            return p_ret, p_vol, sharpe

        # Objective: Maximize Sharpe -> Minimize negative Sharpe
        def neg_sharpe(weights):
            return -portfolio_performance(weights)[2]

        # Objective: Minimize Variance
        def min_variance(weights):
            return portfolio_performance(weights)[1]

        bounds = tuple((0.0, 1.0) for _ in range(num_assets))
        constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0})
        init_weights = np.ones(num_assets) / num_assets

        # 1. Max Sharpe Optimization
        opt_sharpe = sco.minimize(neg_sharpe, init_weights, method='SLSQP', bounds=bounds, constraints=constraints)
        max_s_weights = opt_sharpe.x if opt_sharpe.success else init_weights
        ms_ret, ms_vol, ms_sharpe = portfolio_performance(max_s_weights)

        # 2. Min Variance Optimization
        opt_min_var = sco.minimize(min_variance, init_weights, method='SLSQP', bounds=bounds, constraints=constraints)
        min_v_weights = opt_min_var.x if opt_min_var.success else init_weights
        mv_ret, mv_vol, mv_sharpe = portfolio_performance(min_v_weights)

        # 3. Efficient Frontier Trace
        target_returns = np.linspace(mv_ret, max(exp_returns), frontier_points_count)
        frontier_points: List[FrontierPoint] = []

        for target in target_returns:
            cons = (
                {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0},
                {'type': 'eq', 'fun': lambda x, t=target: portfolio_performance(x)[0] - t}
            )
            res = sco.minimize(min_variance, init_weights, method='SLSQP', bounds=bounds, constraints=cons)
            if res.success:
                f_ret, f_vol, f_sharpe = portfolio_performance(res.x)
                w_dict = {symbols[i]: round(float(res.x[i]), 4) for i in range(num_assets)}
                frontier_points.append(FrontierPoint(
                    volatility=round(f_vol * 100.0, 2),
                    expected_return=round(f_ret * 100.0, 2),
                    sharpe_ratio=round(f_sharpe, 2),
                    weights=w_dict
                ))

        # Format correlation & covariance dictionaries
        cov_dict = {
            symbols[i]: {symbols[j]: round(float(cov_matrix[i, j]), 6) for j in range(num_assets)}
            for i in range(num_assets)
        }
        corr_dict = {
            symbols[i]: {symbols[j]: round(float(corr_matrix[i, j]), 4) for j in range(num_assets)}
            for i in range(num_assets)
        }

        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
        metadata = self.build_metadata(
            data_source=f"Multi-Asset Covariance Matrix ({', '.join(symbols)})",
            data_timestamp=now_utc,
            limitations=[
                "Markowitz MPT assumes multivariate normality and stationary expected returns and covariances.",
                "Real market crises induce correlation spikes (co-kurtosis) not captured by standard covariance.",
                f"Return assumption used: {actual_method}."
            ],
            parameters={
                "symbols": symbols,
                "risk_free_rate": rf,
                "return_assumption_method": actual_method
            },
            random_seed=seed
        )

        opt_id = str(uuid.uuid4())[:8]
        return OptimizationResult(
            id=opt_id,
            symbols=symbols,
            risk_free_rate=round(rf, 4),
            return_assumption_method=actual_method,
            covariance_matrix=cov_dict,
            correlation_matrix=corr_dict,
            max_sharpe_portfolio={
                "expected_return_pct": round(ms_ret * 100.0, 2),
                "volatility_pct": round(ms_vol * 100.0, 2),
                "sharpe_ratio": round(ms_sharpe, 2),
                "weights": {symbols[i]: round(float(max_s_weights[i]), 4) for i in range(num_assets)}
            },
            min_variance_portfolio={
                "expected_return_pct": round(mv_ret * 100.0, 2),
                "volatility_pct": round(mv_vol * 100.0, 2),
                "sharpe_ratio": round(mv_sharpe, 2),
                "weights": {symbols[i]: round(float(min_v_weights[i]), 4) for i in range(num_assets)}
            },
            frontier_points=frontier_points,
            metadata=metadata
        )

    def calculate_var_metrics(
        self,
        returns: np.ndarray,
        horizon_days: int = 1,
        confidence_level: float = 0.95
    ) -> VaRMetrics:
        """
        Calculates strict ONE-SIDED left-tail loss Value at Risk (Parametric, Historical, Cornish-Fisher)
        and Expected Shortfall (CVaR).
        """
        r = returns[returns != 0]
        if len(r) == 0:
            return VaRMetrics(
                horizon_days=horizon_days,
                confidence_level=confidence_level,
                parametric_var_pct=0.0,
                historical_var_pct=0.0,
                cornish_fisher_var_pct=0.0,
                expected_shortfall_cvar_pct=0.0,
                is_one_sided_left_tail=True
            )

        mean_d = float(np.mean(r))
        std_d = float(np.std(r))
        skew_d = float(stats.skew(r))
        kurt_d = float(stats.kurtosis(r))

        alpha = 1.0 - confidence_level  # e.g. 0.05 for 95%
        z_alpha = stats.norm.ppf(alpha)  # e.g. -1.645

        # 1. Parametric VaR (1-sided left tail loss, expressed as positive % loss)
        param_var = - (mean_d + z_alpha * std_d) * np.sqrt(horizon_days) * 100.0

        # 2. Historical VaR
        hist_cutoff = np.percentile(r, alpha * 100.0)
        hist_var = - hist_cutoff * np.sqrt(horizon_days) * 100.0

        # 3. Cornish-Fisher Expansion (Adjusts for Skewness and Kurtosis)
        z = z_alpha
        z_cf = (
            z
            + (skew_d / 6.0) * (z**2 - 1.0)
            + (kurt_d / 24.0) * (z**3 - 3.0 * z)
            - (skew_d**2 / 36.0) * (2.0 * z**3 - 5.0 * z)
        )
        cf_var = - (mean_d + z_cf * std_d) * np.sqrt(horizon_days) * 100.0

        # 4. Expected Shortfall (CVaR: conditional mean of losses beyond VaR)
        tail_losses = r[r <= hist_cutoff]
        cvar = - float(np.mean(tail_losses)) * np.sqrt(horizon_days) * 100.0 if len(tail_losses) > 0 else hist_var

        return VaRMetrics(
            horizon_days=horizon_days,
            confidence_level=confidence_level,
            parametric_var_pct=round(max(0.0, float(param_var)), 2),
            historical_var_pct=round(max(0.0, float(hist_var)), 2),
            cornish_fisher_var_pct=round(max(0.0, float(cf_var)), 2),
            expected_shortfall_cvar_pct=round(max(0.0, float(cvar)), 2),
            is_one_sided_left_tail=True  # CRITICAL INVARIANT: NEVER A 2-SIDED CONFIDENCE INTERVAL
        )

    def run_monte_carlo(
        self,
        simulation_type: str = "LUMP_SUM",  # "LUMP_SUM" or "MONTHLY_SIP"
        initial_investment: float = 100000.0,
        monthly_contribution: float = 10000.0,
        horizon_months: int = 60,
        annual_expected_return: float = 0.12,
        annual_volatility: float = 0.18,
        simulation_count: int = 1000,
        seed: int = 42
    ) -> MonteCarloResult:
        """
        Executes path-based Monte Carlo simulation.
        CRITICAL INVARIANT: Maximum drawdown is computed path-by-path from simulated equity peaks,
        NEVER estimated via volatility formula alone!
        """
        rng = np.random.default_rng(seed)
        dt = 1.0 / 12.0  # monthly steps
        monthly_drift = (annual_expected_return - 0.5 * annual_volatility**2) * dt
        monthly_vol = annual_volatility * np.sqrt(dt)

        steps = horizon_months
        paths = np.zeros((simulation_count, steps + 1))

        if simulation_type.upper() == "MONTHLY_SIP":
            paths[:, 0] = initial_investment
            total_invested = initial_investment + monthly_contribution * steps
            for t in range(1, steps + 1):
                monthly_shocks = rng.normal(0, 1, simulation_count)
                growths = np.exp(monthly_drift + monthly_vol * monthly_shocks)
                paths[:, t] = (paths[:, t - 1] + monthly_contribution) * growths
        else:
            paths[:, 0] = initial_investment
            total_invested = initial_investment
            for t in range(1, steps + 1):
                monthly_shocks = rng.normal(0, 1, simulation_count)
                growths = np.exp(monthly_drift + monthly_vol * monthly_shocks)
                paths[:, t] = paths[:, t - 1] * growths

        final_values = paths[:, -1]

        # Calculate PATH-BASED MAXIMUM DRAWDOWN across each simulated trajectory
        path_max_drawdowns = np.zeros(simulation_count)
        for i in range(simulation_count):
            path_i = paths[i, :]
            running_peak = np.maximum.accumulate(path_i)
            # Avoid division by zero
            safe_peaks = np.where(running_peak <= 0, 1.0, running_peak)
            drawdowns = (running_peak - path_i) / safe_peaks
            path_max_drawdowns[i] = float(np.max(drawdowns)) * 100.0

        # Percentile distribution
        pcts = {
            "p5": round(float(np.percentile(final_values, 5)), 2),
            "p10": round(float(np.percentile(final_values, 10)), 2),
            "p25": round(float(np.percentile(final_values, 25)), 2),
            "p50": round(float(np.percentile(final_values, 50)), 2),
            "p75": round(float(np.percentile(final_values, 75)), 2),
            "p90": round(float(np.percentile(final_values, 90)), 2),
            "p95": round(float(np.percentile(final_values, 95)), 2)
        }

        # Probability of loss P(Final Value < Total Invested)
        loss_count = int(np.sum(final_values < total_invested))
        p_loss = round(float(loss_count / simulation_count), 4)

        # Drawdown stats across paths
        mdd_median = round(float(np.median(path_max_drawdowns)), 2)
        mdd_p95 = round(float(np.percentile(path_max_drawdowns, 95)), 2)
        mdd_worst = round(float(np.max(path_max_drawdowns)), 2)

        # VaR on 1-year equivalent horizon
        annual_shocks = rng.normal(monthly_drift * 12, monthly_vol * np.sqrt(12), 252)
        var_metrics = self.calculate_var_metrics(annual_shocks, horizon_days=20, confidence_level=0.95)

        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
        metadata = self.build_metadata(
            data_source="Path-Based Stochastic Monte Carlo Engine (GBM)",
            data_timestamp=now_utc,
            limitations=[
                "GBM assumes constant drift and volatility over the entire investment horizon.",
                "Regime shifts, liquidity dry-ups, or systemic tail risks may exceed modeled distributions.",
                "Drawdown is rigorously evaluated path-by-path from running peaks across all simulated trajectories."
            ],
            parameters={
                "simulation_type": simulation_type,
                "initial_investment": initial_investment,
                "monthly_contribution": monthly_contribution,
                "horizon_months": horizon_months,
                "expected_return": annual_expected_return,
                "volatility": annual_volatility,
                "simulation_count": simulation_count
            },
            random_seed=seed
        )

        return MonteCarloResult(
            simulation_type="MONTHLY_SIP" if simulation_type.upper() == "MONTHLY_SIP" else "LUMP_SUM",
            initial_investment=initial_investment,
            monthly_contribution=monthly_contribution if simulation_type.upper() == "MONTHLY_SIP" else 0.0,
            horizon_months=horizon_months,
            simulation_count=simulation_count,
            random_seed=seed,
            median_final_value=pcts["p50"],
            total_invested=total_invested,
            percentile_distribution=pcts,
            probability_of_loss=p_loss,
            path_max_drawdown_median=mdd_median,
            path_max_drawdown_p95=mdd_p95,
            path_max_drawdown_worst=mdd_worst,
            var_metrics=var_metrics,
            metadata=metadata
        )

    async def execute(self, **kwargs) -> Any:
        symbols = kwargs.get("symbols", ["RELIANCE", "TCS", "INFY", "HDFCBANK"])
        return self.optimize_portfolio(symbols=symbols)
