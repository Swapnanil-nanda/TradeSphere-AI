'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, PieChart, ShieldCheck, RefreshCw, Sliders, CheckCircle2, 
  ArrowRight, Layers, Sparkles, Activity, BarChart2, DollarSign, Calendar
} from 'lucide-react';
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
    tickers: ['ITC', 'TCS', 'HDFCBANK', 'LICI', 'SPY', 'NIFTY 50']
  }
};

function PortfolioOptimizerContent() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(ASSET_BUNDLES.indo_us.tickers);
  const [riskFreeRate, setRiskFreeRate] = useState(6.75);
  const [loading, setLoading] = useState(false);
  const [optResult, setOptResult] = useState<any>(null);

  // Monte Carlo Wealth Simulation Controls (simulation_engine.py equivalent)
  const [initialCapital, setInitialCapital] = useState(500000);
  const [monthlySIP, setMonthlySIP] = useState(25000);
  const [years, setYears] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Expected Return and Volatility from Max Sharpe Portfolio
  const expectedAnnualReturn = optResult?.maxSharpe?.expectedReturn ?? 0.165;
  const annualVolatility = optResult?.maxSharpe?.volatility ?? 0.178;

  // Path-Based Monte Carlo Wealth Simulation Engine (500 Stochastic Paths with Monthly SIP)
  const monteCarloData = useMemo(() => {
    const numPaths = 400;
    const months = years * 12;
    const dt = 1 / 12;
    const mu = expectedAnnualReturn;
    const sigma = annualVolatility;

    const allMonthValues: number[][] = [];
    for (let m = 0; m <= months; m++) {
      allMonthValues.push([]);
    }

    let worstDrawdown = 0;
    const terminalValues: number[] = [];
    const totalInvested = initialCapital + (monthlySIP * months);

    for (let p = 0; p < numPaths; p++) {
      let currentWealth = initialCapital;
      allMonthValues[0].push(currentWealth);

      let peak = currentWealth;
      let pathWorstDd = 0;

      for (let m = 1; m <= months; m++) {
        // Box-Muller normal standard shock
        const u1 = Math.max(1e-7, Math.random());
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // Add monthly contribution at beginning of month
        const wealthWithSIP = currentWealth + monthlySIP;

        // Geometric Brownian Motion step
        const drift = (mu - 0.5 * sigma * sigma) * dt;
        const diffusion = sigma * Math.sqrt(dt) * z;
        currentWealth = wealthWithSIP * Math.exp(drift + diffusion);
        allMonthValues[m].push(currentWealth);

        if (currentWealth > peak) peak = currentWealth;
        const dd = (peak - currentWealth) / peak;
        if (dd > pathWorstDd) pathWorstDd = dd;
      }

      terminalValues.push(currentWealth);
      if (pathWorstDd > worstDrawdown) worstDrawdown = pathWorstDd;
    }

    // Compute percentile cones at each monthly step
    const p10Cone: number[] = [];
    const p50Cone: number[] = [];
    const p90Cone: number[] = [];

    for (let m = 0; m <= months; m++) {
      const sorted = [...allMonthValues[m]].sort((a, b) => a - b);
      p10Cone.push(sorted[Math.floor(numPaths * 0.10)]);
      p50Cone.push(sorted[Math.floor(numPaths * 0.50)]);
      p90Cone.push(sorted[Math.floor(numPaths * 0.90)]);
    }

    terminalValues.sort((a, b) => a - b);
    const terminalP10 = p10Cone[p10Cone.length - 1];
    const terminalP50 = p50Cone[p50Cone.length - 1];
    const terminalP90 = p90Cone[p90Cone.length - 1];

    const lossCount = terminalValues.filter(v => v < totalInvested).length;
    const probabilityOfLoss = Math.round((lossCount / numPaths) * 1000) / 10;
    const wealthGain = Math.round(terminalP50 - totalInvested);

    return {
      months,
      totalInvested,
      p10Cone,
      p50Cone,
      p90Cone,
      terminalP10,
      terminalP50,
      terminalP90,
      probabilityOfLoss,
      empiricalMaxDrawdown: Math.round(worstDrawdown * 1000) / 10,
      wealthGain
    };
  }, [years, initialCapital, monthlySIP, expectedAnnualReturn, annualVolatility]);

  // Render Monte Carlo Fan Chart Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !monteCarloData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 700;
    const height = 300;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const margin = { top: 20, right: 35, bottom: 35, left: 75 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const maxVal = Math.max(...monteCarloData.p90Cone) * 1.08;
    const minVal = Math.max(0, Math.min(...monteCarloData.p10Cone) * 0.85);

    const getX = (stepIndex: number) => margin.left + (stepIndex / monteCarloData.months) * plotWidth;
    const getY = (val: number) => margin.top + plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight;

    // Draw Background Grid
    ctx.strokeStyle = 'rgba(37, 49, 61, 0.45)';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let r = 0; r <= gridRows; r++) {
      const y = margin.top + (plotHeight / gridRows) * r;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();

      const valLabel = maxVal - (r / gridRows) * (maxVal - minVal);
      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px Inter, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${(valLabel / 100000).toFixed(1)}L`, margin.left - 8, y + 3);
    }

    // Draw Months X-Axis Labels
    const yearSteps = years;
    for (let yIdx = 0; yIdx <= yearSteps; yIdx++) {
      const stepIdx = yIdx * 12;
      const x = getX(stepIdx);
      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px Inter, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(yIdx === 0 ? 'Start' : `Yr ${yIdx}`, x, margin.top + plotHeight + 18);
    }

    // 1. Shaded Cone between 10th and 90th percentiles
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(monteCarloData.p90Cone[0]));
    for (let i = 1; i <= monteCarloData.months; i++) {
      ctx.lineTo(getX(i), getY(monteCarloData.p90Cone[i]));
    }
    for (let i = monteCarloData.months; i >= 0; i--) {
      ctx.lineTo(getX(i), getY(monteCarloData.p10Cone[i]));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(41, 121, 255, 0.12)';
    ctx.fill();

    // 2. 90th Percentile Curve (Optimistic Alpha - Green)
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(monteCarloData.p90Cone[0]));
    for (let i = 1; i <= monteCarloData.months; i++) {
      ctx.lineTo(getX(i), getY(monteCarloData.p90Cone[i]));
    }
    ctx.strokeStyle = '#35C69A';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. 50th Percentile Curve (Median Expected - Blue)
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(monteCarloData.p50Cone[0]));
    for (let i = 1; i <= monteCarloData.months; i++) {
      ctx.lineTo(getX(i), getY(monteCarloData.p50Cone[i]));
    }
    ctx.strokeStyle = '#2979FF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. 10th Percentile Curve (Bearish Floor - Amber)
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(monteCarloData.p10Cone[0]));
    for (let i = 1; i <= monteCarloData.months; i++) {
      ctx.lineTo(getX(i), getY(monteCarloData.p10Cone[i]));
    }
    ctx.strokeStyle = '#D8AB5E';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Total Invested Capital Baseline (Dashed White)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(getX(0), getY(initialCapital));
    ctx.lineTo(getX(monteCarloData.months), getY(monteCarloData.totalInvested));
    ctx.strokeStyle = '#E7EDF3';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }, [monteCarloData, years]);

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
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#090D12] text-[#2979FF] border border-[#25313D]">
                MONTE CARLO CONES
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Dirichlet and quadratic optimization calculating Maximum Sharpe, CAL curve, and stochastic Monte Carlo wealth projections.
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

      {/* INTERACTIVE MONTE CARLO WEALTH CONE (simulation_engine.py equivalent) */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#25313D] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#E7EDF3] font-mono">
                Monte Carlo Wealth Projection Cones (Stochastic GBM + SIP)
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                10th / 50th / 90th PERCENTILES
              </span>
            </div>
            <p className="text-[11px] text-[#8B99A8] mt-0.5">
              Simulates 400 empirical paths using optimal Max Sharpe μ ({((expectedAnnualReturn) * 100).toFixed(1)}%) &amp; σ ({((annualVolatility) * 100).toFixed(1)}%) with monthly step compounding.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="p-1.5 rounded bg-[#0D131A] border border-[#25313D]">
              Loss Prob: <strong className={monteCarloData.probabilityOfLoss > 5 ? 'text-amber-400' : 'text-emerald-400'}>{monteCarloData.probabilityOfLoss}%</strong>
            </span>
            <span className="p-1.5 rounded bg-[#0D131A] border border-[#25313D]">
              Max DD: <strong className="text-rose-400">{monteCarloData.empiricalMaxDrawdown}%</strong>
            </span>
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0D131A] p-3 rounded-lg border border-[#25313D]">
          {/* Initial Capital */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8B99A8]">Initial Lumpsum:</span>
              <span className="text-white font-bold">₹{initialCapital.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="5000000"
              step="50000"
              value={initialCapital}
              onChange={e => setInitialCapital(Number(e.target.value))}
              className="w-full accent-[#2979FF] cursor-pointer"
            />
          </div>

          {/* Monthly SIP */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8B99A8]">Monthly SIP Contribution:</span>
              <span className="text-white font-bold">₹{monthlySIP.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              value={monthlySIP}
              onChange={e => setMonthlySIP(Number(e.target.value))}
              className="w-full accent-[#35C69A] cursor-pointer"
            />
          </div>

          {/* Horizon (1-5 Years) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8B99A8]">Time Horizon:</span>
              <span className="text-white font-bold">{years} Years ({years * 12} Months)</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={years}
              onChange={e => setYears(Number(e.target.value))}
              className="w-full accent-[#D8AB5E] cursor-pointer"
            />
          </div>
        </div>

        {/* Canvas Fan Chart Container */}
        <div className="w-full bg-[#0D131A] rounded-lg border border-[#25313D] p-3 overflow-hidden">
          <canvas ref={canvasRef} className="w-full block" />

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-[#25313D]/60 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#35C69A] rounded-full" />
              <span className="text-slate-300">90th Percentile (Optimistic Bull): ₹{(monteCarloData.terminalP90 / 100000).toFixed(2)}L</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 bg-[#2979FF] rounded-full" />
              <span className="text-white font-bold">50th Median (Expected Path): ₹{(monteCarloData.terminalP50 / 100000).toFixed(2)}L</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#D8AB5E] rounded-full" />
              <span className="text-slate-300">10th Percentile (Conservative Bear): ₹{(monteCarloData.terminalP10 / 100000).toFixed(2)}L</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-[#E7EDF3]" />
              <span className="text-[#8B99A8]">Total Capital Invested: ₹{(monteCarloData.totalInvested / 100000).toFixed(2)}L</span>
            </div>
          </div>
        </div>

        {/* Wealth Outcome Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
          <div className="bg-[#0D131A] p-2.5 rounded-lg border border-[#25313D]">
            <span className="text-[10px] text-[#8B99A8] block font-sans">Total Invested</span>
            <span className="text-sm font-bold text-white">₹{(monteCarloData.totalInvested).toLocaleString()}</span>
          </div>
          <div className="bg-[#0D131A] p-2.5 rounded-lg border border-[#25313D]">
            <span className="text-[10px] text-[#8B99A8] block font-sans">Median Corpus (50th)</span>
            <span className="text-sm font-bold text-[#2979FF]">₹{Math.round(monteCarloData.terminalP50).toLocaleString()}</span>
          </div>
          <div className="bg-[#0D131A] p-2.5 rounded-lg border border-[#25313D]">
            <span className="text-[10px] text-[#8B99A8] block font-sans">Net Wealth Gain</span>
            <span className={`text-sm font-bold ${monteCarloData.wealthGain >= 0 ? 'text-[#35C69A]' : 'text-rose-400'}`}>
              {monteCarloData.wealthGain >= 0 ? '+' : ''}₹{(monteCarloData.wealthGain).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#0D131A] p-2.5 rounded-lg border border-[#25313D]">
            <span className="text-[10px] text-[#8B99A8] block font-sans">Empirical Max Drawdown</span>
            <span className="text-sm font-bold text-rose-400">{monteCarloData.empiricalMaxDrawdown}%</span>
          </div>
        </div>
      </div>
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
