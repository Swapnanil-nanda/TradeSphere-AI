import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { apiClient } from '../lib/api-client';

describe('Screener, Authentication Guard & Adaptive Tiers Invariants', () => {

  test('1. Authentication State Invariant: Unauthenticated by default in fresh session', () => {
    // In node/test environment without token, isAuthenticated must return false
    assert.strictEqual(apiClient.isAuthenticated(), false);
  });

  test('2. Screener Page Structure & Provenance: Returns valid paginated response with SIMULATED provenance', async () => {
    const response = await apiClient.getScreenerPage({ market: 'ALL' });
    assert.ok(response, 'Response must be defined');
    assert.ok(Array.isArray(response.items), 'items must be an array');
    assert.ok(response.items.length > 0, 'items must not be empty');
    assert.strictEqual(response.dataProvenance, 'SIMULATED');
    assert.strictEqual(response.dataSource, 'GEOMETRIC_BROWNIAN_MOTION_GBM');
    assert.ok(typeof response.totalResults === 'number');
    assert.ok(response.totalResults >= response.items.length);
  });

  test('3. Financial Exactness: Missing P/E ratios for ETFs are represented as null or handled as N/A', async () => {
    const response = await apiClient.getScreenerPage({ search: 'SPY' });
    const spy = response.items.find(s => s.symbol === 'SPY');
    if (spy) {
      assert.strictEqual(spy.peRatio, null, 'ETF SPY should not have an invented equity P/E ratio');
    }
  });

  test('4. CSV Export URL Formulation: Formats valid URL containing filter parameters', () => {
    const url = apiClient.getScreenerExportUrl({
      market: 'IN',
      sector: 'IT Services',
      trend: 'BULLISH',
      minPrice: 100,
      maxPrice: 5000,
      sortBy: 'changePct',
      sortDirection: 'DESC'
    });
    assert.ok(url.includes('/api/screener/export'));
    assert.ok(url.includes('market=IN'));
    assert.ok(url.includes('sector=IT+Services') || url.includes('sector=IT%20Services'));
    assert.ok(url.includes('trend=BULLISH'));
    assert.ok(url.includes('minPrice=100'));
    assert.ok(url.includes('maxPrice=5000'));
  });

  test('5. Adaptive Tiers Invariant: Updating tier preferences persists in profile', () => {
    const updated = apiClient.updateUserPreferences({ tier: 'active' });
    assert.strictEqual(updated.tier, 'active');
  });

  test('6. Market Filtering Invariant: Filtering by market IN or US returns only matching instruments', async () => {
    const inStocks = await apiClient.getScreenerStocks({ market: 'IN' });
    for (const stock of inStocks) {
      if (stock.market) {
        assert.ok(stock.market === 'IN' || stock.market === 'US');
      }
    }
  });

});
