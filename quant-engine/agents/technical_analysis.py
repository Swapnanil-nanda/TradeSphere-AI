"""
TradeSphere AI - Agent 3: Technical Analysis Agent
Computes mathematical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, ATR, Supertrend, Donchian)
and classifies the underlying market regime.
"""
from typing import Dict, Any, Optional
import datetime
import numpy as np
import pandas as pd
from agents.base import BaseQuantAgent
from core.models import TechnicalIndicatorsOutput, ResearchMetadata
from agents.market_data import MarketDataAgent

class TechnicalAnalysisAgent(BaseQuantAgent):
    def __init__(self, market_data_agent: Optional[MarketDataAgent] = None):
        super().__init__(
            name="TechnicalAnalysisAgent",
            description="Calculates zero-drift technical indicators and identifies market regimes."
        )
        self.market_data = market_data_agent or MarketDataAgent()

    def analyze(self, symbol: str, bars: int = 220) -> TechnicalIndicatorsOutput:
        df, _, _ = self.market_data.fetch_ohlcv(symbol=symbol, bars=bars)
        closes = df["close"].values
        highs = df["high"].values
        lows = df["low"].values

        # 1. Moving Averages
        sma_20 = float(np.mean(closes[-20:]))
        sma_50 = float(np.mean(closes[-50:]))
        sma_200 = float(np.mean(closes[-200:])) if len(closes) >= 200 else None

        # EMA-20
        alpha_ema = 2.0 / (20.0 + 1.0)
        ema = closes[0]
        for c in closes[1:]:
            ema = alpha_ema * c + (1.0 - alpha_ema) * ema
        ema_20 = float(ema)

        # 2. RSI-14 (Wilder's Smoothing)
        deltas = np.diff(closes)
        gains = np.maximum(deltas, 0)
        losses = np.maximum(-deltas, 0)
        if len(deltas) >= 14:
            avg_gain = np.mean(gains[:14])
            avg_loss = np.mean(losses[:14])
            for i in range(14, len(deltas)):
                avg_gain = (avg_gain * 13 + gains[i]) / 14
                avg_loss = (avg_loss * 13 + losses[i]) / 14
            rs = avg_gain / (avg_loss + 1e-10)
            rsi_14 = float(100.0 - (100.0 / (1.0 + rs)))
        else:
            rsi_14 = 50.0

        # 3. MACD (12, 26, 9)
        def calc_ema_series(arr, period):
            alpha = 2.0 / (period + 1.0)
            res = np.empty_like(arr)
            res[0] = arr[0]
            for idx in range(1, len(arr)):
                res[idx] = alpha * arr[idx] + (1.0 - alpha) * res[idx - 1]
            return res

        ema12 = calc_ema_series(closes, 12)
        ema26 = calc_ema_series(closes, 26)
        macd_series = ema12 - ema26
        signal_series = calc_ema_series(macd_series, 9)
        macd_line = float(macd_series[-1])
        macd_signal = float(signal_series[-1])
        macd_hist = float(macd_line - macd_signal)

        # 4. Bollinger Bands (20, 2)
        bb_std = float(np.std(closes[-20:]))
        bb_middle = sma_20
        bb_upper = float(bb_middle + 2.0 * bb_std)
        bb_lower = float(bb_middle - 2.0 * bb_std)

        # 5. ATR-14 (Average True Range)
        tr = np.zeros(len(closes))
        tr[0] = highs[0] - lows[0]
        for i in range(1, len(closes)):
            tr[i] = max(highs[i] - lows[i], abs(highs[i] - closes[i-1]), abs(lows[i] - closes[i-1]))
        atr_14 = float(np.mean(tr[-14:]))

        # 6. Donchian Channels (20)
        donchian_high = float(np.max(highs[-20:]))
        donchian_low = float(np.min(lows[-20:]))

        # 7. Supertrend (10, 3)
        mult = 3.0
        upper_band = (highs[-1] + lows[-1]) / 2.0 + mult * atr_14
        lower_band = (highs[-1] + lows[-1]) / 2.0 - mult * atr_14
        curr_price = float(closes[-1])

        if curr_price >= ema_20:
            supertrend_dir = "BULLISH"
            supertrend_val = float(lower_band)
        else:
            supertrend_dir = "BEARISH"
            supertrend_val = float(upper_band)

        # 8. Regime Detection
        bb_bandwidth = (bb_upper - bb_lower) / bb_middle
        if bb_bandwidth > 0.08:
            regime = "HIGH_VOLATILITY_EXPANSION"
        elif curr_price > ema_20 and macd_hist > 0 and rsi_14 > 50:
            regime = "BULLISH_TREND"
        elif curr_price < ema_20 and macd_hist < 0 and rsi_14 < 50:
            regime = "BEARISH_TREND"
        else:
            regime = "MEAN_REVERSION_RANGE"

        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
        metadata = self.build_metadata(
            data_source=f"Synthetic OHLCV Bar Feed ({symbol})",
            data_timestamp=now_utc,
            limitations=[
                "Technical indicators are mathematical transformations of past price action and lag real-time shocks.",
                "Indicator signals assume regime stationarity and are subject to false breakouts in choppy ranges."
            ],
            parameters={"symbol": symbol, "bars": bars, "indicators": ["SMA", "EMA", "RSI", "MACD", "BB", "ATR", "Supertrend", "Donchian"]}
        )

        return TechnicalIndicatorsOutput(
            symbol=symbol,
            timeframe="1d",
            current_price=curr_price,
            sma_20=round(sma_20, 2),
            sma_50=round(sma_50, 2),
            sma_200=round(sma_200, 2) if sma_200 is not None else None,
            ema_20=round(ema_20, 2),
            rsi_14=round(rsi_14, 2),
            macd_line=round(macd_line, 2),
            macd_signal=round(macd_signal, 2),
            macd_hist=round(macd_hist, 2),
            bb_upper=round(bb_upper, 2),
            bb_middle=round(bb_middle, 2),
            bb_lower=round(bb_lower, 2),
            atr_14=round(atr_14, 2),
            supertrend_val=round(supertrend_val, 2),
            supertrend_direction=supertrend_dir,
            donchian_high_20=round(donchian_high, 2),
            donchian_low_20=round(donchian_low, 2),
            regime=regime,
            metadata=metadata
        )

    async def execute(self, symbol: str = "RELIANCE", **kwargs) -> Any:
        return self.analyze(symbol=symbol)
