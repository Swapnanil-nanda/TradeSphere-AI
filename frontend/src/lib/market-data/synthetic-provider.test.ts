import { describe, it } from 'node:test';
import assert from 'node:assert';
import { syntheticMarketData } from './synthetic-provider';

describe('SyntheticMarketDataProvider — Integrity & Metadata Verification', () => {

  it('1. Search: returns matched instruments across Indian and US equities', async () => {
    const resultsRel = await syntheticMarketData.searchInstruments('RELI');
    assert.ok(resultsRel.length >= 1);
    assert.strictEqual(resultsRel[0].symbol, 'RELIANCE');
    assert.strictEqual(resultsRel[0].exchange, 'NSE');

    const resultsAapl = await syntheticMarketData.searchInstruments('apple');
    assert.ok(resultsAapl.length >= 1);
    assert.strictEqual(resultsAapl[0].symbol, 'AAPL');
    assert.strictEqual(resultsAapl[0].exchange, 'NASDAQ');
  });

  it('2. Stock Details: attaches mandatory SIMULATED metadata labels', async () => {
    const details = await syntheticMarketData.getStockDetails('TCS');
    assert.strictEqual(details.symbol, 'TCS');
    assert.ok(details.ltp > 0);
    assert.ok(details.high52w >= details.low52w);

    // Verify Invariant: Explicit Simulated Labeling
    assert.strictEqual(details.metadata.isSimulated, true);
    assert.strictEqual(details.metadata.dataType, 'SIMULATED');
    assert.ok(details.metadata.source.includes('Synthetic GBM'));
    assert.ok(details.metadata.timestamp > 0);
    assert.ok(details.metadata.dataFreshness.length > 0);
  });

  it('3. Candles & Indicators: computes 8 indicator series for candles', async () => {
    const res = await syntheticMarketData.getCandles('RELIANCE', '5m', 80);
    assert.strictEqual(res.candles.length, 80);
    assert.strictEqual(res.metadata.isSimulated, true);

    // Verify Indicators existence
    assert.ok(res.indicators.sma20.length > 0);
    assert.ok(res.indicators.ema20.length > 0);
    assert.ok(res.indicators.rsi14.length > 0);
    assert.ok(res.indicators.macd.length > 0);
    assert.ok(res.indicators.bollingerBands.length > 0);
    assert.ok(res.indicators.atr14.length > 0);
    assert.ok(res.indicators.vwap.length > 0);
    assert.ok(res.indicators.supertrend.length > 0);

    // Verify OHLC candle integrity
    res.candles.forEach(c => {
      assert.ok(c.high >= c.low, `High ${c.high} must be >= Low ${c.low}`);
      assert.ok(c.high >= c.open, `High ${c.high} must be >= Open ${c.open}`);
      assert.ok(c.high >= c.close, `High ${c.high} must be >= Close ${c.close}`);
      assert.ok(c.low <= c.open, `Low ${c.low} must be <= Open ${c.open}`);
      assert.ok(c.low <= c.close, `Low ${c.low} must be <= Close ${c.close}`);
      assert.ok(c.volume >= 0, 'Volume must be non-negative');
    });
  });

  it('4. Market Overview: provides benchmark indices and market breadth', async () => {
    const overview = await syntheticMarketData.getMarketOverview();
    assert.ok(overview.indices.length >= 5);
    const nifty = overview.indices.find(i => i.symbol === 'NIFTY50');
    assert.ok(nifty !== undefined);
    assert.strictEqual(nifty?.market, 'IN');

    assert.ok(overview.topGainers.length > 0);
    assert.ok(overview.topLosers.length > 0);
    assert.ok(overview.marketBreadth.advances > 0);
    assert.strictEqual(overview.metadata.isSimulated, true);
  });

  it('5. Watchlists: provisions core watchlist with valid stock items', async () => {
    const watchlists = await syntheticMarketData.getWatchlists();
    assert.ok(watchlists.length >= 2);
    assert.strictEqual(watchlists[0].name, 'Core Market Watch');
    assert.ok(watchlists[0].items.length >= 4);
    assert.strictEqual(watchlists[0].metadata.isSimulated, true);
  });
});
