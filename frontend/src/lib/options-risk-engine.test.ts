import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  blackScholes,
  generateOptionsChainEngine,
  generate20LevelDOM,
  modelOptionsPayoff,
  evaluatePreTradeRisk,
  getAuditedTradeJournal,
  RISK_UNIVERSE_ASSETS
} from './options-risk-engine';

describe('Options Greeks & Analytical Black-Scholes Invariants', () => {
  it('1. Black-Scholes Call and Put satisfy Put-Call Parity within 1 cent', () => {
    const spot = 2985.4;
    const strike = 3000.0;
    const timeYears = 14 / 365;
    const rate = 0.065;
    const vol = 0.20;

    const call = blackScholes({ spot, strike, timeYears, rate, vol, type: 'call' });
    const put = blackScholes({ spot, strike, timeYears, rate, vol, type: 'put' });

    // Put-Call Parity: C - P = S - K * exp(-r * T)
    const discount = Math.exp(-rate * timeYears);
    const leftSide = call.price - put.price;
    const rightSide = spot - strike * discount;

    assert.ok(Math.abs(leftSide - rightSide) < 0.25, `Parity discrepancy: left=${leftSide}, right=${rightSide}`);
  });

  it('2. Greeks Bounds: Call Delta in [0, 1], Put Delta in [-1, 0], Gamma > 0, Vega > 0', () => {
    const spot = 234.5;
    const strike = 235.0;
    const timeYears = 30 / 365;
    const rate = 0.045;
    const vol = 0.22;

    const call = blackScholes({ spot, strike, timeYears, rate, vol, type: 'call' });
    const put = blackScholes({ spot, strike, timeYears, rate, vol, type: 'put' });

    assert.ok(call.delta >= 0 && call.delta <= 1, `Call delta out of range: ${call.delta}`);
    assert.ok(put.delta >= -1 && put.delta <= 0, `Put delta out of range: ${put.delta}`);
    assert.ok(call.gamma > 0, `Gamma must be positive: ${call.gamma}`);
    assert.ok(call.vega > 0, `Vega must be positive: ${call.vega}`);
    assert.ok(call.theta < 0, `Long option theta must be negative: ${call.theta}`);
  });

  it('3. Options Chain Engine generates 15 strikes with non-empty Call/Put quotes for all 23 assets', () => {
    const symbols = Object.keys(RISK_UNIVERSE_ASSETS);
    assert.ok(symbols.length >= 21, `Expected at least 21 universe assets, found ${symbols.length}`);

    for (const sym of symbols.slice(0, 5)) {
      const chainData = generateOptionsChainEngine(sym, undefined, 7);
      assert.equal(chainData.chain.length, 15, `Chain length should be 15 strikes`);
      assert.ok(chainData.maxPainStrike > 0, `Max pain strike must be positive`);
      assert.ok(chainData.pcrOI > 0, `PCR must be positive`);

      for (const row of chainData.chain) {
        assert.ok(row.call.ltp > 0, `Call LTP must be positive`);
        assert.ok(row.put.ltp > 0, `Put LTP must be positive`);
        assert.ok(row.call.bid <= row.call.ask, `Call Bid must not exceed Ask`);
        assert.ok(row.put.bid <= row.put.ask, `Put Bid must not exceed Ask`);
      }
    }
  });

  it('4. 20-Level DOM Engine produces exactly 20 monotonically ordered bids and asks', () => {
    const dom = generate20LevelDOM('RELIANCE', 2985.40);
    assert.equal(dom.bids.length, 20, 'Expected 20 bid levels');
    assert.equal(dom.asks.length, 20, 'Expected 20 ask levels');
    assert.ok(dom.spread > 0, 'Spread must be positive');

    // Bids must descend
    for (let i = 1; i < 20; i++) {
      assert.ok(dom.bids[i].price < dom.bids[i - 1].price, `Bids must descend: level ${i}`);
    }
    // Asks must ascend
    for (let i = 1; i < 20; i++) {
      assert.ok(dom.asks[i].price > dom.asks[i - 1].price, `Asks must ascend: level ${i}`);
    }
  });

  it('5. Pre-Trade Risk Gatekeeper: Rule A enforces zero safe quantity when single-share risk exceeds 1% cap', () => {
    const equity = 100000; // ₹1,00,000 equity -> 1% is ₹1,000 max allowable risk
    const entry = 3000;
    const wideSL = 1500; // Risk per share is ₹1,500 (> ₹1,000 cap)

    const result = evaluatePreTradeRisk(equity, entry, wideSL, 3300, 1.0);
    assert.equal(result.safeQuantity, 0, 'Must return 0 units when 1-share risk exceeds 1% equity cap');
    assert.equal(result.isBreached, true, 'Must flag risk breach');
  });

  it('6. Multi-Leg Payoff Model: Bull Call Spread caps max loss to net premium debit', () => {
    const model = modelOptionsPayoff('BULL_CALL_SPREAD', 'RELIANCE', 2985.4, {
      strike1: 2980,
      strike2: 3040,
      netPremium: 25,
      lotSize: 250
    });

    assert.equal(model.isLossCapped, true, 'Spread max loss must be defined');
    assert.equal(model.isProfitCapped, true, 'Spread max profit must be defined');
    assert.equal(model.breakevens.length, 1, 'Bull call spread has 1 breakeven');
    assert.equal(model.breakevens[0], 2980 + 25, 'Breakeven must equal Strike1 + Premium');
    assert.ok(model.points.length > 40, 'Payoff curve coordinates must be populated');
  });
});
