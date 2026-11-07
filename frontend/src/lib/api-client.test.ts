import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiClient } from './api-client';
import { appConfig } from './config';

describe('ApiClient & Position Sizing Invariants', () => {
  test('1. Sizing within risk budget computes correct quantity', async () => {
    // Equity = 1,000,000; 1% risk = 10,000.
    // Entry = 100, StopLoss = 90 -> Risk distance = 10.
    // Quantity = 10,000 / 10 = 1000 shares.
    const res = await apiClient.calculatePositionSize({
      symbol: 'TEST',
      entryPrice: 100,
      stopLossPrice: 90,
      riskPct: 1.0
    });

    assert.equal(res.recommendedQuantity, 1000);
    assert.equal(res.riskBreached, false);
  });

  test('2. Sizing on high-priced instrument allocates real-world units without artificial lockout', async () => {
    const res = await apiClient.calculatePositionSize({
      symbol: 'MRF',
      entryPrice: 50000,
      stopLossPrice: 35000,
      riskPct: 25.0
    });

    assert.ok(res.recommendedQuantity >= 1);
    assert.equal(res.riskBreached, false);
  });

  test('3. Invalid or zero Stop-Loss distance returns 0 shares safely', async () => {
    const res = await apiClient.calculatePositionSize({
      symbol: 'RELIANCE',
      entryPrice: 2985,
      stopLossPrice: 2985
    });

    assert.equal(res.recommendedQuantity, 0);
    assert.equal(res.riskBreached, false);
    assert.match(res.message || '', /Invalid Stop-Loss distance/);
  });

  test('4. Configuration resolves valid non-empty URLs', () => {
    assert.ok(appConfig.marketWsUrl.startsWith('ws://') || appConfig.marketWsUrl.startsWith('wss://'));
    assert.ok(typeof appConfig.apiUrl === 'string');
    assert.ok(typeof appConfig.marketApiUrl === 'string');
  });
});
