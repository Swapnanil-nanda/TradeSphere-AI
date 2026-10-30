"""
TradeSphere AI - Agent 1: Market Data Agent
Fetches, cleans, validates, and standardizes multi-asset OHLCV, returns, and risk-free benchmarks.
"""
from typing import List, Dict, Any, Optional
import datetime
import numpy as np
import pandas as pd
from agents.base import BaseQuantAgent
from core.models import CandlePoint, DataQualityReport, ResearchMetadata
from config import config

INSTRUMENT_BASE_PRICES = {
    # Indian Equities (INR)
    "RELIANCE": {"price": 2985.40, "vol": 0.22, "drift": 0.14, "market": "IN"},
    "TCS": {"price": 4125.00, "vol": 0.18, "drift": 0.12, "market": "IN"},
    "INFY": {"price": 1892.50, "vol": 0.24, "drift": 0.13, "market": "IN"},
    "HDFCBANK": {"price": 1748.20, "vol": 0.19, "drift": 0.11, "market": "IN"},
    "ICICIBANK": {"price": 1230.50, "vol": 0.21, "drift": 0.15, "market": "IN"},
    "SBIN": {"price": 825.40, "vol": 0.26, "drift": 0.14, "market": "IN"},
    "TATAMOTORS": {"price": 985.00, "vol": 0.29, "drift": 0.16, "market": "IN"},
    "BHARTIARTL": {"price": 1640.80, "vol": 0.20, "drift": 0.15, "market": "IN"},
    "ITC": {"price": 478.20, "vol": 0.16, "drift": 0.10, "market": "IN"},
    # US Equities (USD)
    "AAPL": {"price": 234.50, "vol": 0.23, "drift": 0.18, "market": "US"},
    "MSFT": {"price": 431.20, "vol": 0.21, "drift": 0.17, "market": "US"},
    "NVDA": {"price": 142.60, "vol": 0.45, "drift": 0.35, "market": "US"},
    "TSLA": {"price": 219.80, "vol": 0.52, "drift": 0.25, "market": "US"},
    "GOOGL": {"price": 181.40, "vol": 0.25, "drift": 0.16, "market": "US"},
    # Benchmark Indices
    "NIFTY50": {"price": 24350.00, "vol": 0.14, "drift": 0.12, "market": "IN"},
    "SP500": {"price": 5850.00, "vol": 0.15, "drift": 0.11, "market": "US"}
}

class MarketDataAgent(BaseQuantAgent):
    def __init__(self):
        super().__init__(
            name="MarketDataAgent",
            description="Acquires, cleans, and standardizes historical OHLCV data, asset returns, and interest rates."
        )

    def get_risk_free_rate(self, market: str = "IN") -> float:
        if market.upper() in ["US", "NASDAQ", "NYSE"]:
            return config.default_risk_free_rate_us
        return config.default_risk_free_rate_in

    def fetch_ohlcv(
        self,
        symbol: str,
        bars: int = 120,
        timeframe: str = "1d",
        seed: Optional[int] = 42
    ) -> (pd.DataFrame, DataQualityReport, ResearchMetadata):
        """
        Generates clean calibrated historical price series using Geometric Brownian Motion
        with realistic intraday volatility spread and volume.
        """
        sym_clean = symbol.upper().replace(".NS", "").replace("^", "")
        profile = INSTRUMENT_BASE_PRICES.get(sym_clean, {"price": 1000.0, "vol": 0.25, "drift": 0.12, "market": "IN"})

        dt_end = datetime.datetime.now(datetime.timezone.utc)
        if seed is not None:
            rng = np.random.default_rng(seed)
        else:
            rng = np.random.default_rng()

        annual_vol = profile["vol"]
        annual_drift = profile["drift"]
        daily_dt = 1.0 / 252.0
        daily_drift = (annual_drift - 0.5 * annual_vol**2) * daily_dt
        daily_vol = annual_vol * np.sqrt(daily_dt)

        # Generate price trajectory
        shocks = rng.normal(0, 1, bars)
        log_returns = daily_drift + daily_vol * shocks
        
        # Build price series working backward to ensure current close aligns with base price
        cum_ret = np.cumsum(log_returns)
        cum_ret = cum_ret - cum_ret[-1]  # Anchor the last price to profile price
        close_prices = profile["price"] * np.exp(cum_ret)

        records = []
        for i in range(bars):
            day_offset = bars - 1 - i
            bar_date = dt_end - datetime.timedelta(days=day_offset)
            c = float(close_prices[i])
            # Realistic intra-bar spread
            high_factor = 1.0 + float(rng.uniform(0.002, 0.015))
            low_factor = 1.0 - float(rng.uniform(0.002, 0.015))
            open_factor = 1.0 + float(rng.normal(0.0, 0.004))

            h = round(max(c * high_factor, c * open_factor, c), 2)
            l = round(min(c * low_factor, c * open_factor, c), 2)
            o = round(c * open_factor, 2)
            c = round(c, 2)
            vol = int(rng.uniform(500000, 3500000))

            records.append({
                "timestamp": bar_date.strftime("%Y-%m-%d"),
                "open": o,
                "high": h,
                "low": l,
                "close": c,
                "volume": vol
            })

        df = pd.DataFrame(records)
        df["return"] = df["close"].pct_change().fillna(0.0)

        # Quality audit
        outliers = int((np.abs(df["return"]) > 0.10).sum())
        quality = DataQualityReport(
            total_bars=len(df),
            missing_bars=0,
            outliers_detected=outliers,
            freshness_seconds=0.0,
            is_valid=True
        )

        metadata = self.build_metadata(
            data_source=f"Synthetic Calibrated Market Feed ({profile['market']})",
            data_timestamp=dt_end.isoformat(),
            limitations=[
                "Synthetic Geometric Brownian Motion series calibrated to historical asset volatility.",
                "Real historical corporate actions (dividends, stock splits) are not reflected in synthetic runs."
            ],
            parameters={"symbol": symbol, "bars": bars, "timeframe": timeframe},
            random_seed=seed
        )

        return df, quality, metadata

    def get_multi_asset_returns(
        self,
        symbols: List[str],
        bars: int = 252,
        seed: Optional[int] = 42
    ) -> (pd.DataFrame, Dict[str, Any], ResearchMetadata):
        """
        Returns a synchronized return matrix across multiple assets with realistic cross-asset correlations.
        """
        returns_dict = {}
        for idx, sym in enumerate(symbols):
            sym_seed = (seed + idx * 101) if seed is not None else None
            df, _, _ = self.fetch_ohlcv(sym, bars=bars, seed=sym_seed)
            returns_dict[sym] = df["return"].values

        returns_df = pd.DataFrame(returns_dict)
        # Apply realistic correlation blending if > 1 asset
        if len(symbols) > 1:
            # Create correlation factor
            n = len(symbols)
            corr_target = 0.35  # Average equity correlation
            cov_factor = np.full((n, n), corr_target)
            np.fill_diagonal(cov_factor, 1.0)
            L = np.linalg.cholesky(cov_factor)
            raw_matrix = returns_df.values
            correlated_matrix = raw_matrix @ L.T
            returns_df = pd.DataFrame(correlated_matrix, columns=symbols)

        metadata = self.build_metadata(
            data_source="Synchronized Multi-Asset Feed",
            data_timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            limitations=[
                "Cross-asset correlation matrix estimated under stationary market conditions.",
                "Tail dependence during extreme market stress may exceed linear Pearson correlation."
            ],
            parameters={"symbols": symbols, "bars": bars},
            random_seed=seed
        )

        return returns_df, {}, metadata

    async def execute(self, symbol: str = "RELIANCE", bars: int = 120, **kwargs) -> Any:
        df, quality, metadata = self.fetch_ohlcv(symbol=symbol, bars=bars, **kwargs)
        candles = [
            CandlePoint(
                timestamp=row["timestamp"],
                open=row["open"],
                high=row["high"],
                low=row["low"],
                close=row["close"],
                volume=row["volume"]
            )
            for _, row in df.iterrows()
        ]
        return {
            "symbol": symbol,
            "quality": quality.model_dump(),
            "candles": [c.model_dump() for c in candles],
            "metadata": metadata.model_dump()
        }
