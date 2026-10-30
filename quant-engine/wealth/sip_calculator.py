"""
TradeSphere AI - Wealth: Systematic Investment Plan (SIP) Calculator
Computes standard and step-up SIP wealth projections with month-by-month compound schedules.
"""
from typing import Dict, Any, List
import datetime
from core.models import SIPPlanResult, ResearchMetadata
from config import config

class SIPCalculator:
    @classmethod
    def calculate_sip(
        self,
        monthly_investment: float = 10000.0,
        annual_step_up_pct: float = 10.0,
        expected_return_cagr: float = 12.0,
        investment_horizon_years: int = 15
    ) -> SIPPlanResult:
        months = investment_horizon_years * 12
        monthly_rate = (expected_return_cagr / 100.0) / 12.0

        current_monthly = monthly_investment
        total_invested = 0.0
        corpus = 0.0

        yearly_schedule: List[Dict[str, Any]] = []
        year_invested = 0.0

        for m in range(1, months + 1):
            total_invested += current_monthly
            year_invested += current_monthly
            corpus = (corpus + current_monthly) * (1.0 + monthly_rate)

            # Record annual progress and apply annual step-up
            if m % 12 == 0:
                year_num = m // 12
                yearly_schedule.append({
                    "year": year_num,
                    "monthly_contribution": round(current_monthly, 2),
                    "annual_invested": round(year_invested, 2),
                    "cumulative_invested": round(total_invested, 2),
                    "corpus_value": round(corpus, 2),
                    "wealth_gain": round(corpus - total_invested, 2)
                })
                year_invested = 0.0
                if annual_step_up_pct > 0:
                    current_monthly = current_monthly * (1.0 + annual_step_up_pct / 100.0)

        wealth_gain = corpus - total_invested
        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()

        metadata = ResearchMetadata(
            methodology_version=config.methodology_version,
            data_source="Mathematical Compound Growth Engine",
            data_timestamp=now_utc,
            limitations=[
                "Calculations assume constant annualized CAGR without sequencing of returns risk.",
                "Actual mutual fund returns fluctuate with market volatility and market drawdowns.",
                "Taxes (LTCG/STCG) and exit loads are not deducted from gross projections."
            ],
            reproducibility={
                "random_seed": None,
                "execution_timestamp": now_utc,
                "algorithm_signature": "Compound SIP Model v1.0",
                "parameters": {
                    "monthly_investment": monthly_investment,
                    "annual_step_up_pct": annual_step_up_pct,
                    "expected_return_cagr": expected_return_cagr,
                    "investment_horizon_years": investment_horizon_years
                }
            },
            is_simulated=True,
            disclaimer="QUANTITATIVE RESEARCH ONLY – NOT FINANCIAL ADVICE. NO PREDICTIONS ARE GUARANTEED."
        )

        return SIPPlanResult(
            monthly_investment=monthly_investment,
            annual_step_up_pct=annual_step_up_pct,
            expected_return_cagr=expected_return_cagr,
            investment_horizon_years=investment_horizon_years,
            total_invested=round(total_invested, 2),
            estimated_future_value=round(corpus, 2),
            wealth_gain=round(wealth_gain, 2),
            yearly_schedule=yearly_schedule,
            metadata=metadata
        )
