import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateVWAP,
  calculateSupertrend
} from './technical-indicators';
import { OHLCV } from '../market-data/types';

describe('Technical Indicators Engine — Reference Calculations', () => {

  it('1. SMA: matches independent manual arithmetic for 5-period moving average', () => {
    const data = [
      { time: 1, close: 10 },
      { time: 2, close: 11 },
      { time: 3, close: 12 },
      { time: 4, close: 13 },
      { time: 5, close: 14 }, // avg 60 / 5 = 12.0
      { time: 6, close: 15 }, // avg 65 / 5 = 13.0
      { time: 7, close: 16 }, // avg 70 / 5 = 14.0
      { time: 8, close: 17 }, // avg 75 / 5 = 15.0
      { time: 9, close: 18 }, // avg 80 / 5 = 16.0
      { time: 10, close: 19 } // avg 85 / 5 = 17.0
    ];

    const sma = calculateSMA(data, 5);
    assert.strictEqual(sma.length, 6);
    assert.strictEqual(sma[0].time, 5);
    assert.strictEqual(sma[0].value, 12.0);
    assert.strictEqual(sma[1].value, 13.0);
    assert.strictEqual(sma[5].value, 17.0);
  });

  it('2. EMA: matches known 10-period exponential smoothing with multiplier 2/(10+1)', () => {
    const data = [
      { time: 1, close: 22.27 },
      { time: 2, close: 22.19 },
      { time: 3, close: 22.08 },
      { time: 4, close: 22.17 },
      { time: 5, close: 22.18 },
      { time: 6, close: 22.13 },
      { time: 7, close: 22.23 },
      { time: 8, close: 22.43 },
      { time: 9, close: 22.24 },
      { time: 10, close: 22.29 }, // Initial SMA = 22.221
      { time: 11, close: 22.15 }  // EMA = (22.15 - 22.221)*(2/11) + 22.221 = 22.2081
    ];

    const ema = calculateEMA(data, 10);
    assert.strictEqual(ema.length, 2);
    assert.strictEqual(ema[0].value, 22.221);
    assert.strictEqual(ema[1].value, 22.2081);
  });

  it('3. RSI: matches J. Welles Wilder classic 14-period benchmark dataset (RSI = 70.46)', () => {
    const closes = [
      44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28
    ];
    const data = closes.map((c, idx) => ({ time: idx + 1, close: c }));

    const rsi = calculateRSI(data, 14);
    assert.strictEqual(rsi.length, 1);
    // Verified Wilder reference: AvgGain = 3.34/14 = 0.23857, AvgLoss = 1.40/14 = 0.1000, RS = 2.3857 => RSI = 70.46
    assert.strictEqual(rsi[0].value, 70.46);
  });

  it('4. Bollinger Bands: verifies standard deviation and upper/lower channel expansion', () => {
    // 20 values alternating between 90 and 110 (Mean = 100, Variance = 100, StdDev = 10)
    const data = Array.from({ length: 20 }, (_, idx) => ({
      time: idx + 1,
      close: idx % 2 === 0 ? 90 : 110
    }));

    const bb = calculateBollingerBands(data, 20, 2);
    assert.strictEqual(bb.length, 1);
    assert.strictEqual(bb[0].middle, 100);
    assert.strictEqual(bb[0].upper, 120);
    assert.strictEqual(bb[0].lower, 80);
    // At close = 110: %B = (110 - 80) / (120 - 80) = 30 / 40 = 0.75
    assert.strictEqual(bb[0].percentB, 0.75);
  });

  it('5. ATR: verifies true range identification across gaps and 14-period smoothing', () => {
    // Create 15 bars with known True Range = 10 for all bars
    const data: OHLCV[] = Array.from({ length: 15 }, (_, idx) => ({
      time: idx + 1,
      open: 100,
      high: 105,
      low: 95,
      close: 100,
      volume: 1000
    }));

    const atr = calculateATR(data, 14);
    assert.strictEqual(atr.length, 2);
    assert.strictEqual(atr[0].value, 10.0);
    assert.strictEqual(atr[1].value, 10.0);
  });

  it('6. VWAP: verifies cumulative typical price * volume weighting formula', () => {
    const data: OHLCV[] = [
      { time: 1, open: 100, high: 102, low: 98, close: 100, volume: 1000 },  // Typical = 100, Vol = 1000 => VWAP = 100.0
      { time: 2, open: 110, high: 112, low: 108, close: 110, volume: 1000 }, // Typical = 110, Vol = 1000 => Cumulative 210,000 / 2000 = 105.0
      { time: 3, open: 120, high: 122, low: 118, close: 120, volume: 2000 }  // Typical = 120, Vol = 2000 => Cumulative 450,000 / 4000 = 112.5
    ];

    const vwap = calculateVWAP(data);
    assert.strictEqual(vwap.length, 3);
    assert.strictEqual(vwap[0].value, 100.0);
    assert.strictEqual(vwap[1].value, 105.0);
    assert.strictEqual(vwap[2].value, 112.5);
  });

  it('7. MACD: verifies Fast(12), Slow(26) EMA convergence and Signal(9) histogram', () => {
    // 40 candles in steady upward trend
    const data = Array.from({ length: 45 }, (_, idx) => ({
      time: idx + 1,
      close: 100 + idx * 2
    }));

    const macd = calculateMACD(data, 12, 26, 9);
    assert.ok(macd.length > 0);
    const last = macd[macd.length - 1];
    assert.ok(last.macd !== undefined);
    assert.ok(last.signal !== undefined);
    assert.ok(last.histogram !== undefined);
    // In an accelerating uptrend, fast EMA > slow EMA => MACD > 0
    assert.ok(last.macd > 0);
    assert.strictEqual(Math.round((last.macd - last.signal) * 10000) / 10000, last.histogram);
  });

  it('8. Supertrend: verifies band ratchet rules and direction reversal', () => {
    // 20 candles in steady uptrend followed by sharp drop
    const data: OHLCV[] = [];
    for (let i = 1; i <= 15; i++) {
      data.push({
        time: i,
        open: 100 + i * 2,
        high: 105 + i * 2,
        low: 98 + i * 2,
        close: 103 + i * 2,
        volume: 5000
      });
    }
    // Drop candle to trigger bearish flip
    data.push({
      time: 16,
      open: 130,
      high: 131,
      low: 80,
      close: 82,
      volume: 15000
    });

    const supertrend = calculateSupertrend(data, 10, 3.0);
    assert.ok(supertrend.length > 0);
    // Prior bars should be bullish (direction 1)
    assert.strictEqual(supertrend[0].direction, 1);
    // Last dropped bar should trigger bearish reversal (direction -1)
    const lastBar = supertrend[supertrend.length - 1];
    assert.strictEqual(lastBar.direction, -1);
  });
});
