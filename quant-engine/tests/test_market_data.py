import pytest
from agents.market_data import MarketDataAgent

def test_fetch_ohlcv_generates_valid_bars():
    agent = MarketDataAgent()
    df, quality, metadata = agent.fetch_ohlcv(symbol="RELIANCE", bars=60, seed=42)

    assert len(df) == 60
    assert "close" in df.columns
    assert "open" in df.columns
    assert "high" in df.columns
    assert "low" in df.columns
    assert "volume" in df.columns
    assert quality.is_valid is True
    assert quality.total_bars == 60
    assert metadata.data_source.startswith("Synthetic Calibrated Market Feed")
    assert metadata.reproducibility.random_seed == 42

def test_multi_asset_returns_alignment():
    agent = MarketDataAgent()
    symbols = ["RELIANCE", "TCS", "AAPL"]
    returns_df, _, metadata = agent.get_multi_asset_returns(symbols=symbols, bars=100, seed=42)

    assert len(returns_df) == 100
    assert list(returns_df.columns) == symbols
    assert metadata.reproducibility.parameters["symbols"] == symbols
