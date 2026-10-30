import pytest
from agents.forecasting import ForecastingAgent

def test_calibrated_forecasting_invariants():
    agent = ForecastingAgent()
    res = agent.generate_forecasts(symbol="RELIANCE", history_bars=252)

    assert res.symbol == "RELIANCE"
    assert len(res.horizons) == 3
    # Check 1d, 5d, 20d
    horizons = [h.horizon_days for h in res.horizons]
    assert horizons == [1, 5, 20]

    for h in res.horizons:
        # Confidence intervals: lower < median < upper
        assert h.confidence_interval_95[0] < h.confidence_interval_80[0]
        assert h.confidence_interval_80[1] < h.confidence_interval_95[1]
        assert h.out_of_sample_metrics["mae_pct"] > 0
        assert h.out_of_sample_metrics["directional_accuracy_pct"] >= 50.0
        # CRITICAL INVARIANT: certainty_claimed must be False
        assert h.certainty_claimed is False
