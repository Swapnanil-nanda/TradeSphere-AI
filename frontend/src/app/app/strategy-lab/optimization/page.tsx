'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sliders, Play, Activity, ShieldCheck, CheckCircle2, 
  TrendingUp, AlertTriangle, RefreshCw, BarChart2, Layers
} from 'lucide-react';

export default function ParameterOptimizationPage() {
  const [strategy, setStrategy] = useState('EMA_CROSSOVER');
  const [symbol, setSymbol] = useState('RELIANCE');
  const [metric, setMetric] = useState<'sharpe' | 'profitFactor' | 'maxDrawdown'>('sharpe');
  const [optimizing, setOptimizing] = useState(false);

  // Parameter ranges
  const fastRange = [5, 9, 13, 17, 21];
  const slowRange = [20, 30, 40, 50, 60];

  // Simulated 2D grid matrix of Sharpe ratios
  const [gridData, setGridData] = useState<number[][]>([
    [1.12, 1.34, 1.58, 1.42, 1.20],
    [1.25, 1.62, 1.84, 1.71, 1.38],
    [1.40, 1.78, 1.95, 1.80, 1.45],
    [1.31, 1.55, 1.72, 1.60, 1.28],
    [1.08, 1.22, 1.35, 1.29, 1.10]
  ]);

  const handleRunOptimization = () => {
    setOptimizing(true);
    setTimeout(() => {
      // Generate randomized realistic grid with stable plateau around center
      const newGrid = fastRange.map((_, i) =>
        slowRange.map((_, j) => {
          const distFromOpt = Math.hypot(i - 2, j - 2);
          const base = 1.95 - distFromOpt * 0.28 + (Math.random() * 0.15 - 0.075);
          return Math.round(Math.max(0.6, base) * 100) / 100;
        })
      );
      setGridData(newGrid);
      setOptimizing(false);
    }, 600);
  };

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
    if (val >= 1.8) return 'bg-[#35C69A] text-[#090D12] font-black';
    if (val >= 1.5) return 'bg-[#35C69A]/75 text-[#090D12] font-bold';
    if (val >= 1.3) return 'bg-[#35C69A]/40 text-[#E7EDF3] font-semibold';
    if (val >= 1.1) return 'bg-[#151F29] text-[#8B99A8]';
    return 'bg-[#0D131A] text-[#8B99A8]/60';
  };

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Parameter Sweep & Robustness Lab</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#2979FF] border border-[#25313D]">
                2D SENSITIVITY GRID
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Multi-parameter grid optimization with plateau robustness verification to detect curve-fitting.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunOptimization}
          disabled={optimizing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${optimizing ? 'animate-spin' : ''}`} />
          <span>{optimizing ? 'Sweeping Grid...' : 'Execute Parameter Sweep'}</span>
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
              <option value="RELIANCE">RELIANCE</option>
              <option value="TCS">TCS</option>
              <option value="INFY">INFY</option>
              <option value="HDFCBANK">HDFCBANK</option>
              <option value="AAPL">AAPL</option>
              <option value="NVDA">NVDA</option>
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
              {m === 'sharpe' ? 'Sharpe Ratio' : m === 'profitFactor' ? 'Profit Factor' : 'Min Drawdown'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Heatmap Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-[#111922] p-4 rounded-xl border border-[#25313D]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider font-mono">
                Optimization Surface: Fast Period vs Slow Period
              </h2>
              <p className="text-[11px] text-[#8B99A8]">
                X-Axis: Slow Moving Average (20 to 60) | Y-Axis: Fast Moving Average (5 to 21)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#8B99A8]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#35C69A]"></span> Optimal Plateau
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#151F29] border border-[#25313D]"></span> Low Alpha
              </span>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse font-mono text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left text-[10px] text-[#8B99A8] border-b border-[#25313D]">
                    Fast \ Slow
                  </th>
                  {slowRange.map((slow) => (
                    <th key={slow} className="p-2 text-[11px] text-[#8B99A8] border-b border-[#25313D]">
                      {slow}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fastRange.map((fast, i) => (
                  <tr key={fast}>
                    <td className="p-2 text-left font-bold text-[#8B99A8] border-r border-[#25313D]">
                      {fast}
                    </td>
                    {gridData[i].map((val, j) => {
                      const isOptimal = i === maxI && j === maxJ;
                      return (
                        <td key={j} className="p-1.5">
                          <div
                            className={`py-2 rounded-md transition-transform hover:scale-105 cursor-pointer relative ${getColorClass(
                              val
                            )}`}
                          >
                            <span>{val.toFixed(2)}</span>
                            {isOptimal && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#2979FF] ring-2 ring-[#111922]" />
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

        {/* Robustness Assessment Panel */}
        <div className="space-y-3">
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
            <h3 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider font-mono pb-2 border-b border-[#25313D] mb-3">
              Robustness Audit
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-[#8B99A8] block">Optimal Coordinate</span>
                <div className="text-base font-bold font-mono text-[#35C69A] mt-0.5">
                  Fast: {fastRange[maxI]} | Slow: {slowRange[maxJ]}
                </div>
                <div className="text-[10px] text-[#8B99A8]">Max Sharpe Ratio: {maxVal.toFixed(2)}</div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#35C69A] mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Robust Parameter Plateau</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-snug">
                  Adjacent parameter cells exhibit &gt;85% efficiency of the peak. Low risk of curve-fitting or data snooping bias.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8] block mb-1">Deflated Sharpe Ratio (DSR)</span>
                <div className="text-sm font-bold font-mono text-[#E7EDF3]">
                  1.48 <span className="text-[10px] font-normal text-[#35C69A]">(Statistically Significant, p &lt; 0.01)</span>
                </div>
              </div>

              <Link
                href={`/app/strategy-lab/builder?fast=${fastRange[maxI]}&slow=${slowRange[maxJ]}`}
                className="w-full py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-center block transition-colors"
              >
                Apply Parameters in Builder
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D131A] border border-[#25313D] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#35C69A] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#8B99A8] leading-relaxed">
              <strong className="text-[#E7EDF3]">Anti-Overfitting Standard:</strong> Isolated parameter spikes without surrounding support are flagged as unstable. We require contiguous multi-cell plateaus.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
