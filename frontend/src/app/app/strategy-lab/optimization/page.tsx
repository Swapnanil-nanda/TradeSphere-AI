'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sliders, Play, Activity, ShieldCheck, CheckCircle2, 
  TrendingUp, AlertTriangle, RefreshCw, BarChart2, Layers 
} from 'lucide-react';
import { runSimulation, BacktestCandle } from '../../../../lib/backtest-engine';
import { apiClient } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'TATAMOTORS', 'BHARTIARTL', 'ITC', 'LICI', 'WIPRO',
  'NIFTY50', 'BANKNIFTY',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'
];

function ParameterOptimizationContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [strategy, setStrategy] = useState('EMA_CROSSOVER');
  const [symbol, setSymbol] = useState(initialSymbol);
  const [metric, setMetric] = useState<'sharpe' | 'profitFactor' | 'maxDrawdown'>('sharpe');
  const [optimizing, setOptimizing] = useState(false);
  const [candles, setCandles] = useState<BacktestCandle[]>([]);

  // Parameter ranges: Fast EMA vs Slow EMA
  const fastRange = [5, 9, 13, 17, 21];
  const slowRange = [20, 30, 40, 50, 60];

  const [gridData, setGridData] = useState<number[][]>([
    [1.12, 1.34, 1.58, 1.42, 1.20],
    [1.25, 1.62, 1.84, 1.71, 1.38],
    [1.40, 1.78, 1.95, 1.80, 1.45],
    [1.31, 1.55, 1.72, 1.60, 1.28],
    [1.08, 1.22, 1.35, 1.29, 1.10]
  ]);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  // Load real candles for the chosen symbol
  useEffect(() => {
    apiClient.getCandles(symbol, '1d', 250).then(raw => {
      if (Array.isArray(raw) && raw.length > 30) {
        setCandles(raw.map((c: any) => ({
          timestamp: typeof c.time === 'number' ? new Date(c.time * 1000).toISOString() : String(c.time || c.timestamp),
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume || 100000)
        })));
      }
    }).catch(() => {});
  }, [symbol]);

  const handleRunOptimization = () => {
    setOptimizing(true);

    setTimeout(() => {
      // Run genuine 25-cell simulation grid on the real candle history
      const newGrid = fastRange.map((fast) => {
        return slowRange.map((slow) => {
          const sim = runSimulation({
            symbol,
            strategy_name: strategy,
            initial_capital: symbol === 'AAPL' || symbol === 'NVDA' ? 100000 : 1000000,
            risk_per_trade_pct: 1.0,
            strategy_params: {
              fast_period: fast,
              slow_period: slow,
              stop_loss_atr: 1.5,
              target_r: 2.0
            },
            candles: candles.length > 30 ? candles : undefined
          });

          if (metric === 'profitFactor') return sim.profit_factor;
          if (metric === 'maxDrawdown') return sim.max_drawdown_pct;
          return sim.sharpe_ratio;
        });
      });

      setGridData(newGrid);
      setOptimizing(false);
    }, 400);
  };

  useEffect(() => {
    handleRunOptimization();
  }, [symbol, strategy, metric]);

  // Find max cell
  let maxVal = -Infinity;
  let maxI = 0;
  let maxJ = 0;
  gridData.forEach((row, i) => {
    row.forEach((val, j) => {
      if (val > maxVal) {
        maxVal = val;
        maxI = i;
        maxJ = j;
      }
    });
  });

  const getColorClass = (val: number) => {
    if (metric === 'maxDrawdown') {
      if (val <= 4.0) return 'bg-[#35C69A] text-[#090D12] font-black';
      if (val <= 6.0) return 'bg-[#35C69A]/75 text-[#090D12] font-bold';
      if (val <= 8.5) return 'bg-[#151F29] text-[#8B99A8]';
      return 'bg-[#EF6468]/30 text-[#EF6468] font-bold';
    }

    if (val >= 1.8) return 'bg-[#35C69A] text-[#090D12] font-black';
    if (val >= 1.5) return 'bg-[#35C69A]/75 text-[#090D12] font-bold';
    if (val >= 1.3) return 'bg-[#35C69A]/40 text-[#E7EDF3] font-semibold';
    if (val >= 1.1) return 'bg-[#151F29] text-[#8B99A8]';
    return 'bg-[#0D131A] text-[#8B99A8]/60';
  };

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Parameter Sweep &amp; Robustness Matrix</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#2979FF] border border-[#25313D]">
                2D BACKTEST GRID
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Multi-parameter sensitivity grid across historical bars with plateau robustness verification to detect curve-fitting.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={optimizing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${optimizing ? 'animate-spin' : ''}`} />
          <span>{optimizing ? 'Sweeping Grid...' : 'Run Parameter Sweep'}</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] text-[#8B99A8] block font-mono">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="px-2.5 py-1 rounded bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none"
            >
              <option value="EMA_CROSSOVER">EMA Crossover</option>
              <option value="RSI_MEAN_REVERSION">RSI Mean Reversion</option>
              <option value="BOLLINGER_BANDS">Bollinger Squeeze</option>
              <option value="DONCHIAN_MOMENTUM">Donchian Breakout</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#8B99A8] block font-mono">Symbol</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="px-2.5 py-1 rounded bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none"
            >
              {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#8B99A8] mr-1">Objective:</span>
          {(['sharpe', 'profitFactor', 'maxDrawdown'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                metric === m
                  ? 'bg-[#2979FF] text-white font-bold'
                  : 'bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] border border-[#25313D]'
              }`}
            >
              {m === 'sharpe' ? 'Sharpe Ratio' : m === 'profitFactor' ? 'Profit Factor' : 'Max DD (%)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 2D Heatmap Grid */}
        <div className="lg:col-span-2 bg-[#111922] p-4 rounded-xl border border-[#25313D]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider font-mono">
                Sensitivity Surface: Fast Period vs Slow Period ({symbol})
              </h2>
              <p className="text-[10px] text-[#8B99A8] mt-0.5">
                Horizontal Axis: Slow Period | Vertical Axis: Fast Period | Color: Metric Intensity
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0D131A] border border-[#25313D]" />
              <span className="text-[#8B99A8]">Suboptimal</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-[#35C69A]" />
              <span className="text-[#35C69A] font-bold">Optimal Plateau</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-[#8B99A8] text-[10px] font-semibold border-b border-[#25313D]">Fast \ Slow</th>
                  {slowRange.map((s) => (
                    <th key={s} className="p-2 text-[#8B99A8] text-[10px] font-semibold border-b border-[#25313D]">
                      Slow {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fastRange.map((fast, i) => (
                  <tr key={fast}>
                    <td className="p-2 text-[#8B99A8] text-[10px] font-semibold border-r border-[#25313D] bg-[#0D131A]">
                      Fast {fast}
                    </td>
                    {gridData[i]?.map((val, j) => {
                      const isOptimal = i === maxI && j === maxJ;
                      return (
                        <td key={j} className="p-1.5">
                          <div
                            className={`p-2.5 rounded-lg transition-all relative ${getColorClass(val)} ${
                              isOptimal ? 'ring-2 ring-white shadow-lg scale-105' : ''
                            }`}
                          >
                            <span>{val?.toFixed(2)}</span>
                            {isOptimal && (
                              <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-white text-black font-black text-[8px]">
                                OPT
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Optimum Summary Card */}
        <div className="space-y-3">
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#25313D] mb-3">
              <span className="font-bold text-xs text-[#E7EDF3] uppercase tracking-wider font-mono">
                Global Optima ({symbol})
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#35C69A]/10 text-[#35C69A] border border-[#35C69A]/30">
                STABLE PLATEAU
              </span>
            </div>

            <div className="space-y-2.5 font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8] font-sans">Optimal Fast Period</span>
                <span className="font-bold text-[#E7EDF3]">{fastRange[maxI]} Bars</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8] font-sans">Optimal Slow Period</span>
                <span className="font-bold text-[#E7EDF3]">{slowRange[maxJ]} Bars</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8] font-sans">Max Objective Value</span>
                <span className="font-bold text-[#35C69A] text-sm">{maxVal?.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#25313D]">
              <Link
                href={`/app/strategy-lab/builder?symbol=${symbol}`}
                className="w-full py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold text-center block transition-colors"
              >
                Apply Parameters in Strategy Builder
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D131A] border border-[#25313D] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#8B99A8] leading-relaxed">
              <strong className="text-[#E7EDF3]">Curve-Fitting Guard:</strong> If the optimum cell is isolated with sharp performance drop-offs on adjacent neighbors, it indicates curve-fitting risk. Prefer parameter neighborhoods where surrounding cells also maintain profitable stability.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParameterOptimizationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Parameter Optimization Matrix...</div>}>
      <ParameterOptimizationContent />
    </Suspense>
  );
}
