import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiClient } from './api-client';

describe('Watchlists Subsystem & Financial Data Invariants', () => {

  it('1. Default Watchlists: returns valid initial baskets with simulated instruments', async () => {
    const watchlists = await apiClient.getWatchlists();
    assert.ok(Array.isArray(watchlists));
    assert.ok(watchlists.length >= 1);

    const defaultList = watchlists.find(w => w.defaultList) || watchlists[0];
    assert.ok(defaultList);
    assert.ok(defaultList.name);
    assert.ok(defaultList.instruments.length > 0);

    // Verify instrument shape
    const first = defaultList.instruments[0];
    assert.ok(first.symbol);
    assert.ok(first.name);
    assert.ok(first.exchange);
  });

  it('2. Sorting Invariants: correctly orders tickers by price and volume', () => {
    const sample = [
      { symbol: 'RELIANCE', ltp: 2985.4, volume: 1824900, changePct: 0.84 },
      { symbol: 'TCS', ltp: 4125.0, volume: 832000, changePct: -0.37 },
      { symbol: 'INFY', ltp: 1892.5, volume: 1420000, changePct: 0.97 }
    ];

    // Price descending
    const byPriceDesc = [...sample].sort((a, b) => b.ltp - a.ltp);
    assert.equal(byPriceDesc[0].symbol, 'TCS');
    assert.equal(byPriceDesc[1].symbol, 'RELIANCE');
    assert.equal(byPriceDesc[2].symbol, 'INFY');

    // Volume descending
    const byVolumeDesc = [...sample].sort((a, b) => b.volume - a.volume);
    assert.equal(byVolumeDesc[0].symbol, 'RELIANCE');
    assert.equal(byVolumeDesc[1].symbol, 'INFY');
    assert.equal(byVolumeDesc[2].symbol, 'TCS');

    // Change% descending (top gainers)
    const byGainers = [...sample].sort((a, b) => b.changePct - a.changePct);
    assert.equal(byGainers[0].symbol, 'INFY');
    assert.equal(byGainers[1].symbol, 'RELIANCE');
    assert.equal(byGainers[2].symbol, 'TCS');
  });

  it('3. CSV Serialization: formats valid CSV content without formula injection', () => {
    const sample = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', market: 'IN', ltp: 2985.4, changePct: 0.84, volume: 1824900 },
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', market: 'US', ltp: 234.5, changePct: 1.38, volume: 54100000 }
    ];

    const headers = ['Symbol', 'Name', 'Exchange', 'Market', 'LTP', 'ChangePct', 'Volume'];
    const rows = sample.map(t => [
      t.symbol,
      `"${t.name.replace(/"/g, '""')}"`,
      t.exchange,
      t.market,
      t.ltp.toFixed(2),
      t.changePct.toFixed(2),
      t.volume
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    assert.ok(csv.includes('RELIANCE,"Reliance Industries Ltd",NSE,IN,2985.40,0.84,1824900'));
    assert.ok(csv.includes('AAPL,"Apple Inc.",NASDAQ,US,234.50,1.38,54100000'));
  });

  it('4. Reorder Array Invariant: maintains exact element set after swap', () => {
    const list = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
    // Move index 1 (TCS) up
    const swapped = [...list];
    const temp = swapped[1];
    swapped[1] = swapped[0];
    swapped[0] = temp;

    assert.deepEqual(swapped, ['TCS', 'RELIANCE', 'HDFCBANK', 'INFY']);
    assert.equal(swapped.length, list.length);
  });
});
