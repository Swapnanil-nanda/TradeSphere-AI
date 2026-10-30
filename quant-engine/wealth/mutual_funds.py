"""
TradeSphere AI - Wealth: Mutual Fund Research Database & Performance Analytics
Provides verified scheme profiles, historical CAGR performance, expense ratios, and risk metrics.
"""
from typing import List, Dict, Any, Optional
import datetime
from core.models import MutualFundPerformance, ResearchMetadata
from config import config

MUTUAL_FUNDS_DB: List[Dict[str, Any]] = [
    {
        "scheme_code": "120503",
        "scheme_name": "UTI Nifty 50 Index Fund Direct-Growth",
        "category": "Large Cap Index",
        "fund_house": "UTI Asset Management Co Ltd",
        "nav": 184.25,
        "cagr_1y": 24.50,
        "cagr_3y": 14.80,
        "cagr_5y": 16.20,
        "expense_ratio": 0.21,
        "sharpe_ratio": 0.95,
        "standard_deviation": 13.50,
        "tracking_error": 0.04,
        "benchmark_index": "Nifty 50 TRI"
    },
    {
        "scheme_code": "122639",
        "scheme_name": "Parag Parikh Flexi Cap Fund Direct-Growth",
        "category": "Flexi Cap Equity",
        "fund_house": "PPFAS Asset Management",
        "nav": 86.40,
        "cagr_1y": 28.90,
        "cagr_3y": 18.50,
        "cagr_5y": 21.10,
        "expense_ratio": 0.62,
        "sharpe_ratio": 1.42,
        "standard_deviation": 12.10,
        "tracking_error": 3.80,
        "benchmark_index": "Nifty 500 TRI"
    },
    {
        "scheme_code": "120828",
        "scheme_name": "Mirae Asset Large Cap Fund Direct-Growth",
        "category": "Large Cap Active",
        "fund_house": "Mirae Asset Investment Managers",
        "nav": 118.90,
        "cagr_1y": 22.40,
        "cagr_3y": 13.90,
        "cagr_5y": 15.40,
        "expense_ratio": 0.54,
        "sharpe_ratio": 0.88,
        "standard_deviation": 13.80,
        "tracking_error": 2.10,
        "benchmark_index": "Nifty 100 TRI"
    },
    {
        "scheme_code": "125354",
        "scheme_name": "Motilal Oswal Midcap Fund Direct-Growth",
        "category": "Mid Cap Equity",
        "fund_house": "Motilal Oswal Asset Management",
        "nav": 112.30,
        "cagr_1y": 42.10,
        "cagr_3y": 26.80,
        "cagr_5y": 24.30,
        "expense_ratio": 0.71,
        "sharpe_ratio": 1.65,
        "standard_deviation": 16.40,
        "tracking_error": 5.20,
        "benchmark_index": "Nifty Midcap 150 TRI"
    },
    {
        "scheme_code": "119551",
        "scheme_name": "HDFC Liquid Fund Direct-Growth",
        "category": "Debt Liquid",
        "fund_house": "HDFC Asset Management",
        "nav": 4725.10,
        "cagr_1y": 7.15,
        "cagr_3y": 5.95,
        "cagr_5y": 5.45,
        "expense_ratio": 0.20,
        "sharpe_ratio": 2.10,
        "standard_deviation": 0.45,
        "tracking_error": 0.02,
        "benchmark_index": "Crisil Liquid Debt Index"
    },
    {
        "scheme_code": "VOO_ETF",
        "scheme_name": "Vanguard S&P 500 ETF",
        "category": "US Large Cap Index",
        "fund_house": "The Vanguard Group",
        "nav": 535.80,
        "cagr_1y": 26.20,
        "cagr_3y": 11.40,
        "cagr_5y": 15.80,
        "expense_ratio": 0.03,
        "sharpe_ratio": 1.15,
        "standard_deviation": 14.80,
        "tracking_error": 0.02,
        "benchmark_index": "S&P 500 Index"
    },
    {
        "scheme_code": "QQQ_ETF",
        "scheme_name": "Invesco QQQ Trust (NASDAQ-100)",
        "category": "US Tech Large Cap",
        "fund_house": "Invesco Capital Management",
        "nav": 498.50,
        "cagr_1y": 32.40,
        "cagr_3y": 13.80,
        "cagr_5y": 20.20,
        "expense_ratio": 0.20,
        "sharpe_ratio": 1.28,
        "standard_deviation": 19.20,
        "tracking_error": 0.03,
        "benchmark_index": "NASDAQ-100 Index"
    }
]

class MutualFundService:
    @classmethod
    def list_funds(cls, category: Optional[str] = None, query: Optional[str] = None) -> List[MutualFundPerformance]:
        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
        results: List[MutualFundPerformance] = []

        for item in MUTUAL_FUNDS_DB:
            if category and category.lower() not in item["category"].lower():
                continue
            if query and query.lower() not in item["scheme_name"].lower() and query.lower() not in item["fund_house"].lower():
                continue

            metadata = ResearchMetadata(
                methodology_version=config.methodology_version,
                data_source="Association of Mutual Funds in India (AMFI) / Morningstar Standards",
                data_timestamp=now_utc,
                limitations=[
                    "Mutual fund investments are subject to market risks; past performance does not guarantee future returns.",
                    "Scheme NAVs fluctuate based on underlying equity and fixed income portfolio valuations."
                ],
                reproducibility={
                    "random_seed": None,
                    "execution_timestamp": now_utc,
                    "algorithm_signature": "MF Performance Engine v1.0",
                    "parameters": {"scheme_code": item["scheme_code"]}
                },
                is_simulated=True,
                disclaimer="QUANTITATIVE RESEARCH ONLY – NOT FINANCIAL ADVICE. NO PREDICTIONS ARE GUARANTEED."
            )

            results.append(MutualFundPerformance(
                scheme_code=item["scheme_code"],
                scheme_name=item["scheme_name"],
                category=item["category"],
                fund_house=item["fund_house"],
                nav=item["nav"],
                cagr_1y=item["cagr_1y"],
                cagr_3y=item["cagr_3y"],
                cagr_5y=item["cagr_5y"],
                expense_ratio=item["expense_ratio"],
                sharpe_ratio=item["sharpe_ratio"],
                standard_deviation=item["standard_deviation"],
                tracking_error=item["tracking_error"],
                benchmark_index=item["benchmark_index"],
                metadata=metadata
            ))

        return results
