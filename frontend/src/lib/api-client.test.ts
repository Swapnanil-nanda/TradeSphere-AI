import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiClient } from './api-client';
import { appConfig } from './config';

describe('ApiClient & Position Sizing Invariants', () => {
  test('1. Sizing within 1% risk computes correct safe quantity', async () => {
    // Equity = 1,000,000; 1% risk = 10,000.
    // Entry = 100, StopLoss = 90 -> Risk distance = 10.
    // Quantity = 10,000 / 10 = 1000 shares.
    const res = await apiClient.calculatePositionSize({
      symbol: 'TEST',
      entryPrice: 100,
      stopLossPrice: 90
    });

    assert.equal(res.recommendedQuantity, 1000);
    assert.equal(res.riskBreached, false);
  });

  test('2. Sizing where single share risk exceeds 1% cap returns 0 shares and flags risk breach', async () => {
    // Equity = 1,000,000; 1% risk = 10,000.
    // Entry = 50,000, StopLoss = 35,000 -> Risk distance = 15,000 (> 10,000).
    // Invariant: Never round up to 1 unit. Must return 0.
    const res = await apiClient.calculatePositionSize({
      symbol: 'MRF',
      entryPrice: 50000,
      stopLossPrice: 35000
    });

    assert.equal(res.recommendedQuantity, 0);
    assert.equal(res.riskBreached, true);
    assert.match(res.message || '', /exceeds 1% risk cap/);
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
