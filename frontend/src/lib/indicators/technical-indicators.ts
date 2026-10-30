/**
 * TradeSphere AI — Mathematical Technical Indicators Engine
 * Implements 8 standard financial indicators with zero rounding drift:
 * 1. SMA (Simple Moving Average)
 * 2. EMA (Exponential Moving Average)
 * 3. RSI (Wilder's Relative Strength Index)
 * 4. MACD (Moving Average Convergence Divergence 12, 26, 9)
 * 5. Bollinger Bands (20, 2 std dev)
 * 6. ATR (Average True Range - Wilder's 14)
 * 7. VWAP (Volume-Weighted Average Price)
 * 8. Supertrend (10 ATR, 3.0 Multiplier)
 */

import {
  OHLCV,
  IndicatorPoint,
  MacdPoint,
  BollingerBandsPoint,
  SupertrendPoint,
  TechnicalIndicatorsSeries
} from '../market-data/types';

/**
 * 1. Simple Moving Average (SMA)
 */
export function calculateSMA(data: { time: number; close: number }[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (!data || data.length === 0 || period <= 0) return result;

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period) {
      sum -= data[i - period].close;
    }
    if (i >= period - 1) {
      const avg = sum / period;
      result.push({
        time: data[i].time,
        value: Math.round(avg * 10000) / 10000
      });
    }
  }
  return result;
}

/**
 * 2. Exponential Moving Average (EMA)
 */
export function calculateEMA(data: { time: number; close: number }[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (!data || data.length < period || period <= 0) return result;

  const multiplier = 2 / (period + 1);

  // Initial SMA as the first EMA seed
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += data[i].close;
  }
  let prevEMA = initialSum / period;
  result.push({
    time: data[period - 1].time,
    value: Math.round(prevEMA * 10000) / 10000
  });

  for (let i = period; i < data.length; i++) {
    const currentEMA = (data[i].close - prevEMA) * multiplier + prevEMA;
    prevEMA = currentEMA;
    result.push({
      time: data[i].time,
      value: Math.round(currentEMA * 10000) / 10000
    });
  }
  return result;
}

/**
 * 3. Relative Strength Index (RSI - 14)
 * Uses J. Welles Wilder's modified exponential smoothing.
 */
export function calculateRSI(data: { time: number; close: number }[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (!data || data.length <= period) return result;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  // Initial simple averages of gains and losses over the first 'period' intervals
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  const firstRsi = avgLoss === 0 ? 100 : avgGain === 0 ? 0 : 100 - 100 / (1 + avgGain / avgLoss);
  result.push({
    time: data[period].time,
    value: Math.round(firstRsi * 100) / 100
  });

  // Wilder's smoothing for subsequent periods
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    let rsi: number;
    if (avgLoss === 0) {
      rsi = 100;
    } else if (avgGain === 0) {
      rsi = 0;
    } else {
      const rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
    }

    result.push({
      time: data[i + 1].time,
      value: Math.round(rsi * 100) / 100
    });
  }
  return result;
}

/**
 * 4. Moving Average Convergence Divergence (MACD)
 * Standard: Fast 12, Slow 26, Signal 9
 */
export function calculateMACD(
  data: { time: number; close: number }[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MacdPoint[] {
  const result: MacdPoint[] = [];
  if (!data || data.length < slowPeriod + signalPeriod) return result;

  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Align Fast and Slow EMA by timestamp
  const fastMap = new Map<number, number>();
  fastEMA.forEach(p => {
    if (p.value !== undefined) fastMap.set(p.time, p.value);
  });

  const macdLinePoints: { time: number; close: number }[] = [];
  slowEMA.forEach(p => {
    const fastVal = fastMap.get(p.time);
    if (fastVal !== undefined && p.value !== undefined) {
      const macdVal = fastVal - p.value;
      macdLinePoints.push({ time: p.time, close: macdVal });
    }
  });

  if (macdLinePoints.length < signalPeriod) return result;

  // Signal line is 9-EMA of the MACD line
  const signalEMA = calculateEMA(macdLinePoints, signalPeriod);
  const signalMap = new Map<number, number>();
  signalEMA.forEach(p => {
    if (p.value !== undefined) signalMap.set(p.time, p.value);
  });

  macdLinePoints.forEach(p => {
    const signalVal = signalMap.get(p.time);
    if (signalVal !== undefined) {
      const macdVal = p.close;
      const hist = macdVal - signalVal;
      result.push({
        time: p.time,
        macd: Math.round(macdVal * 10000) / 10000,
        signal: Math.round(signalVal * 10000) / 10000,
        histogram: Math.round(hist * 10000) / 10000
      });
    }
  });

  return result;
}

/**
 * 5. Bollinger Bands (20, 2 std dev)
 */
export function calculateBollingerBands(
  data: { time: number; close: number }[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsPoint[] {
  const result: BollingerBandsPoint[] = [];
  if (!data || data.length < period) return result;

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
    const variance = slice.reduce((acc, curr) => acc + Math.pow(curr.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = mean + stdDevMultiplier * stdDev;
    const lower = mean - stdDevMultiplier * stdDev;
    const percentB = upper !== lower ? (data[i].close - lower) / (upper - lower) : 0.5;

    result.push({
      time: data[i].time,
      middle: Math.round(mean * 100) / 100,
      upper: Math.round(upper * 100) / 100,
      lower: Math.round(lower * 100) / 100,
      percentB: Math.round(percentB * 1000) / 1000
    });
  }
  return result;
}

/**
 * 6. Average True Range (ATR - 14)
 * Uses Wilder's smoothed True Range.
 */
export function calculateATR(data: OHLCV[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (!data || data.length <= period) return result;

  const trueRanges: number[] = [];
  // First TR is simply high - low
  trueRanges.push(data[0].high - data[0].low);

  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  // Initial ATR is simple average of first 'period' TRs
  let atr = 0;
  for (let i = 0; i < period; i++) {
    atr += trueRanges[i];
  }
  atr /= period;

  result.push({
    time: data[period - 1].time,
    value: Math.round(atr * 1000) / 1000
  });

  // Wilder's smoothing for remaining bars
  for (let i = period; i < data.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push({
      time: data[i].time,
      value: Math.round(atr * 1000) / 1000
    });
  }
  return result;
}

/**
 * 7. Volume Weighted Average Price (VWAP)
 * VWAP = Cumulative(TypicalPrice * Volume) / Cumulative(Volume)
 * TypicalPrice = (High + Low + Close) / 3
 */
export function calculateVWAP(data: OHLCV[]): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (!data || data.length === 0) return result;

  let cumTypicalVolume = 0;
  let cumVolume = 0;

  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
    const volume = data[i].volume || 1;

    cumTypicalVolume += typicalPrice * volume;
    cumVolume += volume;

    const vwap = cumVolume > 0 ? cumTypicalVolume / cumVolume : typicalPrice;

    result.push({
      time: data[i].time,
      value: Math.round(vwap * 100) / 100
    });
  }
  return result;
}

/**
 * 8. Supertrend (Period 10, Multiplier 3.0)
 * Classic institutional trend-following volatility band.
 */
export function calculateSupertrend(
  data: OHLCV[],
  period: number = 10,
  multiplier: number = 3.0
): SupertrendPoint[] {
  const result: SupertrendPoint[] = [];
  if (!data || data.length < period) return result;

  const atrSeries = calculateATR(data, period);
  const atrMap = new Map<number, number>();
  atrSeries.forEach(p => {
    if (p.value !== undefined) atrMap.set(p.time, p.value);
  });

  let prevUpper = 0;
  let prevLower = 0;
  let prevSupertrend = 0;
  let direction: 1 | -1 = 1; // 1 = Bullish, -1 = Bearish

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    const atr = atrMap.get(candle.time);

    if (atr === undefined) {
      continue; // Wait until ATR is primed
    }

    const hl2 = (candle.high + candle.low) / 2;
    const basicUpper = hl2 + multiplier * atr;
    const basicLower = hl2 - multiplier * atr;

    let finalUpper = basicUpper;
    let finalLower = basicLower;

    if (prevUpper !== 0 && prevLower !== 0) {
      const prevClose = data[i - 1].close;
      // Ratchet Upper Band down only, unless previous close broke above it
      finalUpper = basicUpper < prevUpper || prevClose > prevUpper ? basicUpper : prevUpper;
      // Ratchet Lower Band up only, unless previous close broke below it
      finalLower = basicLower > prevLower || prevClose < prevLower ? basicLower : prevLower;
    }

    // Direction flip logic
    if (prevSupertrend === 0) {
      direction = candle.close >= basicLower ? 1 : -1;
    } else if (prevSupertrend === prevUpper) {
      // Currently in downtrend
      direction = candle.close > finalUpper ? 1 : -1;
    } else {
      // Currently in uptrend
      direction = candle.close < finalLower ? -1 : 1;
    }

    const supertrend = direction === 1 ? finalLower : finalUpper;

    result.push({
      time: candle.time,
      supertrend: Math.round(supertrend * 100) / 100,
      direction,
      upperBand: Math.round(finalUpper * 100) / 100,
      lowerBand: Math.round(finalLower * 100) / 100
    });

    prevUpper = finalUpper;
    prevLower = finalLower;
    prevSupertrend = supertrend;
  }

  return result;
}

/**
 * Computes all 8 indicator series for a given OHLCV dataset.
 */
export function computeAllIndicators(candles: OHLCV[]): TechnicalIndicatorsSeries {
  return {
    sma20: calculateSMA(candles, 20),
    sma50: calculateSMA(candles, 50),
    sma200: calculateSMA(candles, 200),
    ema9: calculateEMA(candles, 9),
    ema20: calculateEMA(candles, 20),
    ema50: calculateEMA(candles, 50),
    rsi14: calculateRSI(candles, 14),
    macd: calculateMACD(candles, 12, 26, 9),
    bollingerBands: calculateBollingerBands(candles, 20, 2),
    atr14: calculateATR(candles, 14),
    vwap: calculateVWAP(candles),
    supertrend: calculateSupertrend(candles, 10, 3.0)
  };
}
