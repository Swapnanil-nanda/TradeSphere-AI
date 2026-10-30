// Contextual AI Risk Coach & Behavioral Journal Auditor

export function getCoachGuidance({ symbol, ticker, candles, trades }) {
  if (!candles || candles.length === 0) {
    return {
      summary: 'Market data initializing. Observe market structure before deploying capital.',
      bias: 'NEUTRAL',
      keyLevels: { support: 0, resistance: 0 },
      riskTip: 'Always size positions using the 1% risk rule.'
    };
  }

  const lastCandle = candles[candles.length - 1];
  const ltp = ticker ? ticker.ltp : lastCandle.close;
  const ema20 = lastCandle.ema20 || ltp;
  const vwap = lastCandle.vwap || ltp;
  const rsi = lastCandle.rsi || 50;
  const atr = lastCandle.atr || (ltp * 0.01);
  const support = lastCandle.support || Math.round(ltp * 0.99);
  const resistance = lastCandle.resistance || Math.round(ltp * 1.01);

  // Market structure analysis
  let bias = 'NEUTRAL';
  let trendStrength = 'Range-bound';
  let guidance = '';

  if (ltp > ema20 && ltp > vwap) {
    bias = 'BULLISH';
    trendStrength = 'Above 20-EMA & VWAP';
    if (rsi > 70) {
      guidance = `${symbol} is in a strong uptrend above 20-EMA (₹${ema20}), but RSI (${rsi}) indicates short-term exhaustion. Look for pullbacks near VWAP (₹${vwap}) rather than chasing highs.`;
    } else {
      guidance = `${symbol} shows healthy bullish momentum trading above 20-EMA (₹${ema20}) with RSI at ${rsi}. Key resistance overhead is ₹${resistance}.`;
    }
  } else if (ltp < ema20 && ltp < vwap) {
    bias = 'BEARISH';
    trendStrength = 'Below 20-EMA & VWAP';
    if (rsi < 30) {
      guidance = `${symbol} is trending lower below 20-EMA (₹${ema20}) with oversold RSI (${rsi}). Selling pressure may abate near major support at ₹${support}.`;
    } else {
      guidance = `${symbol} is under distribution below VWAP (₹${vwap}). Recommended stop placement for short setups is above ₹${Math.round((ltp + atr * 1.5) * 10) / 10}.`;
    }
  } else {
    bias = 'CONSOLIDATION';
    trendStrength = 'Choppy / Mean-Reverting';
    guidance = `${symbol} is oscillating around VWAP (₹${vwap}) between Support ₹${support} and Resistance ₹${resistance}. Avoid breakout strategies in this regime; focus on range boundaries.`;
  }

  // Journal Behavioral Audit (Recent Trades)
  const audit = analyzeTradeJournal(trades || []);

  return {
    symbol,
    bias,
    trendStrength,
    ltp,
    ema20,
    vwap,
    rsi,
    suggestedStopDistance: Math.round(atr * 1.5 * 10) / 10,
    keyLevels: { support, resistance },
    plainEnglishSummary: guidance,
    audit
  };
}

function analyzeTradeJournal(trades) {
  if (trades.length === 0) {
    return {
      totalClosedTrades: 0,
      winRate: '0%',
      avgRMultiple: 'N/A',
      behavioralVerdict: 'No closed trades recorded yet. Execute disciplined paper trades adhering to 1% risk rules.'
    };
  }

  const exitTrades = trades.filter(t => t.action === 'EXIT');
  if (exitTrades.length === 0) {
    return {
      totalClosedTrades: 0,
      winRate: '0%',
      avgRMultiple: 'N/A',
      behavioralVerdict: 'Open positions active. Monitor bracket OCO stops.'
    };
  }

  const wins = exitTrades.filter(t => t.realizedPnL > 0);
  const winRate = Math.round((wins.length / exitTrades.length) * 100);
  
  const rMultiples = exitTrades.map(t => t.rMultiple).filter(r => r !== null && !isNaN(r));
  const avgR = rMultiples.length > 0
    ? (rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length).toFixed(2)
    : '1.00';

  // Check for revenge trading (multiple exits within short timeframe)
  let revengeRisk = false;
  if (exitTrades.length >= 3) {
    const last3 = exitTrades.slice(-3);
    const timeSpanSec = (last3[last3.length - 1].timestamp - last3[0].timestamp) / 1000;
    if (timeSpanSec < 180 && last3.every(t => t.realizedPnL < 0)) {
      revengeRisk = true;
    }
  }

  let verdict = `Win rate is ${winRate}% across ${exitTrades.length} trades with average expectancy of ${avgR}R.`;
  if (revengeRisk) {
    verdict += ' CAUTION: Rapid consecutive loss pattern detected (tilt/revenge risk). Step away from the terminal for 15 minutes.';
  } else if (parseFloat(avgR) >= 1.5) {
    verdict += ' Excellent positive expectancy! Trade management aligns with institutional risk standards.';
  } else {
    verdict += ' Consider letting winners reach full 1.5R target rather than early exit.';
  }

  return {
    totalClosedTrades: exitTrades.length,
    winRate: `${winRate}%`,
    avgRMultiple: `${avgR}R`,
    revengeRisk,
    behavioralVerdict: verdict
  };
}
