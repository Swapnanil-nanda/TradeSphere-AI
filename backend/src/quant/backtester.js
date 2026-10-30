// Vectorized Quantitative Strategy Backtesting Engine

export function runBacktest({ candles, strategy = 'ema_cross', initialCapital = 1000000, params = {} }) {
  if (!candles || candles.length < 30) {
    throw new Error('Insufficient historical candle data for backtesting (minimum 30 candles required).');
  }

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);
  const n = candles.length;

  let signals = new Array(n).fill(0); // 1 = Buy, -1 = Sell/Exit

  if (strategy === 'ema_cross') {
    const fastPeriod = params.fastEma || 9;
    const slowPeriod = params.slowEma || 21;
    const fastEma = calculateEMA(closes, fastPeriod);
    const slowEma = calculateEMA(closes, slowPeriod);

    for (let i = 1; i < n; i++) {
      if (fastEma[i - 1] <= slowEma[i - 1] && fastEma[i] > slowEma[i]) {
        signals[i] = 1; // Golden cross Buy
      } else if (fastEma[i - 1] >= slowEma[i - 1] && fastEma[i] < slowEma[i]) {
        signals[i] = -1; // Death cross Sell
      }
    }
  } else if (strategy === 'rsi_mean_reversion') {
    const rsi = calculateRSI(closes, 14);
    for (let i = 1; i < n; i++) {
      if (rsi[i - 1] < 30 && rsi[i] >= 30) {
        signals[i] = 1; // Oversold bounce Buy
      } else if (rsi[i - 1] > 70 && rsi[i] <= 70) {
        signals[i] = -1; // Overbought exhaust Exit
      }
    }
  } else if (strategy === 'vwap_breakout') {
    // VWAP breakout with volume expansion
    let cumVP = 0;
    let cumV = 0;
    for (let i = 0; i < n; i++) {
      const tp = (highs[i] + lows[i] + closes[i]) / 3;
      cumVP += tp * volumes[i];
      cumV += volumes[i];
      const vwap = cumVP / cumV;

      if (i > 0 && closes[i - 1] <= vwap && closes[i] > vwap && volumes[i] > volumes[i - 1] * 1.1) {
        signals[i] = 1;
      } else if (i > 0 && closes[i - 1] >= vwap && closes[i] < vwap) {
        signals[i] = -1;
      }
    }
  }

  // Vectorized Execution & Portfolio Simulation
  let capital = initialCapital;
  let position = 0;
  let entryPrice = 0;
  let trades = [];
  let equityCurve = [initialCapital];
  let peakCapital = initialCapital;
  let maxDrawdown = 0;

  for (let i = 1; i < n; i++) {
    const price = closes[i];
    const sig = signals[i];

    if (sig === 1 && position === 0) {
      // Enter Long (allocate 95% of available capital)
      position = Math.floor((capital * 0.95) / price);
      entryPrice = price;
      capital -= position * price;
    } else if (sig === -1 && position > 0) {
      // Exit Long
      const proceeds = position * price;
      const tradePnl = (price - entryPrice) * position;
      const pnlPct = ((price - entryPrice) / entryPrice) * 100;
      trades.push({
        entryPrice,
        exitPrice: price,
        pnl: tradePnl,
        pnlPct,
        win: tradePnl > 0
      });
      capital += proceeds;
      position = 0;
    }

    const currentEquity = capital + (position * price);
    equityCurve.push(Math.round(currentEquity));

    if (currentEquity > peakCapital) peakCapital = currentEquity;
    const dd = ((peakCapital - currentEquity) / peakCapital) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Close open position at end
  if (position > 0) {
    const finalPrice = closes[n - 1];
    const tradePnl = (finalPrice - entryPrice) * position;
    trades.push({
      entryPrice,
      exitPrice: finalPrice,
      pnl: tradePnl,
      pnlPct: ((finalPrice - entryPrice) / entryPrice) * 100,
      win: tradePnl > 0
    });
    capital += position * finalPrice;
    position = 0;
  }

  const finalEquity = capital;
  const netReturnPct = Math.round(((finalEquity - initialCapital) / initialCapital) * 10000) / 100;
  const winCount = trades.filter(t => t.win).length;
  const winRatePct = trades.length > 0 ? Math.round((winCount / trades.length) * 1000) / 10 : 0;

  // Compute Daily/Bar Returns for Sharpe & Sortino
  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i] - equityCurve[i - 1]) / equityCurve[i - 1]);
  }

  const meanReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length || 1);
  const stdDev = Math.sqrt(variance);

  // Downside deviation for Sortino
  const negativeReturns = returns.filter(r => r < 0);
  const downsideVariance = negativeReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / (negativeReturns.length || 1);
  const downsideDev = Math.sqrt(downsideVariance);

  // Annualized factor (~252 trading days)
  const annualFactor = Math.sqrt(252);
  const sharpeRatio = stdDev > 0 ? Math.round(((meanReturn / stdDev) * annualFactor) * 100) / 100 : 0;
  const sortinoRatio = downsideDev > 0 ? Math.round(((meanReturn / downsideDev) * annualFactor) * 100) / 100 : 0;

  return {
    strategy,
    initialCapital,
    finalEquity: Math.round(finalEquity),
    netReturnPct,
    winRatePct,
    totalTrades: trades.length,
    sharpeRatio,
    sortinoRatio,
    maxDrawdownPct: Math.round(maxDrawdown * 100) / 100,
    equityCurve,
    recentTrades: trades.slice(-10)
  };
}

function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push((data[i] * k) + (ema[i - 1] * (1 - k)));
  }
  return ema;
}

function calculateRSI(data, period = 14) {
  const rsi = new Array(data.length).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
    }
  }
  return rsi;
}
