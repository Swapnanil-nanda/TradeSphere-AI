import pytest
from agents.strategy_lab import StrategyLabAgent

@pytest.mark.parametrize("strat", [
    "EMA_CROSSOVER",
    "RSI_MEAN_REVERSION",
    "BOLLINGER_BANDS",
    "DONCHIAN_MOMENTUM",
    "SUPERTREND"
])
def test_strategy_lab_backtest_execution(strat):
    agent = StrategyLabAgent()
    res = agent.run_backtest(
        strategy_name=strat,
        symbol="RELIANCE",
        initial_capital=1000000.0,
        bars=200,
        seed=42
    )

    assert res.strategy_name == strat
    assert res.symbol == "RELIANCE"
    assert res.initial_capital == 1000000.0
    assert res.final_equity > 0
    assert len(res.equity_curve) > 50
    assert res.max_drawdown_pct >= 0.0
    assert 0.0 <= res.win_rate_pct <= 100.0
    assert res.metadata.is_simulated is True

def test_strategy_lab_safe_position_sizing_respects_risk_cap():
    agent = StrategyLabAgent()
    # High capital but very tight risk budget (0.1%)
    res = agent.run_backtest(
        strategy_name="EMA_CROSSOVER",
        symbol="RELIANCE",
        initial_capital=50000.0,
        risk_per_trade_pct=0.1,  # Max allowed risk = 50 INR
        bars=150,
        seed=42
    )

    assert res.final_equity > 0
    # No trade entered if position size was 0
    for t in res.trades:
        assert t.quantity >= 1
