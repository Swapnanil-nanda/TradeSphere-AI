'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { TrendingUp, PieChart, ShieldCheck, RefreshCw, Sliders, CheckCircle2, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { KNOWN_ASSET_PROFILES } from '../../../../lib/mpt-solver';

const ALL_TICKERS = Object.keys(KNOWN_ASSET_PROFILES);

const ASSET_BUNDLES: Record<string, { label: string; tickers: string[] }> = {
  indo_us: {
    label: 'Indo-US Balanced Core',
    tickers: ['RELIANCE', 'TCS', 'HDFCBANK', 'NVDA', 'AAPL', 'MSFT', 'SPY']
  },
  indian_titans: {
    label: 'Indian Bluechip Titans',
    tickers: ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'BHARTIARTL', 'ITC', 'TATAMOTORS']
  },
  us_tech: {
    label: 'US Tech Alpha',
    tickers: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'QQQ']
  },
  low_vol: {
    label: 'Defensive Minimum Variance',
    tickers: ['ITC', 'TCS', 'HDFCBANK', 'LICI', 'SPY', 'NIFTY50']
  }
};

function PortfolioOptimizerContent() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(ASSET_BUNDLES.indo_us.tickers);
  const [riskFreeRate, setRiskFreeRate] = useState(6.75);
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);

  const handleToggleTicker = (t: string) => {
    if (selectedTickers.includes(t)) {
      if (selectedTickers.length > 2) {
        setSelectedTickers(selectedTickers.filter(item => item !== t));
      }
    } else {
      if (selectedTickers.length < 12) {
        setSelectedTickers([...selectedTickers, t]);
      }
    }
  };

  const handleSelectBundle = (key: string) => {
    if (ASSET_BUNDLES[key]) {
      setSelectedTickers(ASSET_BUNDLES[key].tickers);
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
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
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
                MEAN-VARIANCE SOLVER
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Dirichlet and quadratic optimization calculating Maximum Sharpe and Minimum Variance weights across 23 global assets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0D131A] border border-[#25313D] px-3 py-1.5 rounded-lg">
            <span className="text-[10px] text-[#8B99A8] font-semibold font-mono">Risk-Free Rate:</span>
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
            className="px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
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

      {/* Asset Universe Selector & Bundles */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#25313D] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-[#E7EDF3] uppercase tracking-wider font-mono">
              1. Asset Universe Selection ({selectedTickers.length} Selected)
            </span>
            <span className="text-[10px] text-[#8B99A8]">(Select 2 to 12 Assets)</span>
          </div>

          {/* Quick Bundles */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {Object.entries(ASSET_BUNDLES).map(([key, b]) => (
              <button
                key={key}
                onClick={() => handleSelectBundle(key)}
                className="px-2 py-0.5 rounded bg-[#151F29] hover:bg-[#25313D] border border-[#25313D] text-[10px] text-[#E7EDF3] font-semibold transition-colors whitespace-nowrap"
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticker Badges */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_TICKERS.map((sym) => {
            const isSelected = selectedTickers.includes(sym);
            const prof = KNOWN_ASSET_PROFILES[sym];
            return (
              <button
                key={sym}
                onClick={() => handleToggleTicker(sym)}
                className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#2979FF] text-white border-[#2979FF] shadow-2xs'
                    : 'bg-[#0D131A] text-[#8B99A8] border-[#25313D] hover:border-[#8B99A8]/40 hover:text-[#E7EDF3]'
                }`}
              >
                <span>{sym}</span>
                <span className="text-[9px] font-normal ml-1 opacity-75">
                  {(prof.expectedReturn * 100).toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison: Maximum Sharpe vs Minimum Variance Portfolios */}
      {optResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Max Sharpe Portfolio */}
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#E7EDF3] uppercase tracking-wider font-mono">
                    Tangency / Maximum Sharpe Portfolio
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 text-[9px] font-mono font-bold">
                    OPTIMAL ALPHA
                  </span>
                </div>
                <p className="text-[10px] text-[#8B99A8] mt-0.5">
                  Maximizes expected excess return per unit of total risk (μ - Rf) / σ.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="bg-[#0D131A] p-2 rounded-lg border border-[#25313D]">
                <span className="text-[10px] text-[#8B99A8] block font-sans">Sharpe Ratio</span>
                <span className="text-sm font-bold text-[#35C69A]">{optResult.maxSharpe?.sharpeRatio?.toFixed(2)}</span>
              </div>
              <div className="bg-[#0D131A] p-2 rounded-lg border border-[#25313D]">
                <span className="text-[10px] text-[#8B99A8] block font-sans">Expected Return</span>
                <span className="text-sm font-bold text-[#E7EDF3]">{((optResult.maxSharpe?.expectedReturn || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-[#0D131A] p-2 rounded-lg border border-[#25313D]">
                <span className="text-[10px] text-[#8B99A8] block font-sans">Annual Volatility</span>
                <span className="text-sm font-bold text-[#2979FF]">{((optResult.maxSharpe?.volatility || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Weights List */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="text-[10px] text-[#8B99A8] font-sans font-semibold mb-1">Optimal Weight Breakdown:</div>
              {optResult.maxSharpe?.weights?.map((w: any) => (
                <div key={w.ticker} className="flex items-center justify-between p-2 rounded bg-[#0D131A] border border-[#25313D]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E7EDF3]">{w.ticker}</span>
                    <span className="text-[10px] text-[#8B99A8] font-sans">{KNOWN_ASSET_PROFILES[w.ticker]?.sector || 'Equity'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-[#151F29] h-2 rounded-full overflow-hidden border border-[#25313D]">
                      <div style={{ width: `${(w.weight * 100).toFixed(0)}%` }} className="bg-[#35C69A] h-full" />
                    </div>
                    <span className="font-bold text-[#35C69A] w-12 text-right">{(w.weight * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minimum Variance Portfolio */}
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#E7EDF3] uppercase tracking-wider font-mono">
                    Global Minimum Variance (GMV) Portfolio
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#2979FF]/15 text-[#2979FF] border border-[#2979FF]/30 text-[9px] font-mono font-bold">
                    MINIMUM RISK
                  </span>
                </div>
                <p className="text-[10px] text-[#8B99A8] mt-0.5">
                  Minimizes total portfolio variance w^T Σ w irrespective of expected return.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="bg-[#0D131A] p-2 rounded-lg border border-[#25313D]">
                <span className="text-[10px] text-[#8B99A8] block font-sans">Sharpe Ratio</span>
                <span className="text-sm font-bold text-[#2979FF]">{optResult.minVariance?.sharpeRatio?.toFixed(2)}</span>
              </div>
              <div className="bg-[#0D131A] p-2 rounded-lg border border-[#25313D]">
                <span className="text-[10px] text-[#8B99A8] block font-sans">Expected Return</span>
                <span className="text-sm font-bold text-[#E7EDF3]">{((optResult.minVariance?.expectedReturn || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-[#0D131A] p-2 rounded-lg border border-[#25313D]">
                <span className="text-[10px] text-[#8B99A8] block font-sans">Annual Volatility</span>
                <span className="text-sm font-bold text-[#35C69A]">{((optResult.minVariance?.volatility || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Weights List */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="text-[10px] text-[#8B99A8] font-sans font-semibold mb-1">Defensive Weight Breakdown:</div>
              {optResult.minVariance?.weights?.map((w: any) => (
                <div key={w.ticker} className="flex items-center justify-between p-2 rounded bg-[#0D131A] border border-[#25313D]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E7EDF3]">{w.ticker}</span>
                    <span className="text-[10px] text-[#8B99A8] font-sans">{KNOWN_ASSET_PROFILES[w.ticker]?.sector || 'Equity'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-[#151F29] h-2 rounded-full overflow-hidden border border-[#25313D]">
                      <div style={{ width: `${(w.weight * 100).toFixed(0)}%` }} className="bg-[#2979FF] h-full" />
                    </div>
                    <span className="font-bold text-[#2979FF] w-12 text-right">{(w.weight * 100).toFixed(1)}%</span>
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

export default function PortfolioOptimizerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Markowitz Portfolio Optimizer...</div>}>
      <PortfolioOptimizerContent />
    </Suspense>
  );
}
