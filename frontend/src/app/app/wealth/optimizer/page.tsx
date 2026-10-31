'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, PieChart, ShieldCheck, RefreshCw, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function PortfolioOptimizerPage() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY'
  ]);
  const [riskFreeRate, setRiskFreeRate] = useState(6.75);
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);

  const availableTickers = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'AAPL', 'NVDA', 'MSFT'
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
    <div className="space-y-4 select-none pb-8 text-xs font-sans">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Markowitz Modern Portfolio Optimizer</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                MPT SOLVER
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Mean-variance quadratic optimization to compute Maximum Sharpe and Minimum Variance asset allocations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0D131A] border border-[#25313D] px-3 py-1.5 rounded-lg">
            <span className="text-[10px] text-[#8B99A8] font-semibold font-mono">Rf Rate:</span>
            <input
              type="number"
              step="0.05"
              value={riskFreeRate}
              onChange={e => setRiskFreeRate(parseFloat(e.target.value) || 6.75)}
              className="w-12 bg-transparent font-mono font-bold text-[#E7EDF3] focus:outline-none text-right"
            />
            <span className="font-mono text-[#8B99A8]">%</span>
          </div>

          <button
            onClick={runOptimization}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Optimize Weights</span>
          </button>

          <Link
            href="/app/wealth/frontier"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25313D] bg-[#151F29] hover:bg-[#1E2B38] text-[#E7EDF3] transition-colors"
          >
            <span>Efficient Frontier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Asset Universe Selector */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] space-y-1.5">
        <label className="text-[10px] font-bold text-[#8B99A8] uppercase tracking-wider block font-mono">
          Select Asset Universe (2–8 Constituents)
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
                    ? 'bg-[#2979FF] text-white shadow-xs'
                    : 'bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] border border-[#25313D]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Allocation Comparison: Max Sharpe vs Min Variance */}
      {optResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Max Sharpe Allocation */}
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#25313D] pb-2">
              <div>
                <span className="font-bold text-[#E7EDF3] text-xs block font-mono">Maximum Sharpe Portfolio</span>
                <span className="text-[10px] text-[#8B99A8]">Tangency portfolio maximizing excess return per unit risk</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#2979FF]/15 text-[#2979FF] font-bold border border-[#2979FF]/30 text-[10px] font-mono">
                RECOMMENDED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="text-[9px] text-[#8B99A8] font-sans">Expected Return</div>
                <div className="font-bold text-[#35C69A] text-sm">
                  {((optResult.maxSharpe?.expectedReturn || 0.285) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="text-[9px] text-[#8B99A8] font-sans">Portfolio Risk (σ)</div>
                <div className="font-bold text-[#E7EDF3] text-sm">
                  {((optResult.maxSharpe?.volatility || 0.152) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="text-[9px] text-[#8B99A8] font-sans">Sharpe Ratio</div>
                <div className="font-bold text-[#2979FF] text-sm">
                  {optResult.maxSharpe?.sharpeRatio?.toFixed(2) || '1.62'}
                </div>
              </div>
            </div>

            {/* Weights Breakdown */}
            <div className="space-y-2 pt-1 font-mono">
              <div className="text-[10px] font-bold text-[#8B99A8] uppercase">Optimal Capital Weights</div>
              {optResult.maxSharpe?.weights?.map((w: any) => (
                <div key={w.ticker} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#E7EDF3]">{w.ticker}</span>
                    <span className="text-[#8B99A8]">{((w.weight || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0D131A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2979FF] rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((w.weight || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Min Variance Allocation */}
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#25313D] pb-2">
              <div>
                <span className="font-bold text-[#E7EDF3] text-xs block font-mono">Minimum Variance Portfolio</span>
                <span className="text-[10px] text-[#8B99A8]">Lowest absolute annualized volatility allocation</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#151F29] text-[#8B99A8] font-semibold border border-[#25313D] text-[10px] font-mono">
                DEFENSIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="text-[9px] text-[#8B99A8] font-sans">Expected Return</div>
                <div className="font-bold text-[#35C69A] text-sm">
                  {((optResult.minVariance?.expectedReturn || 0.148) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="text-[9px] text-[#8B99A8] font-sans">Portfolio Risk (σ)</div>
                <div className="font-bold text-[#E7EDF3] text-sm">
                  {((optResult.minVariance?.volatility || 0.105) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="text-[9px] text-[#8B99A8] font-sans">Sharpe Ratio</div>
                <div className="font-bold text-[#2979FF] text-sm">
                  {optResult.minVariance?.sharpeRatio?.toFixed(2) || '0.88'}
                </div>
              </div>
            </div>

            {/* Weights Breakdown */}
            <div className="space-y-2 pt-1 font-mono">
              <div className="text-[10px] font-bold text-[#8B99A8] uppercase">Defensive Capital Weights</div>
              {optResult.minVariance?.weights?.map((w: any) => (
                <div key={w.ticker} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#E7EDF3]">{w.ticker}</span>
                    <span className="text-[#8B99A8]">{((w.weight || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0D131A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#35C69A] rounded-full transition-all duration-500"
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
