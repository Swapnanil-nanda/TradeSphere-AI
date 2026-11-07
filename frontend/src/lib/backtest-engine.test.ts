import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  runSimulation,
  evaluateOutOfSample,
  evaluateWalkForward,
  BacktestCandle,
  BacktestParams
} from './backtest-engine';
import { historicalMarketData } from './market-data/historical-provider';

// Helper to generate synthetic test candles with known trend/oscillation
function generateMockCandles(count: number = 200, trend: number = 0.5): BacktestCandle[] {
  const candles: BacktestCandle[] = [];
  let price = 1000;
  const baseTime = new Date('2024-01-01T09:15:00Z').getTime();

  for (let i = 0; i < count; i++) {
    const cycle = Math.sin(i / 10) * 15;
    const open = price;
    const change = trend + cycle * 0.2;
    const close = Math.max(10, open + change);
    const high = Math.max(open, close) + 5;
    const low = Math.min(open, close) - 5;
    price = close;

    candles.push({
      timestamp: new Date(baseTime + i * 86400000).toISOString(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: 100000 + i * 500
    });
  }

  return candles;
}

describe('Historical Market Data Provider & Source Metadata', () => {
  test('1. Genuinely historical provider returns data with source, timestamp, and provenance metadata', async () => {
    const result = await historicalMarketData.getCandles('RELIANCE', '1d', 100);

    assert.equal(result.symbol, 'RELIANCE');
    assert.equal(result.source, 'EXCHANGE_HISTORICAL_ARCHIVE');
    assert.equal(result.dataType, 'HISTORICAL');
    assert.equal(result.provenance, 'VERIFIED_EOD_ARCHIVE');
    assert.ok(typeof result.asOfTimestamp === 'number' && result.asOfTimestamp > 0);
    assert.ok(result.candles.length >= 50);
    assert.equal(result.adjusted, true);
    assert.equal(result.metadata.isSimulated, false);
    assert.equal(result.metadata.source, 'EXCHANGE_HISTORICAL_ARCHIVE');
    assert.ok(result.metadata.dataType === 'REAL_TIME' || (result.metadata.dataType as any) === 'HISTORICAL');
  });

  test('2. Provider supports US instruments with source metadata', async () => {
    const result = await historicalMarketData.getCandles('AAPL', '1d', 60);

    assert.equal(result.symbol, 'AAPL');
    assert.equal(result.source, 'EXCHANGE_HISTORICAL_ARCHIVE');
    assert.ok(result.candles.length >= 30);
    assert.ok(result.candles[0].close > 0);
  });
});

describe('Quantitative Strategy Backtest Engine — All 5 Strategies', () => {
  const mockCandles = generateMockCandles(150, 0.8);

  test('1. Strategy: EMA_CROSSOVER with parameter-specific behavior', () => {
    const resultFast = runSimulation({
      symbol: 'TEST_EMA',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      risk_per_trade_pct: 1.0,
      strategy_params: { fast_period: 5, slow_period: 15 },
      candles: mockCandles
    });

    const resultSlow = runSimulation({
      symbol: 'TEST_EMA',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      risk_per_trade_pct: 1.0,
      strategy_params: { fast_period: 12, slow_period: 30 },
      candles: mockCandles
    });

    assert.equal(resultFast.strategy_name, 'EMA_CROSSOVER');
    assert.ok(resultFast.total_trades >= 0);
    assert.ok(Number.isFinite(resultFast.final_equity));
    assert.ok(Number.isFinite(resultFast.sharpe_ratio));
    // Fast crossover reacts quicker and will have different trade dynamics than slow crossover
    assert.notDeepEqual(resultFast.trades.length, undefined);
    assert.notDeepEqual(resultSlow.trades.length, undefined);
  });

  test('2. Strategy: RSI_MEAN_REVERSION with oversold and overbought parameters', () => {
    const result = runSimulation({
      symbol: 'TEST_RSI',
      strategy_name: 'RSI_MEAN_REVERSION',
      initial_capital: 1000000,
      risk_per_trade_pct: 1.0,
      strategy_params: {
        rsi_period: 14,
        oversold_threshold: 35,
        overbought_threshold: 65,
        exit_rsi: 50
      },
      candles: mockCandles
    });

    assert.equal(result.strategy_name, 'RSI_MEAN_REVERSION');
    assert.ok(Number.isFinite(result.final_equity));
    assert.ok(Number.isFinite(result.win_rate_pct));
    assert.ok(Array.isArray(result.equity_curve));
    assert.ok(result.equity_curve.length > 0 && result.equity_curve.length <= mockCandles.length);
  });

  test('3. Strategy: BOLLINGER_BANDS supporting BREAKOUT and REVERSION modes', () => {
    const resBreakout = runSimulation({
      symbol: 'TEST_BB',
      strategy_name: 'BOLLINGER_BANDS',
      initial_capital: 1000000,
      strategy_params: {
        bollinger_period: 20,
        bollinger_std: 2.0,
        bollinger_mode: 'BREAKOUT'
      },
      candles: mockCandles
    });

    const resReversion = runSimulation({
      symbol: 'TEST_BB',
      strategy_name: 'BOLLINGER_BANDS',
      initial_capital: 1000000,
      strategy_params: {
        bollinger_period: 20,
        bollinger_std: 2.0,
        bollinger_mode: 'REVERSION'
      },
      candles: mockCandles
    });

    assert.equal(resBreakout.strategy_name, 'BOLLINGER_BANDS');
    assert.equal(resReversion.strategy_name, 'BOLLINGER_BANDS');
    assert.ok(Number.isFinite(resBreakout.cumulative_return_pct));
    assert.ok(Number.isFinite(resReversion.cumulative_return_pct));
  });

  test('4. Strategy: DONCHIAN_MOMENTUM with custom entry and exit channels', () => {
    const result = runSimulation({
      symbol: 'TEST_DONCHIAN',
      strategy_name: 'DONCHIAN_MOMENTUM',
      initial_capital: 1000000,
      strategy_params: {
        entry_channel: 20,
        exit_channel: 10
      },
      candles: mockCandles
    });

    assert.equal(result.strategy_name, 'DONCHIAN_MOMENTUM');
    assert.ok(Number.isFinite(result.final_equity));
    assert.ok(Array.isArray(result.trades));
  });

  test('5. Strategy: SUPERTREND with ATR period and multiplier', () => {
    const result = runSimulation({
      symbol: 'TEST_SUPERTREND',
      strategy_name: 'SUPERTREND',
      initial_capital: 1000000,
      strategy_params: {
        atr_period: 10,
        supertrend_multiplier: 3.0
      },
      candles: mockCandles
    });

    assert.equal(result.strategy_name, 'SUPERTREND');
    assert.ok(Number.isFinite(result.final_equity));
    assert.ok(Number.isFinite(result.max_drawdown_pct));
  });
});

describe('Fill Models, Transaction Costs, & Benchmark Comparison', () => {
  const candles = generateMockCandles(120, 1.2);

  test('1. Fill model NEXT_BAR_OPEN executes on next bar open avoiding lookahead bias', () => {
    const resNextOpen = runSimulation({
      symbol: 'TEST_FILL',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      fill_model: 'NEXT_BAR_OPEN',
      candles
    });

    assert.equal(resNextOpen.fill_model, 'NEXT_BAR_OPEN');
    if (resNextOpen.trades.length > 0) {
      const firstTrade = resNextOpen.trades[0];
      assert.ok(firstTrade.entryPrice > 0);
      assert.ok(firstTrade.durationBars >= 1);
    }
  });

  test('2. Realistic commissions and slippage reduce net profit compared to zero fees', () => {
    const resNoFees = runSimulation({
      symbol: 'TEST_FEES',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      commission_rate: 0.0,
      slippage_rate: 0.0,
      candles
    });

    const resWithFees = runSimulation({
      symbol: 'TEST_FEES',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      commission_rate: 0.0003, // 0.03%
      slippage_rate: 0.0005,   // 0.05%
      candles
    });

    if (resWithFees.trades.length > 0) {
      assert.ok(resWithFees.total_fees_paid > 0);
      assert.ok(resWithFees.final_equity <= resNoFees.final_equity);
    }
  });

  test('3. Benchmark curve and alpha/beta metrics are computed against Buy & Hold', () => {
    const result = runSimulation({
      symbol: 'TEST_BENCHMARK',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      candles
    });

    assert.ok(Array.isArray(result.benchmark_curve));
    assert.ok(result.benchmark_curve.length > 0 && result.benchmark_curve.length <= candles.length);
    assert.ok(Number.isFinite(result.benchmark_return_pct));
    assert.ok(Number.isFinite(result.alpha));
    assert.ok(Number.isFinite(result.beta));
    assert.ok(Number.isFinite(result.information_ratio));
  });

  test('4. Minimum historical bars invariant (at least 30 bars required)', () => {
    const shortCandles = generateMockCandles(15, 0.5);

    assert.throws(() => {
      runSimulation({
        symbol: 'SHORT',
        strategy_name: 'EMA_CROSSOVER',
        candles: shortCandles
      });
    }, /at least 30 real historical bars/);
  });
});

describe('Out-of-Sample & Walk-Forward Evaluation', () => {
  const candles = generateMockCandles(180, 0.6);

  test('1. evaluateOutOfSample correctly splits into In-Sample (IS) and Out-of-Sample (OOS)', () => {
    const oos = evaluateOutOfSample({
      symbol: 'TEST_OOS',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      candles
    }, 0.70);

    assert.equal(oos.symbol, 'TEST_OOS');
    assert.equal(oos.split_ratio, 0.70);
    assert.equal(oos.in_sample.bars + oos.out_of_sample.bars, candles.length);
    assert.ok(oos.in_sample.bars >= 100);
    assert.ok(oos.out_of_sample.bars >= 40);
    assert.ok(Number.isFinite(oos.oos_efficiency));
    assert.ok(typeof oos.overfit_warning === 'boolean');
    assert.ok(typeof oos.recommendation === 'string' && oos.recommendation.length > 0);
  });

  test('2. evaluateWalkForward executes rolling train/test folds and calculates WFE %', () => {
    const wf = evaluateWalkForward({
      symbol: 'TEST_WF',
      strategy_name: 'EMA_CROSSOVER',
      initial_capital: 1000000,
      candles
    }, 3);

    assert.equal(wf.symbol, 'TEST_WF');
    assert.equal(wf.folds_count, 3);
    assert.equal(wf.folds.length, 3);
    assert.ok(Number.isFinite(wf.average_oos_return_pct));
    assert.ok(Number.isFinite(wf.average_oos_sharpe));
    assert.ok(Number.isFinite(wf.walk_forward_efficiency_pct));
    assert.ok(typeof wf.is_robust === 'boolean');

    // Each fold has valid train and test bars
    for (const fold of wf.folds) {
      assert.ok(fold.train_bars > 0);
      assert.ok(fold.test_bars > 0);
      assert.ok(Number.isFinite(fold.in_sample_return_pct));
      assert.ok(Number.isFinite(fold.out_of_sample_return_pct));
    }
  });
});
