import pytest
from agents.technical_analysis import TechnicalAnalysisAgent

def test_technical_indicators_and_regimes():
    agent = TechnicalAnalysisAgent()
    res = agent.analyze(symbol="RELIANCE", bars=220)

    assert res.symbol == "RELIANCE"
    assert res.current_price > 0
    assert res.sma_20 > 0
    assert res.sma_50 > 0
    assert res.ema_20 > 0
    assert 0 <= res.rsi_14 <= 100
    assert res.bb_upper > res.bb_middle > res.bb_lower
    assert res.atr_14 > 0
    assert res.supertrend_direction in ["BULLISH", "BEARISH"]
    assert res.donchian_high_20 >= res.donchian_low_20
    assert res.regime in ["BULLISH_TREND", "BEARISH_TREND", "MEAN_REVERSION_RANGE", "HIGH_VOLATILITY_EXPANSION"]
    assert res.metadata.is_simulated is True
