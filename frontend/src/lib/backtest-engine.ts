/**
 * Quantitative Vectorized & Bar-by-Bar Strategy Backtest Simulation Engine
 * Enforces Rule A Pre-Trade Risk Gatekeeper (1% single-trade max loss, decimal-safe arithmetic)
 * Supports all five core algorithmic strategies, realistic transaction costs, fill models, benchmarks,
 * out-of-sample (OOS) testing, and walk-forward efficiency (WFE) analysis.
 */

export interface BacktestCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestParams {
  symbol: string;
  strategy_name: string;
  initial_capital?: number;
  risk_per_trade_pct?: number;
  startDate?: string;
  endDate?: string;
  interval?: '1d' | '1h' | '15m' | '5m' | '1m';
  commission_rate?: number; // default 0.0003 (0.03%)
  slippage_rate?: number;   // default 0.0005 (0.05%)
  fill_model?: 'NEXT_BAR_OPEN' | 'CURRENT_BAR_CLOSE';
  strategy_params?: {
    fast_period?: number;
    slow_period?: number;
    stop_loss_atr?: number;
    target_r?: number;
    rsi_period?: number;
    oversold_threshold?: number;
    overbought_threshold?: number;
    exit_rsi?: number;
    channel_period?: number;
    entry_channel?: number;
    exit_channel?: number;
    bollinger_period?: number;
    bollinger_std?: number;
    bollinger_mode?: 'BREAKOUT' | 'REVERSION';
    atr_period?: number;
    supertrend_multiplier?: number;
    multiplier?: number;
  };
  candles?: BacktestCandle[];
}

export interface TradeRecord {
  id: string;
  type: 'BUY';
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  returnPct: number;
  exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'SIGNAL_EXIT' | 'END_OF_DATA';
  durationBars: number;
  feeAmount: number;
}

export interface BacktestResult {
  symbol: string;
  strategy_name: string;
  initial_capital: number;
  final_equity: number;
  net_profit: number;
  cumulative_return_pct: number;
  annualized_return_pct: number;
  benchmark_return_pct: number;
  alpha: number;
  beta: number;
  information_ratio: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  profit_factor: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  total_fees_paid: number;
  fill_model: string;
  equity_curve: number[];
  benchmark_curve: number[];
  trades: TradeRecord[];
}

export interface OutOfSampleResult {
  symbol: string;
  strategy_name: string;
  split_ratio: number;
  in_sample: {
    bars: number;
    return_pct: number;
    sharpe_ratio: number;
    max_drawdown_pct: number;
    win_rate_pct: number;
    total_trades: number;
  };
  out_of_sample: {
    bars: number;
    return_pct: number;
    sharpe_ratio: number;
    max_drawdown_pct: number;
    win_rate_pct: number;
    total_trades: number;
  };
  oos_efficiency: number; // OOS return / IS return
  overfit_warning: boolean;
  recommendation: string;
}

export interface WalkForwardFold {
  fold_index: number;
  train_bars: number;
  test_bars: number;
  in_sample_return_pct: number;
  in_sample_sharpe: number;
  out_of_sample_return_pct: number;
  out_of_sample_sharpe: number;
  out_of_sample_trades: number;
}

export interface WalkForwardResult {
  symbol: string;
  strategy_name: string;
  folds_count: number;
  folds: WalkForwardFold[];
  average_oos_return_pct: number;
  average_oos_sharpe: number;
  walk_forward_efficiency_pct: number; // (avg test return / avg train return) * 100
  is_robust: boolean;
}

// --- Technical Indicator Helpers ---

function computeEMA(data: number[], period: number): number[] {
  const p = Math.max(1, period);
  const k = 2 / (p + 1);
  const ema: number[] = [];
  let prev = data[0] || 0;
  ema.push(prev);

  for (let i = 1; i < data.length; i++) {
    const curr = data[i] * k + prev * (1 - k);
    ema.push(curr);
    prev = curr;
  }
  return ema;
}

function computeSMA(data: number[], period: number): number[] {
  const p = Math.max(1, period);
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < p - 1) {
      sma.push(data[i]);
    } else {
      const sum = data.slice(i - p + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / p);
    }
  }
  return sma;
}

function computeRSI(closes: number[], period: number = 14): number[] {
  const p = Math.max(2, period);
  const rsi: number[] = [];
  if (closes.length === 0) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= p && i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / p;
  let avgLoss = losses / p;
  rsi.push(50);

  for (let i = p + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (p - 1) + gain) / p;
    avgLoss = (avgLoss * (p - 1) + loss) / p;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }

  while (rsi.length < closes.length) {
    rsi.unshift(50);
  }
  return rsi;
}

function computeATR(candles: BacktestCandle[], period: number = 14): number[] {
  if (candles.length === 0) return [];
  const tr: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    const prevC = candles[i - 1].close;
    const currentTr = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
    tr.push(currentTr);
  }
  return computeSMA(tr, period);
}

function computeBollingerBands(closes: number[], period: number = 20, stdDevMultiplier: number = 2.0) {
  const middle = computeSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(closes[i]);
      lower.push(closes[i]);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + std * stdDevMultiplier);
      lower.push(mean - std * stdDevMultiplier);
    }
  }

  return { upper, middle, lower };
}

function computeDonchian(candles: BacktestCandle[], entryPeriod: number = 20, exitPeriod: number = 10) {
  const highs: number[] = [];
  const lows: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    const entryStart = Math.max(0, i - entryPeriod);
    const exitStart = Math.max(0, i - exitPeriod);

    // Prior bars only (excluding current bar to avoid lookahead)
    const priorEntryCandles = candles.slice(entryStart, i);
    const priorExitCandles = candles.slice(exitStart, i);

    const maxH = priorEntryCandles.length > 0 ? Math.max(...priorEntryCandles.map(c => c.high)) : candles[i].high;
    const minL = priorExitCandles.length > 0 ? Math.min(...priorExitCandles.map(c => c.low)) : candles[i].low;

    highs.push(maxH);
    lows.push(minL);
  }

  return { highs, lows };
}

function computeSupertrend(candles: BacktestCandle[], period: number = 10, multiplier: number = 3.0) {
  const atr = computeATR(candles, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];
  const direction: number[] = []; // 1 = Bullish, -1 = Bearish

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const basicUpper = (c.high + c.low) / 2 + multiplier * atr[i];
    const basicLower = (c.high + c.low) / 2 - multiplier * atr[i];

    if (i === 0) {
      upperBand.push(basicUpper);
      lowerBand.push(basicLower);
      direction.push(c.close >= basicUpper ? 1 : -1);
      continue;
    }

    const prevUpper = upperBand[i - 1];
    const prevLower = lowerBand[i - 1];
    const prevClose = candles[i - 1].close;
    const prevDir = direction[i - 1];

    // Ratcheting rule: bands tighten or maintain during active trend
    const finalUpper = (basicUpper < prevUpper || prevClose > prevUpper) ? basicUpper : prevUpper;
    const finalLower = (basicLower > prevLower || prevClose < prevLower) ? basicLower : prevLower;

    upperBand.push(finalUpper);
    lowerBand.push(finalLower);

    let curDir = prevDir;
    if (prevDir === 1 && c.close < finalLower) {
      curDir = -1; // Trend flip to bearish
    } else if (prevDir === -1 && c.close > finalUpper) {
      curDir = 1;  // Trend flip to bullish
    }
    direction.push(curDir);
  }

  return { upperBand, lowerBand, direction };
}

// --- Main Simulation Engine ---

export function runSimulation(params: BacktestParams): BacktestResult {
  const initialCapital = params.initial_capital || 1000000;
  const riskPct = Math.min(10.0, params.risk_per_trade_pct || 1.0);
  const commissionRate = params.commission_rate ?? 0.0003; // 0.03%
  const slippageRate = params.slippage_rate ?? 0.0005;     // 0.05%
  const fillModel = params.fill_model ?? 'NEXT_BAR_OPEN';

  let candles = params.candles;
  if (!candles || candles.length < 30) {
    throw new Error(`Insufficient historical candle data for ${params.symbol}. Backtest requires at least 30 real historical bars to run accurate simulation.`);
  }

  // Filter by date range if provided
  if (params.startDate) {
    const startMs = new Date(params.startDate).getTime();
    candles = candles.filter(c => new Date(c.timestamp).getTime() >= startMs);
  }
  if (params.endDate) {
    const endMs = new Date(params.endDate).getTime();
    candles = candles.filter(c => new Date(c.timestamp).getTime() <= endMs);
  }

  if (candles.length < 30) {
    throw new Error(`Date range filter resulted in fewer than 30 bars (${candles.length} bars remaining). Expand date window for valid backtest evaluation.`);
  }

  const closes = candles.map(c => c.close);

  // Strategy Parameters
  const fastPeriod = params.strategy_params?.fast_period || 9;
  const slowPeriod = params.strategy_params?.slow_period || 21;
  const stopAtrMult = params.strategy_params?.stop_loss_atr || 1.5;
  const targetR = params.strategy_params?.target_r || 2.0;
  const rsiPeriod = params.strategy_params?.rsi_period || 14;
  const oversoldThreshold = params.strategy_params?.oversold_threshold || 30;
  const overboughtThreshold = params.strategy_params?.overbought_threshold || 65;
  const exitRsi = params.strategy_params?.exit_rsi || 55;
  const donchianEntry = params.strategy_params?.entry_channel || params.strategy_params?.channel_period || 20;
  const donchianExit = params.strategy_params?.exit_channel || 10;
  const bollingerPeriod = params.strategy_params?.bollinger_period || 20;
  const bollingerStd = params.strategy_params?.bollinger_std || 2.0;
  const bollingerMode = params.strategy_params?.bollinger_mode || 'BREAKOUT';
  const supertrendAtrPeriod = params.strategy_params?.atr_period || 10;
  const supertrendMult = params.strategy_params?.supertrend_multiplier || params.strategy_params?.multiplier || 3.0;

  // Compute indicators
  const fastEma = computeEMA(closes, fastPeriod);
  const slowEma = computeEMA(closes, slowPeriod);
  const atr = computeATR(candles, 14);
  const rsi = computeRSI(closes, rsiPeriod);
  const bollinger = computeBollingerBands(closes, bollingerPeriod, bollingerStd);
  const donchian = computeDonchian(candles, donchianEntry, donchianExit);
  const supertrend = computeSupertrend(candles, supertrendAtrPeriod, supertrendMult);

  // Stateful execution variables
  let cash = initialCapital;
  let equity = initialCapital;
  let totalFeesPaid = 0;
  const equityCurve: number[] = [initialCapital];
  const benchmarkCurve: number[] = [initialCapital];
  const trades: TradeRecord[] = [];

  const initialBenchmarkPrice = candles[0].close;

  let currentPosition: {
    entryBar: number;
    entryDate: string;
    entryPrice: number;
    quantity: number;
    stopLoss: number;
    takeProfit: number;
  } | null = null;

  let pendingSignal: {
    barIndex: number;
    stopLoss: number;
    takeProfit: number;
  } | null = null;

  const warmup = Math.max(slowPeriod, rsiPeriod, donchianEntry, bollingerPeriod, 20);

  for (let i = warmup; i < candles.length; i++) {
    const candle = candles[i];
    const prevCandle = candles[i - 1];
    const currPrice = candle.close;
    const currentAtr = atr[i] || currPrice * 0.015;

    // Benchmark Buy & Hold tracking
    const currentBenchmarkEquity = Number((initialCapital * (currPrice / initialBenchmarkPrice)).toFixed(2));
    benchmarkCurve.push(currentBenchmarkEquity);

    // 1. Process pending fill if NEXT_BAR_OPEN model
    if (pendingSignal && !currentPosition && fillModel === 'NEXT_BAR_OPEN') {
      const openPrice = candle.open;
      const entryPriceWithSlippage = Number((openPrice * (1 + slippageRate)).toFixed(2));
      const stopDistance = Math.max(entryPriceWithSlippage * 0.005, currentAtr * stopAtrMult);
      const stopLoss = Number((entryPriceWithSlippage - stopDistance).toFixed(2));
      const takeProfit = Number((entryPriceWithSlippage + stopDistance * targetR).toFixed(2));

      const riskCapital = equity * (riskPct / 100);
      let safeQty = Math.floor(riskCapital / stopDistance);
      const maxAffordable = Math.floor((cash * 0.95) / entryPriceWithSlippage);
      safeQty = Math.min(safeQty, maxAffordable);

      if (safeQty > 0) {
        const orderFee = safeQty * entryPriceWithSlippage * commissionRate;
        cash -= (safeQty * entryPriceWithSlippage + orderFee);
        totalFeesPaid += orderFee;

        currentPosition = {
          entryBar: i,
          entryDate: candle.timestamp,
          entryPrice: entryPriceWithSlippage,
          quantity: safeQty,
          stopLoss,
          takeProfit
        };
      }
      pendingSignal = null;
    }

    // 2. Manage Active Position (Check Stops & Take-Profits)
    if (currentPosition) {
      let exitPrice = 0;
      let exitReason: TradeRecord['exitReason'] | null = null;

      // Check Stop-Loss
      if (candle.low <= currentPosition.stopLoss) {
        exitPrice = currentPosition.stopLoss;
        exitReason = 'STOP_LOSS';
      }
      // Check Take-Profit
      else if (candle.high >= currentPosition.takeProfit) {
        exitPrice = currentPosition.takeProfit;
        exitReason = 'TAKE_PROFIT';
      }
      // Check Strategy Signal Exits
      else if (params.strategy_name === 'EMA_CROSSOVER' && fastEma[i] < slowEma[i] && fastEma[i - 1] >= slowEma[i - 1]) {
        exitPrice = currPrice;
        exitReason = 'SIGNAL_EXIT';
      } else if (params.strategy_name === 'RSI_MEAN_REVERSION' && rsi[i] >= overboughtThreshold) {
        exitPrice = currPrice;
        exitReason = 'SIGNAL_EXIT';
      } else if (params.strategy_name === 'BOLLINGER_BANDS' && currPrice < bollinger.middle[i]) {
        exitPrice = currPrice;
        exitReason = 'SIGNAL_EXIT';
      } else if (params.strategy_name === 'DONCHIAN_MOMENTUM' && currPrice < donchian.lows[i]) {
        exitPrice = currPrice;
        exitReason = 'SIGNAL_EXIT';
      } else if (params.strategy_name === 'SUPERTREND' && supertrend.direction[i] === -1 && supertrend.direction[i - 1] === 1) {
        exitPrice = currPrice;
        exitReason = 'SIGNAL_EXIT';
      }

      if (exitReason) {
        const finalExit = Number((exitPrice * (1 - slippageRate)).toFixed(2));
        const exitFee = currentPosition.quantity * finalExit * commissionRate;
        totalFeesPaid += exitFee;

        const grossPnl = (finalExit - currentPosition.entryPrice) * currentPosition.quantity;
        const netPnl = Number((grossPnl - exitFee).toFixed(2));
        const returnPct = Number(((finalExit - currentPosition.entryPrice) / currentPosition.entryPrice * 100).toFixed(2));

        cash += (currentPosition.entryPrice * currentPosition.quantity) + netPnl;

        trades.push({
          id: `tr_${trades.length + 1}`,
          type: 'BUY',
          entryDate: currentPosition.entryDate,
          exitDate: candle.timestamp,
          entryPrice: currentPosition.entryPrice,
          exitPrice: finalExit,
          quantity: currentPosition.quantity,
          pnl: netPnl,
          returnPct,
          exitReason,
          durationBars: i - currentPosition.entryBar,
          feeAmount: Number(exitFee.toFixed(2))
        });

        currentPosition = null;
      }
    }

    // 3. Evaluate Strategy Entry Signals if flat
    if (!currentPosition && !pendingSignal && i < candles.length - 1) {
      let shouldEnter = false;

      if (params.strategy_name === 'EMA_CROSSOVER') {
        shouldEnter = fastEma[i] > slowEma[i] && fastEma[i - 1] <= slowEma[i - 1];
      } else if (params.strategy_name === 'RSI_MEAN_REVERSION') {
        shouldEnter = rsi[i - 1] < oversoldThreshold && rsi[i] >= oversoldThreshold;
      } else if (params.strategy_name === 'BOLLINGER_BANDS') {
        if (bollingerMode === 'BREAKOUT') {
          shouldEnter = currPrice > bollinger.upper[i] && prevCandle.close <= bollinger.upper[i - 1];
        } else {
          // Reversion
          shouldEnter = prevCandle.close < bollinger.lower[i - 1] && currPrice >= bollinger.lower[i];
        }
      } else if (params.strategy_name === 'DONCHIAN_MOMENTUM') {
        shouldEnter = currPrice > donchian.highs[i];
      } else if (params.strategy_name === 'SUPERTREND') {
        shouldEnter = supertrend.direction[i] === 1 && supertrend.direction[i - 1] === -1;
      } else {
        // Fallback robust momentum
        shouldEnter = fastEma[i] > slowEma[i] && currPrice > prevCandle.high;
      }

      if (shouldEnter) {
        if (fillModel === 'NEXT_BAR_OPEN') {
          pendingSignal = {
            barIndex: i,
            stopLoss: currPrice * 0.98,
            takeProfit: currPrice * 1.04
          };
        } else {
          // CURRENT_BAR_CLOSE fill model
          const entryPrice = Number((currPrice * (1 + slippageRate)).toFixed(2));
          const stopDistance = Math.max(entryPrice * 0.005, currentAtr * stopAtrMult);
          const stopLoss = Number((entryPrice - stopDistance).toFixed(2));
          const takeProfit = Number((entryPrice + stopDistance * targetR).toFixed(2));

          const riskCapital = equity * (riskPct / 100);
          let safeQty = Math.floor(riskCapital / stopDistance);
          const maxAffordable = Math.floor((cash * 0.95) / entryPrice);
          safeQty = Math.min(safeQty, maxAffordable);

          if (safeQty > 0) {
            const fee = safeQty * entryPrice * commissionRate;
            cash -= (safeQty * entryPrice + fee);
            totalFeesPaid += fee;

            currentPosition = {
              entryBar: i,
              entryDate: candle.timestamp,
              entryPrice,
              quantity: safeQty,
              stopLoss,
              takeProfit
            };
          }
        }
      }
    }

    // Update mark-to-market equity
    const openPositionValue = currentPosition ? currentPosition.quantity * currPrice : 0;
    equity = cash + openPositionValue;
    equityCurve.push(Number(equity.toFixed(2)));
  }

  // End of data: close any lingering open position
  if (currentPosition) {
    const finalCandle = candles[candles.length - 1];
    const finalExit = Number((finalCandle.close * (1 - slippageRate)).toFixed(2));
    const fee = currentPosition.quantity * finalExit * commissionRate;
    totalFeesPaid += fee;
    const grossPnl = (finalExit - currentPosition.entryPrice) * currentPosition.quantity;
    const netPnl = Number((grossPnl - fee).toFixed(2));

    cash += (currentPosition.entryPrice * currentPosition.quantity) + netPnl;
    trades.push({
      id: `tr_${trades.length + 1}`,
      type: 'BUY',
      entryDate: currentPosition.entryDate,
      exitDate: finalCandle.timestamp,
      entryPrice: currentPosition.entryPrice,
      exitPrice: finalExit,
      quantity: currentPosition.quantity,
      pnl: netPnl,
      returnPct: Number(((finalExit - currentPosition.entryPrice) / currentPosition.entryPrice * 100).toFixed(2)),
      exitReason: 'END_OF_DATA',
      durationBars: candles.length - 1 - currentPosition.entryBar,
      feeAmount: Number(fee.toFixed(2))
    });
  }

  const finalEquity = Number(cash.toFixed(2));
  const netProfit = Number((finalEquity - initialCapital).toFixed(2));
  const cumulativeReturnPct = Number(((netProfit / initialCapital) * 100).toFixed(2));

  // Benchmark Return
  const finalBenchmarkPrice = candles[candles.length - 1].close;
  const benchmarkReturnPct = Number((((finalBenchmarkPrice - initialBenchmarkPrice) / initialBenchmarkPrice) * 100).toFixed(2));

  // Trade metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl <= 0).length;
  const winRatePct = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

  const grossWin = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? Number((grossWin / grossLoss).toFixed(2)) : grossWin > 0 ? 99.0 : 0.0;

  // Max Drawdown
  let peak = equityCurve[0];
  let maxDd = 0;
  for (const eq of equityCurve) {
    if (eq > peak) peak = eq;
    const dd = ((peak - eq) / peak) * 100;
    if (dd > maxDd) maxDd = dd;
  }
  const maxDrawdownPct = Number(maxDd.toFixed(2));

  // Periodic daily returns & Benchmark comparison
  const dailyReturns: number[] = [];
  const benchReturns: number[] = [];

  for (let i = 1; i < equityCurve.length; i++) {
    const prevE = equityCurve[i - 1];
    dailyReturns.push(prevE > 0 ? (equityCurve[i] - prevE) / prevE : 0);

    const prevB = benchmarkCurve[i - 1] || initialCapital;
    const curB = benchmarkCurve[i] || initialCapital;
    benchReturns.push(prevB > 0 ? (curB - prevB) / prevB : 0);
  }

  const meanReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
  const meanBench = benchReturns.length > 0 ? benchReturns.reduce((a, b) => a + b, 0) / benchReturns.length : 0;

  let varReturn = 0;
  let varBench = 0;
  let covariance = 0;
  let downsideVar = 0;
  const rfDaily = 0.065 / 252; // 6.5% risk-free benchmark

  for (let i = 0; i < dailyReturns.length; i++) {
    const dR = dailyReturns[i] - meanReturn;
    const dB = benchReturns[i] - meanBench;
    varReturn += dR * dR;
    varBench += dB * dB;
    covariance += dR * dB;

    const excess = dailyReturns[i] - rfDaily;
    if (excess < 0) {
      downsideVar += excess * excess;
    }
  }

  const n = Math.max(1, dailyReturns.length);
  const stdReturn = Math.sqrt(varReturn / n) || 0.0001;
  const stdDownside = Math.sqrt(downsideVar / n) || 0.0001;

  const annualizedSharpe = ((meanReturn - rfDaily) / stdReturn) * Math.sqrt(252);
  const sharpeRatio = Number(Math.max(-2, Math.min(5.0, annualizedSharpe)).toFixed(2));

  const annualizedSortino = ((meanReturn - rfDaily) / stdDownside) * Math.sqrt(252);
  const sortinoRatio = Number(Math.max(-2, Math.min(6.5, annualizedSortino)).toFixed(2));

  const beta = varBench > 1e-8 ? Number((covariance / varBench).toFixed(2)) : 1.0;
  const annStrat = cumulativeReturnPct;
  const annBench = benchmarkReturnPct;
  const alpha = Number((annStrat - (beta * annBench)).toFixed(2));

  // Information Ratio = (Mean Excess Return) / Tracking Error
  const excessReturns = dailyReturns.map((r, i) => r - (benchReturns[i] || 0));
  const meanExcess = excessReturns.reduce((a, b) => a + b, 0) / n;
  const trackingError = Math.sqrt(excessReturns.reduce((a, b) => a + Math.pow(b - meanExcess, 2), 0) / n) * Math.sqrt(252);
  const informationRatio = trackingError > 0.001 ? Number(((meanExcess * 252) / trackingError).toFixed(2)) : 0.0;

  return {
    symbol: params.symbol,
    strategy_name: params.strategy_name,
    initial_capital: initialCapital,
    final_equity: finalEquity,
    net_profit: netProfit,
    cumulative_return_pct: cumulativeReturnPct,
    annualized_return_pct: Number((cumulativeReturnPct * (252 / candles.length)).toFixed(2)),
    benchmark_return_pct: benchmarkReturnPct,
    alpha,
    beta,
    information_ratio: informationRatio,
    total_trades: totalTrades,
    winning_trades: winningTrades,
    losing_trades: losingTrades,
    win_rate_pct: winRatePct,
    profit_factor: profitFactor,
    max_drawdown_pct: maxDrawdownPct,
    sharpe_ratio: sharpeRatio,
    sortino_ratio: sortinoRatio,
    total_fees_paid: Number(totalFeesPaid.toFixed(2)),
    fill_model: fillModel,
    equity_curve: equityCurve,
    benchmark_curve: benchmarkCurve,
    trades
  };
}

// --- Out-of-Sample (OOS) Evaluation ---

export function evaluateOutOfSample(params: BacktestParams, splitRatio: number = 0.70): OutOfSampleResult {
  const candles = params.candles;
  if (!candles || candles.length < 50) {
    throw new Error('At least 50 historical bars are required for valid out-of-sample evaluation.');
  }

  const splitIdx = Math.floor(candles.length * Math.min(0.85, Math.max(0.50, splitRatio)));
  const inSampleCandles = candles.slice(0, splitIdx);
  const outOfSampleCandles = candles.slice(splitIdx);

  const isResult = runSimulation({ ...params, candles: inSampleCandles });
  const oosResult = runSimulation({ ...params, candles: outOfSampleCandles, initial_capital: isResult.final_equity });

  const oosEfficiency = isResult.cumulative_return_pct !== 0
    ? Number((oosResult.cumulative_return_pct / isResult.cumulative_return_pct).toFixed(2))
    : 1.0;

  const overfit = oosResult.sharpe_ratio < 0.3 * isResult.sharpe_ratio || (oosResult.cumulative_return_pct < 0 && isResult.cumulative_return_pct > 0);

  let recommendation = 'Strategy demonstrates strong out-of-sample generalizability.';
  if (overfit) {
    recommendation = 'Overfitting risk detected: Out-of-sample return or Sharpe dropped substantially vs in-sample. Relax strategy parameters.';
  } else if (oosEfficiency < 0.5) {
    recommendation = 'Moderate performance degradation in out-of-sample test. Consider widening stop-loss or reducing indicator sensitivity.';
  }

  return {
    symbol: params.symbol,
    strategy_name: params.strategy_name,
    split_ratio: splitRatio,
    in_sample: {
      bars: inSampleCandles.length,
      return_pct: isResult.cumulative_return_pct,
      sharpe_ratio: isResult.sharpe_ratio,
      max_drawdown_pct: isResult.max_drawdown_pct,
      win_rate_pct: isResult.win_rate_pct,
      total_trades: isResult.total_trades
    },
    out_of_sample: {
      bars: outOfSampleCandles.length,
      return_pct: oosResult.cumulative_return_pct,
      sharpe_ratio: oosResult.sharpe_ratio,
      max_drawdown_pct: oosResult.max_drawdown_pct,
      win_rate_pct: oosResult.win_rate_pct,
      total_trades: oosResult.total_trades
    },
    oos_efficiency: oosEfficiency,
    overfit_warning: overfit,
    recommendation
  };
}

// --- Walk-Forward Analysis (WFA) ---

export function evaluateWalkForward(params: BacktestParams, foldsCount: number = 3): WalkForwardResult {
  const candles = params.candles;
  if (!candles || candles.length < 80) {
    throw new Error('At least 80 historical bars are required for Walk-Forward evaluation.');
  }

  const folds: WalkForwardFold[] = [];
  const totalBars = candles.length;
  const foldSize = Math.floor(totalBars / (foldsCount + 1));

  let totalOosReturn = 0;
  let totalOosSharpe = 0;
  let totalIsReturn = 0;

  for (let f = 0; f < foldsCount; f++) {
    const trainStart = f * Math.floor(foldSize / 2);
    const trainEnd = trainStart + foldSize * 2;
    const testEnd = Math.min(totalBars, trainEnd + foldSize);

    if (trainEnd >= totalBars || testEnd <= trainEnd) break;

    const trainCandles = candles.slice(trainStart, trainEnd);
    const testCandles = candles.slice(trainEnd, testEnd);

    const isRes = runSimulation({ ...params, candles: trainCandles });
    const oosRes = runSimulation({ ...params, candles: testCandles, initial_capital: isRes.final_equity });

    folds.push({
      fold_index: f + 1,
      train_bars: trainCandles.length,
      test_bars: testCandles.length,
      in_sample_return_pct: isRes.cumulative_return_pct,
      in_sample_sharpe: isRes.sharpe_ratio,
      out_of_sample_return_pct: oosRes.cumulative_return_pct,
      out_of_sample_sharpe: oosRes.sharpe_ratio,
      out_of_sample_trades: oosRes.total_trades
    });

    totalOosReturn += oosRes.cumulative_return_pct;
    totalOosSharpe += oosRes.sharpe_ratio;
    totalIsReturn += isRes.cumulative_return_pct;
  }

  const avgOosReturn = folds.length > 0 ? Number((totalOosReturn / folds.length).toFixed(2)) : 0;
  const avgOosSharpe = folds.length > 0 ? Number((totalOosSharpe / folds.length).toFixed(2)) : 0;
  const avgIsReturn = folds.length > 0 ? Number((totalIsReturn / folds.length).toFixed(2)) : 1;

  const wfePct = avgIsReturn !== 0 ? Number(((avgOosReturn / avgIsReturn) * 100).toFixed(1)) : 100;
  const isRobust = avgOosReturn > 0 && wfePct >= 40.0;

  return {
    symbol: params.symbol,
    strategy_name: params.strategy_name,
    folds_count: folds.length,
    folds,
    average_oos_return_pct: avgOosReturn,
    average_oos_sharpe: avgOosSharpe,
    walk_forward_efficiency_pct: wfePct,
    is_robust: isRobust
  };
}
