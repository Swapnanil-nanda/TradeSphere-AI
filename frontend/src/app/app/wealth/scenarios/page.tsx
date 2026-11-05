'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Target, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, HeartHandshake, RefreshCw, BarChart2, Sparkles, Activity } from 'lucide-react';
import { KNOWN_ASSET_PROFILES } from '../../../../lib/mpt-solver';
import { apiClient, Ticker } from '../../../../lib/api-client';

const ALL_ASSETS = Object.keys(KNOWN_ASSET_PROFILES);

interface ScenarioGoal {
  id: string;
  name: string;
  targetAmount: number;
  years: number;
  desc: string;
}

const PRESET_GOALS: ScenarioGoal[] = [
  {
    id: 'fire',
    name: 'Financial Independence (F.I.R.E)',
    targetAmount: 50000000,
    years: 15,
    desc: 'Build a perpetual passive income corpus allowing early retirement at a safe 4% withdrawal rate.'
  },
  {
    id: 'home',
    name: 'Prime Real Estate Down Payment',
    targetAmount: 15000000,
    years: 7,
    desc: 'Accumulate a debt-free equity buffer for property acquisition without liquidating emergency funds.'
  },
  {
    id: 'education',
    name: 'Global Higher Education Fund',
    targetAmount: 20000000,
    years: 10,
    desc: 'Hedge against international tuition inflation and foreign exchange depreciation.'
  },
  {
    id: 'ten_cr',
    name: '₹10 Crore ($1.2M) Wealth Milestone',
    targetAmount: 100000000,
    years: 20,
    desc: 'Institutional-scale long-term equity compounding achieving eight-figure net-worth milestone.'
  }
];

function WealthScenariosContent() {
  const searchParams = useSearchParams();
  const initialSym = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSym);
  const [selectedGoal, setSelectedGoal] = useState<string>('fire');
  const [years, setYears] = useState(5);
  const [initialCapital, setInitialCapital] = useState(1000000);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [simulating, setSimulating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  useEffect(() => {
    apiClient.getTickers().then(list => {
      if (Array.isArray(list) && list.length > 0) {
        setTickers(list);
      }
    }).catch(() => {});
  }, []);

  const activeProfile = KNOWN_ASSET_PROFILES[symbol] || {
    name: symbol,
    expectedReturn: 0.16,
    volatility: 0.20,
    sector: 'General Equity',
    beta: 1.0
  };

  const activeTicker = tickers.find(t => t.symbol === symbol);
  const spotPrice = Number(activeTicker?.ltp ?? (symbol.includes('NIFTY') ? 24350 : symbol === 'AAPL' ? 234 : 1500));
  const isUS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'].includes(symbol);
  const curr = isUS ? '$' : '₹';

  // Monte Carlo Simulation Engine (500 Stochastic Paths)
  const simulationResults = useMemo(() => {
    const numPaths = 350;
    const stepsPerYear = 12; // Monthly steps
    const totalSteps = years * stepsPerYear;
    const dt = 1 / stepsPerYear;

    const mu = activeProfile.expectedReturn;
    const sigma = activeProfile.volatility;

    const allPaths: number[][] = [];
    const terminalValues: number[] = [];
    let worstDrawdown = 0;

    for (let p = 0; p < numPaths; p++) {
      const path: number[] = [initialCapital];
      let currentVal = initialCapital;
      let pathPeak = initialCapital;
      let pathWorstDd = 0;

      for (let s = 1; s <= totalSteps; s++) {
        // Box-Muller transform for normal distribution
        const u1 = Math.max(1e-7, Math.random());
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

        // Geometric Brownian Motion formula
        const drift = (mu - 0.5 * sigma * sigma) * dt;
        const diffusion = sigma * Math.sqrt(dt) * z;
        currentVal *= Math.exp(drift + diffusion);
        path.push(currentVal);

        if (currentVal > pathPeak) pathPeak = currentVal;
        const dd = (pathPeak - currentVal) / pathPeak;
        if (dd > pathWorstDd) pathWorstDd = dd;
      }

      allPaths.push(path);
      terminalValues.push(currentVal);
      if (pathWorstDd > worstDrawdown) worstDrawdown = pathWorstDd;
    }

    terminalValues.sort((a, b) => a - b);
    const p5 = terminalValues[Math.floor(numPaths * 0.05)];
    const p50 = terminalValues[Math.floor(numPaths * 0.50)];
    const p95 = terminalValues[Math.floor(numPaths * 0.95)];

    const positivePaths = terminalValues.filter(v => v > initialCapital).length;
    const winProbabilityPct = Number(((positivePaths / numPaths) * 100).toFixed(1));

    // Goal probability
    const activePreset = PRESET_GOALS.find(g => g.id === selectedGoal);
    const goalTarget = activePreset?.targetAmount || 50000000;
    const pathsReachedGoal = terminalValues.filter(v => v >= goalTarget).length;
    const goalProbabilityPct = Number(((pathsReachedGoal / numPaths) * 100).toFixed(1));

    return {
      numPaths,
      totalSteps,
      allPaths,
      p5: Math.round(p5),
      p50: Math.round(p50),
      p95: Math.round(p95),
      winProbabilityPct,
      goalProbabilityPct,
      empiricalMaxDrawdownPct: Number((worstDrawdown * 100).toFixed(1)),
      terminalGainMedian: Math.round(p50 - initialCapital)
    };
  }, [symbol, years, initialCapital, activeProfile, selectedGoal]);

  // Render Monte Carlo Fan Chart Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simulationResults) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 340;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const margin = { top: 25, right: 35, bottom: 35, left: 65 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const minY = simulationResults.p5 * 0.85;
    const maxY = simulationResults.p95 * 1.15;
    const rangeY = maxY - minY || 1;

    const totalSteps = simulationResults.totalSteps;
    const getX = (step: number) => margin.left + (step / totalSteps) * plotWidth;
    const getY = (val: number) => margin.top + plotHeight - ((val - minY) / rangeY) * plotHeight;

    // Grid Lines
    ctx.strokeStyle = '#25313D';
    ctx.lineWidth = 1;

    // X-axis steps
    for (let y = 1; y <= years; y++) {
      const step = y * 12;
      const x = getX(step);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();

      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Year ${y}`, x, height - margin.bottom + 16);
    }

    // Y-axis grid
    for (let i = 0; i <= 4; i++) {
      const val = minY + (rangeY / 4) * i;
      const y = getY(val);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();

      ctx.fillStyle = '#8B99A8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${curr}${(val / 1000).toFixed(0)}k`, margin.left - 8, y + 3);
    }

    // Draw individual translucent paths (Sample 40 paths for clarity)
    const sampled = simulationResults.allPaths.slice(0, 45);
    sampled.forEach(path => {
      ctx.beginPath();
      path.forEach((val, step) => {
        const x = getX(step);
        const y = getY(val);
        if (step === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(41, 121, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 95th Percentile Upper Envelope Line (Green)
    const p95Steps = Array.from({ length: totalSteps + 1 }, (_, step) => {
      const vals = simulationResults.allPaths.map(p => p[step]).sort((a, b) => a - b);
      return vals[Math.floor(vals.length * 0.95)];
    });

    ctx.beginPath();
    p95Steps.forEach((v, s) => {
      const x = getX(s);
      const y = getY(v);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#35C69A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 50th Percentile Median Path (Blue)
    const p50Steps = Array.from({ length: totalSteps + 1 }, (_, step) => {
      const vals = simulationResults.allPaths.map(p => p[step]).sort((a, b) => a - b);
      return vals[Math.floor(vals.length * 0.50)];
    });

    ctx.beginPath();
    p50Steps.forEach((v, s) => {
      const x = getX(s);
      const y = getY(v);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#2979FF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 5th Percentile Lower Envelope Line (Red)
    const p5Steps = Array.from({ length: totalSteps + 1 }, (_, step) => {
      const vals = simulationResults.allPaths.map(p => p[step]).sort((a, b) => a - b);
      return vals[Math.floor(vals.length * 0.05)];
    });

    ctx.beginPath();
    p5Steps.forEach((v, s) => {
      const x = getX(s);
      const y = getY(v);
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#EF6468';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [simulationResults, years, curr]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Monte-Carlo Stochastic Scenario Modeler</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                350-PATH GBM FAN SIMULATION
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Path-based Geometric Brownian Motion simulation projecting 5th, 50th, and 95th percentile wealth outcomes for any stock.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-[#151F29] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-[#E7EDF3] focus:outline-none focus:border-[#2979FF]"
          >
            {ALL_ASSETS.map(s => <option key={s} value={s}>{s} ({KNOWN_ASSET_PROFILES[s]?.name})</option>)}
          </select>
        </div>
      </div>

      {/* Preset Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PRESET_GOALS.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setSelectedGoal(p.id);
              setYears(p.years);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedGoal === p.id
                ? 'bg-[#151F29] border-[#2979FF] shadow-2xs'
                : 'bg-[#111922] border-[#25313D] hover:border-[#8B99A8]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-[#E7EDF3]">{p.name}</span>
              {selectedGoal === p.id && <span className="w-2 h-2 rounded-full bg-[#2979FF]" />}
            </div>
            <p className="text-[11px] text-[#8B99A8] line-clamp-2 leading-relaxed">{p.desc}</p>
            <div className="mt-2 pt-2 border-t border-[#25313D] flex items-center justify-between font-mono text-[10px]">
              <span className="text-[#8B99A8]">{p.years}Y Horizon</span>
              <span className="text-[#35C69A] font-bold">Target: {curr}{(p.targetAmount / (isUS ? 1000 : 10000000)).toFixed(1)}{isUS ? 'k' : ' Cr'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Parameter Controls Bar */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8B99A8]">Horizon:</span>
            <div className="flex items-center gap-1">
              {[3, 5, 10, 15, 20].map(y => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    years === y
                      ? 'bg-[#2979FF] text-white font-bold'
                      : 'bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] border border-[#25313D]'
                  }`}
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-[11px] text-[#8B99A8] font-sans">Initial Capital:</span>
            <input
              type="number"
              step="50000"
              value={initialCapital}
              onChange={e => setInitialCapital(Math.max(1000, parseInt(e.target.value, 10) || 1000))}
              className="bg-[#0D131A] border border-[#25313D] rounded px-2 py-0.5 text-xs text-[#E7EDF3] w-28 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div>
            <span className="text-[#8B99A8]">Expected Drift (μ): </span>
            <span className="text-[#35C69A] font-bold">{(activeProfile.expectedReturn * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-[#8B99A8]">Volatility (σ): </span>
            <span className="text-[#2979FF] font-bold">{(activeProfile.volatility * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Headline Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">50th Percentile (Central Median)</div>
          <div className="text-base font-bold text-[#2979FF] mt-0.5">
            {curr}{simulationResults.p50.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#35C69A] mt-1 font-sans">
            Gain: +{curr}{simulationResults.terminalGainMedian.toLocaleString()}
          </div>
        </div>

        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">95th Percentile (Bull Case)</div>
          <div className="text-base font-bold text-[#35C69A] mt-0.5">
            {curr}{simulationResults.p95.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
            Upper tail stochastic trajectory
          </div>
        </div>

        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">5th Percentile (Market Shock)</div>
          <div className="text-base font-bold text-[#EF6468] mt-0.5">
            {curr}{simulationResults.p5.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
            Lower tail stress scenario
          </div>
        </div>

        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">Empirical Path Max DD</div>
          <div className="text-base font-bold text-amber-400 mt-0.5">
            -{simulationResults.empiricalMaxDrawdownPct}%
          </div>
          <div className="text-[10px] text-[#35C69A] mt-1 font-sans">
            Prob of Profit: {simulationResults.winProbabilityPct}%
          </div>
        </div>
      </div>

      {/* Fan Chart Canvas Container */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2979FF]" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono text-[#E7EDF3]">
              {symbol} Monte Carlo Path Dispersion Fan (350 Simulated Paths • {years} Years)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#35C69A]" />
              <span className="text-[#35C69A]">95% Bull Envelope</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#2979FF]" />
              <span className="text-[#2979FF]">50% Median Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#EF6468]" />
              <span className="text-[#EF6468]">5% Bear Floor</span>
            </div>
          </div>
        </div>

        <div className="w-full h-80 relative bg-[#0D131A] rounded-lg border border-[#25313D] overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>
    </div>
  );
}

export default function WealthScenariosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Monte-Carlo Scenarios...</div>}>
      <WealthScenariosContent />
    </Suspense>
  );
}
