"""
TradeSphere AI - Wealth: Goal-Based Scenario Modeling
Computes inflation-adjusted financial goals, suggested SIP allocations, and Monte Carlo shortfall probabilities.
"""
from typing import Dict, Any, List
import datetime
import numpy as np
from core.models import ScenarioResult, ResearchMetadata
from config import config

class ScenarioModeler:
    @classmethod
    def evaluate_goal_scenario(
        cls,
        goal_name: str = "Retirement Independence",
        target_amount: float = 20000000.0,
        horizon_years: int = 15,
        inflation_rate_pct: float = 6.0,
        expected_return_cagr: float = 12.0,
        seed: int = 42
    ) -> ScenarioResult:
        # Inflation-adjusted target
        inflation_mult = (1.0 + inflation_rate_pct / 100.0) ** horizon_years
        adjusted_target = target_amount * inflation_mult

        # Required Monthly SIP: P = FV * r / (((1+r)^n - 1) * (1+r))
        months = horizon_years * 12
        r_monthly = (expected_return_cagr / 100.0) / 12.0
        denom = (((1.0 + r_monthly) ** months - 1.0) / r_monthly) * (1.0 + r_monthly)
        required_sip = adjusted_target / denom if denom > 0 else 0.0

        # Recommended Asset Allocation based on investment horizon
        if horizon_years >= 10:
            allocation = {"equity_large_flexi": 0.70, "fixed_income_debt": 0.20, "gold_sovereign": 0.10, "cash_liquid": 0.00}
        elif horizon_years >= 5:
            allocation = {"equity_large_flexi": 0.55, "fixed_income_debt": 0.35, "gold_sovereign": 0.10, "cash_liquid": 0.00}
        else:
            allocation = {"equity_large_flexi": 0.25, "fixed_income_debt": 0.60, "gold_sovereign": 0.05, "cash_liquid": 0.10}

        # Monte Carlo shortfall probability
        sim_count = 1000
        rng = np.random.default_rng(seed)
        mu_monthly = (expected_return_cagr / 100.0) / 12.0
        sigma_monthly = 0.15 / np.sqrt(12.0)  # ~15% annualized portfolio volatility

        final_values = np.zeros(sim_count)
        for i in range(sim_count):
            corpus = 0.0
            shocks = rng.normal(0, 1, months)
            growths = np.exp((mu_monthly - 0.5 * sigma_monthly**2) + sigma_monthly * shocks)
            for m in range(months):
                corpus = (corpus + required_sip) * growths[m]
            final_values[i] = corpus

        shortfalls = int(np.sum(final_values < adjusted_target))
        shortfall_prob = round(float(shortfalls / sim_count), 4)

        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
        metadata = ResearchMetadata(
            methodology_version=config.methodology_version,
            data_source="Goal-Based Stochastic Scenario Simulator",
            data_timestamp=now_utc,
            limitations=[
                "Inflation rates vary dynamically and historical inflation may not match future consumer price indices.",
                "Shortfall probability reflects portfolio volatility drift and assumes disciplined monthly contributions.",
                "Taxes and capital gains surcharges will adjust post-tax corpus accumulation."
            ],
            reproducibility={
                "random_seed": seed,
                "execution_timestamp": now_utc,
                "algorithm_signature": "Goal Modeling Engine v1.0",
                "parameters": {
                    "goal_name": goal_name,
                    "target_amount": target_amount,
                    "horizon_years": horizon_years,
                    "inflation_rate_pct": inflation_rate_pct
                }
            },
            is_simulated=True,
            disclaimer="QUANTITATIVE RESEARCH ONLY – NOT FINANCIAL ADVICE. NO PREDICTIONS ARE GUARANTEED."
        )

        return ScenarioResult(
            goal_name=goal_name,
            target_amount=round(target_amount, 2),
            horizon_years=horizon_years,
            inflation_rate_pct=round(inflation_rate_pct, 2),
            inflation_adjusted_target=round(adjusted_target, 2),
            suggested_monthly_sip=round(required_sip, 2),
            shortfall_probability=shortfall_prob,
            recommended_asset_allocation=allocation,
            metadata=metadata
        )
