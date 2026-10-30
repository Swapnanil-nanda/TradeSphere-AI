import test from 'node:test';
import assert from 'node:assert/strict';
import { MarketSimulator, INSTRUMENTS } from '../src/market_data/simulator.js';
import { blackScholes, generateOptionsChain } from '../src/quant/options_greeks.js';
import { RiskAndOMSEngine } from '../src/oms/risk_engine.js';

test('1. MarketSimulator produces valid tickers across Indian and US instruments', () => {
  const sim = new MarketSimulator();
  const tickers = sim.getAllTickers();

  assert.equal(tickers.length, 10, 'Expected 10 total instruments');
  assert.ok(tickers.some(t => t.symbol === 'RELIANCE' && t.currency === 'INR'));
  assert.ok(tickers.some(t => t.symbol === 'AAPL' && t.currency === 'USD'));

  for (const t of tickers) {
    assert.ok(t.ltp > 0, `LTP for ${t.symbol} must be positive`);
    assert.ok(t.bid <= t.ask, `Bid should be <= Ask for ${t.symbol}`);
    assert.ok(t.bids.length >= 5, `Expected DOM depth for ${t.symbol}`);
  }
});

test('2. 20-Level Depth of Market (DOM) maintains realistic microstructure', () => {
  const sim = new MarketSimulator();
  const ticker = sim.getTicker('RELIANCE');
  assert.ok(ticker, 'RELIANCE ticker exists');
  assert.ok(ticker.bids.length > 0);
  assert.ok(ticker.asks.length > 0);

  // Highest bid should be strictly less than or equal to lowest ask
  const bestBid = ticker.bids[0][0];
  const bestAsk = ticker.asks[0][0];
  assert.ok(bestBid <= bestAsk, `Best bid ${bestBid} must be <= best ask ${bestAsk}`);
});

test('3. Black-Scholes Greeks analytics compute Delta, Gamma, Theta, Vega', () => {
  const greeks = blackScholes({
    spot: 24000,
    strike: 24000,
    timeYears: 7 / 365,
    rate: 0.065,
    vol: 0.16,
    type: 'call'
  });

  assert.ok(greeks.price > 0, 'Call price must be positive');
  assert.ok(greeks.delta >= 0.45 && greeks.delta <= 0.60, `ATM Call delta should be ~0.50 (got ${greeks.delta})`);
  assert.ok(greeks.gamma > 0, 'Gamma must be positive');
  assert.ok(greeks.vega > 0, 'Vega must be positive');
  assert.ok(greeks.theta < 0, 'Theta must be negative (time decay)');

  const chain = generateOptionsChain('NIFTY50', 24350, 7);
  assert.equal(chain.chain.length, 11, 'Expected 11 strike intervals');
});

test('4. Safe Position Sizer never violates 1% risk limit with minimum-one-unit fallback', () => {
  const sim = new MarketSimulator();
  const oms = new RiskAndOMSEngine(sim);

  // Configure account with 10,000 equity (1% max risk = 100)
  oms.account.initialEquity = 10000;
  oms.account.currentCash = 10000;
  oms.account.dayStartEquity = 10000;

  // Entry: 4,100, SL: 3,900 -> Risk per share: 200. Max risk = 100.
  // 1 share risk (200) > max risk (100) -> Safe sizer must return 0, NOT 1!
  const safeQty = oms.calculatePositionSize('TCS', 4100, 3900, 1.0);
  assert.equal(safeQty, 0, 'Auto-sizer must return 0 when single-share risk exceeds account risk cap');
});
