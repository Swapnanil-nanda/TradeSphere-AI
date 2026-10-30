"""
TradeSphere AI - Agent 4: Historical Similarity / Analogue Agent
Finds historical analogues via normalized trajectory distance matching and evaluates forward return distributions.
"""
from typing import List, Dict, Any, Optional
import datetime
import numpy as np
import pandas as pd
from agents.base import BaseQuantAgent
from core.models import HistoricalAnalogueMatch, HistoricalAnalogueResult, ResearchMetadata
from agents.market_data import MarketDataAgent

class HistoricalSimilarityAgent(BaseQuantAgent):
    def __init__(self, market_data_agent: Optional[MarketDataAgent] = None):
        super().__init__(
            name="HistoricalSimilarityAgent",
            description="Identifies historical price trajectory analogues and computes post-analogue forward return distributions."
        )
        self.market_data = market_data_agent or MarketDataAgent()

    def find_analogues(
        self,
        symbol: str,
        target_window_bars: int = 20,
        history_bars: int = 500,
        top_k: int = 5
    ) -> HistoricalAnalogueResult:
        df, _, _ = self.market_data.fetch_ohlcv(symbol=symbol, bars=history_bars, seed=77)
        closes = df["close"].values
        timestamps = df["timestamp"].values

        if len(closes) < target_window_bars + 25:
            target_window_bars = 10

        # Current reference window normalized trajectory (z-score)
        ref_window = closes[-target_window_bars:]
        ref_norm = (ref_window - np.mean(ref_window)) / (np.std(ref_window) + 1e-8)

        candidates: List[HistoricalAnalogueMatch] = []
        max_start = len(closes) - target_window_bars - 21  # leave at least 20 bars forward

        for start_idx in range(0, max_start):
            hist_window = closes[start_idx : start_idx + target_window_bars]
            hist_norm = (hist_window - np.mean(hist_window)) / (np.std(hist_window) + 1e-8)

            # Normalized Euclidean distance
            dist = float(np.linalg.norm(ref_norm - hist_norm))
            # Convert distance to similarity score in [0, 1]
            similarity = float(1.0 / (1.0 + dist / np.sqrt(target_window_bars)))

            # Forward returns
            base_price = hist_window[-1]
            fwd_1d = float((closes[start_idx + target_window_bars] - base_price) / base_price * 100.0)
            fwd_5d = float((closes[start_idx + target_window_bars + 4] - base_price) / base_price * 100.0)
            fwd_20d = float((closes[start_idx + target_window_bars + 19] - base_price) / base_price * 100.0)

            candidates.append(HistoricalAnalogueMatch(
                match_id=f"analogue_{start_idx}",
                reference_start=str(timestamps[-target_window_bars]),
                reference_end=str(timestamps[-1]),
                historical_start=str(timestamps[start_idx]),
                historical_end=str(timestamps[start_idx + target_window_bars - 1]),
                similarity_score=round(similarity, 4),
                distance_metric="Normalized Euclidean Trajectory Distance",
                forward_1d_return=round(fwd_1d, 2),
                forward_5d_return=round(fwd_5d, 2),
                forward_20d_return=round(fwd_20d, 2)
            ))

        # Sort by similarity descending
        candidates.sort(key=lambda m: m.similarity_score, reverse=True)
        top_matches = candidates[:top_k]

        # Calculate forward distributions across top matches
        fwd_1d_arr = [m.forward_1d_return for m in top_matches]
        fwd_5d_arr = [m.forward_5d_return for m in top_matches]
        fwd_20d_arr = [m.forward_20d_return for m in top_matches]

        def get_dist_stats(arr):
            return {
                "mean": round(float(np.mean(arr)), 2),
                "median": round(float(np.median(arr)), 2),
                "min": round(float(np.min(arr)), 2),
                "max": round(float(np.max(arr)), 2),
                "std": round(float(np.std(arr)), 2),
                "positive_ratio": round(float(np.mean([1 if x > 0 else 0 for x in arr])), 2)
            }

        forward_distribution = {
            "1d": get_dist_stats(fwd_1d_arr),
            "5d": get_dist_stats(fwd_5d_arr),
            "20d": get_dist_stats(fwd_20d_arr)
        }

        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
        metadata = self.build_metadata(
            data_source=f"Historical Price Series Pattern Matching ({symbol})",
            data_timestamp=now_utc,
            limitations=[
                "Historical price similarity does not account for differing macroeconomic, monetary, or regulatory regimes.",
                "Small candidate sample sizes may introduce pattern selection bias.",
                "Past analogues are probabilistic indicators and do NOT ensure future price path repetition."
            ],
            parameters={
                "symbol": symbol,
                "target_window_bars": target_window_bars,
                "history_bars_scanned": history_bars,
                "top_k": top_k
            }
        )

        return HistoricalAnalogueResult(
            symbol=symbol,
            target_window_bars=target_window_bars,
            total_candidates_scanned=len(candidates),
            top_matches=top_matches,
            forward_distribution=forward_distribution,
            analogue_certainty=False,  # CRITICAL INVARIANT: NEVER CERTAIN
            metadata=metadata
        )

    async def execute(self, symbol: str = "RELIANCE", **kwargs) -> Any:
        return self.find_analogues(symbol=symbol, **kwargs)
