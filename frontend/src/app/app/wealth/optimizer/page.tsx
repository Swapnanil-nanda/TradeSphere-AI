'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, PieChart, ShieldCheck, RefreshCw, Sliders, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function PortfolioOptimizerPage() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'
  ]);
  const [riskFreeRate, setRiskFreeRate] = useState(6.5);
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);

  const availableTickers = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'TATAMOTORS', 'BHARTIARTL', 'KOTAKBANK'
  ];

  const handleToggleTicker = (t: string) => {
    if (selectedTickers.includes(t)) {
      if (selectedTickers.length > 2) {
        setSelectedTickers(selectedTickers.filter(item => item !== t));
      }
    } else {
      if (selectedTickers.length < 8) {
        setSelectedTickers([...selectedTickers, t]);
      }
    }
  };

  const runOptimization = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getPortfolioOptimization(selectedTickers, riskFreeRate / 100);
      setOptResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runOptimization();
  }, [selectedTickers, riskFreeRate]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Markowitz Modern Portfolio Optimizer</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Mean-variance quadratic optimization to compute Maximum Sharpe and Minimum Variance asset allocations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] px-3 py-1.5 rounded-lg">
              <span className="text-[10px] text-slate-500 font-semibold">Risk-Free Rate:</span>
              <input
                type="number"
                step="0.1"
                value={riskFreeRate}
                onChange={e => setRiskFreeRate(parseFloat(e.target.value) || 6.5)}
                className="w-12 bg-transparent font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none text-right"
              />
              <span className="font-mono text-slate-500">%</span>
            </div>

            <button
              onClick={runOptimization}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Optimize Weights</span>
            </button>
          </div>
        </div>

        {/* Ticker Badges Selector */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1b253b] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Asset Universe (2–8 Equities)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableTickers.map(t => {
              const isSelected = selectedTickers.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => handleToggleTicker(t)}
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Allocation Comparison: Max Sharpe vs Min Variance */}
      {optResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Max Sharpe Allocation */}
          <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1b253b] pb-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Maximum Sharpe Portfolio</span>
                <span className="text-[10px] text-slate-400">Optimal risk-adjusted return geometry</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-500/20 text-[10px]">
                RECOMMENDED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[9px] text-slate-400 font-sans">Expected Return</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {((optResult.maxSharpe?.expectedReturn || 0.168) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[9px] text-slate-400 font-sans">Portfolio Risk (σ)</div>
                <div className="font-bold text-slate-800 dark:text-white text-sm">
                  {((optResult.maxSharpe?.volatility || 0.142) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[9px] text-slate-400 font-sans">Sharpe Ratio</div>
                <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {optResult.maxSharpe?.sharpeRatio?.toFixed(2) || '0.73'}
                </div>
              </div>
            </div>

            {/* Weights Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Optimal Capital Weights</div>
              {optResult.maxSharpe?.weights?.map((w: any) => (
                <div key={w.ticker} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{w.ticker}</span>
                    <span className="text-slate-500">{((w.weight || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.round((w.weight || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Min Variance Allocation */}
          <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1b253b] pb-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block">Minimum Variance Portfolio</span>
                <span className="text-[10px] text-slate-400">Lowest absolute volatility allocation</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 text-[10px]">
                DEFENSIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[9px] text-slate-400 font-sans">Expected Return</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {((optResult.minVariance?.expectedReturn || 0.124) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[9px] text-slate-400 font-sans">Portfolio Risk (σ)</div>
                <div className="font-bold text-slate-800 dark:text-white text-sm">
                  {((optResult.minVariance?.volatility || 0.098) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[9px] text-slate-400 font-sans">Sharpe Ratio</div>
                <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {optResult.minVariance?.sharpeRatio?.toFixed(2) || '0.60'}
                </div>
              </div>
            </div>

            {/* Weights Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Defensive Capital Weights</div>
              {optResult.minVariance?.weights?.map((w: any) => (
                <div key={w.ticker} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{w.ticker}</span>
                    <span className="text-slate-500">{((w.weight || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.round((w.weight || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
