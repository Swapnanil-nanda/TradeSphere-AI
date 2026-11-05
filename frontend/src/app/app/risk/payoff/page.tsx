'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, Layers, Percent, ShieldCheck, Activity,
  ArrowUpRight, Sliders, RefreshCw, CheckCircle2, ArrowRight
} from 'lucide-react';
import { apiClient, Ticker } from '../../../../lib/api-client';
import {
  ALL_RISK_SYMBOLS,
  RISK_UNIVERSE_ASSETS,
  StrategyArchetype,
  modelOptionsPayoff
} from '../../../../lib/options-risk-engine';

function PayoffContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [strategy, setStrategy] = useState<StrategyArchetype>('BULL_CALL_SPREAD');
  const [spotPrice, setSpotPrice] = useState(2985.4);
  const [strike1, setStrike1] = useState(2960);
  const [strike2, setStrike2] = useState(3020);
  const [netDebit, setNetDebit] = useState(35);
  const [lotSize, setLotSize] = useState(250);
  const [ivPct, setIvPct] = useState(20);
  const [dte, setDte] = useState(14);
  const [showT0Curve, setShowT0Curve] = useState(true);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol && RISK_UNIVERSE_ASSETS[sym]) {
      setSymbol(sym);
    }
  }, [searchParams]);

  const meta = RISK_UNIVERSE_ASSETS[symbol] || RISK_UNIVERSE_ASSETS['RELIANCE'];
  const isUS = meta.market === 'US';
  const curr = isUS ? '$' : '₹';

  // Auto-sync spot price and strikes when symbol changes
  useEffect(() => {
    apiClient.getTickers().then(list => {
      const found = list.find(t => t.symbol === symbol);
      const p = found && found.ltp ? Number(found.ltp) : meta.basePrice;
      const roundedP = Math.round(p * 10) / 10;
      setSpotPrice(roundedP);

      const interval = meta.strikeInterval || (p > 1000 ? 50 : 5);
      const atm = Math.round(p / interval) * interval;
      setStrike1(atm);
      setStrike2(atm + interval);
      setLotSize(meta.lotSize);
      setIvPct(Math.round(meta.baseIV * 100));

      // Calculate initial debit
      const deb = Math.max(0.5, Math.round(p * 0.015 * 10) / 10);
      setNetDebit(deb);
    }).catch(() => {
      setSpotPrice(meta.basePrice);
    });
  }, [symbol, meta]);

  // Model payoff curves and net Greeks dynamically
  const payoffModel = useMemo(() => {
    return modelOptionsPayoff(strategy, symbol, spotPrice, {
      strike1,
      strike2,
      netPremium: netDebit,
      lotSize,
      dte,
      iv: ivPct
    });
  }, [strategy, symbol, spotPrice, strike1, strike2, netDebit, lotSize, dte, ivPct]);

  // Coordinate transforms for SVG Chart
  const minPrice = payoffModel.minPrice;
  const maxPrice = payoffModel.maxPrice;
  const points = payoffModel.points;

  const minPnl = Math.min(...points.map(p => p.pnlExpiration));
  const maxPnl = Math.max(...points.map(p => p.pnlExpiration));
  const pnlRange = Math.max(1000, maxPnl - minPnl);
  const svgHeight = 220;
  const svgWidth = 600;

  // Zero PnL Reference Line Y Coordinate
  const zeroY = Math.max(20, Math.min(svgHeight - 20, (svgHeight - 40) - ((0 - minPnl) / pnlRange) * (svgHeight - 60) + 20));

  // Expiration Path
  const expiryPathD = points.map((pt, i) => {
    const x = ((pt.price - minPrice) / (maxPrice - minPrice)) * (svgWidth - 60) + 30;
    const y = (svgHeight - 40) - ((pt.pnlExpiration - minPnl) / pnlRange) * (svgHeight - 60) + 20;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  // T+0 Curve Path
  const t0PathD = points.map((pt, i) => {
    const x = ((pt.price - minPrice) / (maxPrice - minPrice)) * (svgWidth - 60) + 30;
    const y = (svgHeight - 40) - ((pt.pnlT0 - minPnl) / pnlRange) * (svgHeight - 60) + 20;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const spotX = Math.max(30, Math.min(svgWidth - 30, ((spotPrice - minPrice) / (maxPrice - minPrice)) * (svgWidth - 60) + 30));

  return (
    <div className="space-y-4 select-none pb-10 text-xs text-[#E7EDF3] max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-4 rounded-xl border border-[#25313D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white font-sans">
                Options Strategy Payoff &amp; Greeks Modeler
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                MULTI-LEG GEOMETRY
              </span>
            </div>
            <p className="text-[#8B99A8] text-xs">
              Simulate expiration profit/loss curves, T+0 Greeks, breakeven zones, and probability of profit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs focus:outline-none focus:border-[#2979FF]"
          >
            <optgroup label="Indian Benchmark Indices (NSE)">
              {ALL_RISK_SYMBOLS.filter(s => s.includes('NIFTY')).map(s => (
                <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
              ))}
            </optgroup>
            <optgroup label="Top Indian Equities (NSE)">
              {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'IN' && !s.includes('NIFTY')).map(s => (
                <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
              ))}
            </optgroup>
            <optgroup label="US Equities &amp; ETFs (NASDAQ/NYSE)">
              {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'US').map(s => (
                <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
              ))}
            </optgroup>
          </select>

          <Link
            href={`/app/risk/options?symbol=${symbol}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25313D] bg-[#111922] hover:bg-[#151F29] text-[#2979FF] font-semibold transition-colors"
          >
            <span>Chain</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Strategy Archetype Picker */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] text-[#8B99A8] mr-1.5 font-mono">Archetype:</span>
        {[
          { id: 'BULL_CALL_SPREAD', name: 'Bull Call Spread' },
          { id: 'BEAR_PUT_SPREAD', name: 'Bear Put Spread' },
          { id: 'LONG_CALL', name: 'Long Call' },
          { id: 'LONG_PUT', name: 'Long Put' },
          { id: 'LONG_STRADDLE', name: 'Long Straddle' },
          { id: 'IRON_CONDOR', name: 'Iron Condor' },
          { id: 'COVERED_CALL', name: 'Covered Call' },
          { id: 'IRON_BUTTERFLY', name: 'Iron Butterfly' }
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id as StrategyArchetype)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              strategy === s.id
                ? 'bg-[#2979FF] text-white shadow-xs font-bold'
                : 'bg-[#0D131A] text-[#8B99A8] hover:text-white border border-[#25313D]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Payoff Chart & Parameter Sliders */}
        <div className="lg:col-span-2 bg-[#111922] p-4 rounded-xl border border-[#25313D] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Expiration PnL &amp; T+0 Horizon Profile
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-[#35C69A] font-bold">● At Expiration</span>
              <button
                onClick={() => setShowT0Curve(!showT0Curve)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                  showT0Curve ? 'border-[#2979FF] text-[#2979FF] bg-[#2979FF]/10' : 'border-[#25313D] text-[#8B99A8]'
                }`}
              >
                <span>● T+0 Curve</span>
              </button>
            </div>
          </div>

          {/* SVG Payoff Curve Container */}
          <div className="w-full bg-[#090D12] rounded-xl border border-[#25313D] p-3 relative overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64">
              {/* Zero PnL Reference Line */}
              <line
                x1="20"
                y1={zeroY}
                x2={svgWidth - 20}
                y2={zeroY}
                stroke="#25313D"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x="26" y={zeroY - 6} fill="#8B99A8" fontSize="9" fontFamily="monospace">
                {curr}0 Breakeven
              </text>

              {/* Spot Price Reference Line */}
              <line
                x1={spotX}
                y1="10"
                x2={spotX}
                y2={svgHeight - 30}
                stroke="#2979FF"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <text x={spotX + 5} y="22" fill="#2979FF" fontSize="9" fontFamily="monospace" fontWeight="bold">
                Spot: {curr}{spotPrice.toFixed(1)}
              </text>

              {/* T+0 Curve */}
              {showT0Curve && (
                <path
                  d={t0PathD}
                  fill="none"
                  stroke="#2979FF"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
              )}

              {/* Expiration Curve */}
              <path
                d={expiryPathD}
                fill="none"
                stroke={strategy.includes('PUT') ? '#EF6468' : '#35C69A'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Price Scale Markers */}
            <div className="flex justify-between text-[10px] text-[#8B99A8] font-mono px-4 pt-1">
              <span>{curr}{minPrice.toFixed(0)}</span>
              <span>{curr}{((minPrice + spotPrice) / 2).toFixed(0)}</span>
              <span className="text-[#2979FF] font-bold">{curr}{spotPrice.toFixed(1)} (LTP)</span>
              <span>{curr}{((spotPrice + maxPrice) / 2).toFixed(0)}</span>
              <span>{curr}{maxPrice.toFixed(0)}</span>
            </div>
          </div>

          {/* Interactive Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
            <div>
              <label className="text-[10px] text-[#8B99A8] block font-sans mb-1">Spot Price ({curr})</label>
              <input
                type="number"
                step="any"
                value={spotPrice}
                onChange={e => setSpotPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-white font-bold focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8B99A8] block font-sans mb-1">Lower Strike ({curr})</label>
              <input
                type="number"
                step="any"
                value={strike1}
                onChange={e => setStrike1(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-white font-bold focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8B99A8] block font-sans mb-1">Upper Strike ({curr})</label>
              <input
                type="number"
                step="any"
                value={strike2}
                onChange={e => setStrike2(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-white font-bold focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8B99A8] block font-sans mb-1">Net Premium ({curr}/unit)</label>
              <input
                type="number"
                step="any"
                value={netDebit}
                onChange={e => setNetDebit(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#D8AB5E] font-bold focus:outline-none focus:border-[#D8AB5E]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Strategy Risk & Greeks Blotter */}
        <div className="space-y-4">
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-[#25313D]">
              Geometry &amp; Risk Metrics
            </h3>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] font-sans">Max Potential Profit:</span>
                <span className="font-bold text-[#35C69A]">
                  {payoffModel.isProfitCapped ? `+${curr}${payoffModel.maxProfit.toLocaleString()}` : 'Unlimited (∞)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] font-sans">Max Defined Loss:</span>
                <span className="font-bold text-[#EF6468]">
                  {payoffModel.isLossCapped ? `-${curr}${Math.abs(payoffModel.maxLoss).toLocaleString()}` : 'Unlimited (∞)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] font-sans">Risk / Reward Ratio:</span>
                <span className="font-bold text-white">{payoffModel.riskRewardRatio}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] font-sans">Probability of Profit (POP):</span>
                <span className="font-bold text-[#2979FF]">{payoffModel.probabilityOfProfitPct}%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] font-sans">Breakeven Price(s):</span>
                <span className="font-bold text-[#D8AB5E]">
                  {payoffModel.breakevens.map(b => `${curr}${b.toFixed(2)}`).join(', ')}
                </span>
              </div>
            </div>

            {/* Dynamic Net Greeks Summary */}
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono pt-2">
              Theoretical Net Greeks
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px] font-sans">Net Delta (Δ)</span>
                <span className={`font-bold ${payoffModel.netGreeks.delta >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                  {payoffModel.netGreeks.delta >= 0 ? '+' : ''}{payoffModel.netGreeks.delta.toFixed(3)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px] font-sans">Net Gamma (Γ)</span>
                <span className="font-bold text-[#2979FF]">
                  +{payoffModel.netGreeks.gamma.toFixed(4)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px] font-sans">Net Theta (Θ)</span>
                <span className={`font-bold ${payoffModel.netGreeks.theta >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                  {curr}{payoffModel.netGreeks.theta.toFixed(1)}/day
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[#8B99A8] block text-[10px] font-sans">Net Vega (ν)</span>
                <span className="font-bold text-[#D8AB5E]">
                  {curr}{payoffModel.netGreeks.vega.toFixed(1)}/1%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111922] border border-[#25313D] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#35C69A] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#8B99A8] font-sans leading-relaxed">
              <strong className="text-white">Rule A Multi-Leg Invariant:</strong> Maximum potential loss for the combined strategy ({curr}{Math.abs(payoffModel.maxLoss).toLocaleString()}) cannot exceed the 1.0% account equity cap.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OptionsPayoffPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Options Payoff Modeler...</div>}>
      <PayoffContent />
    </Suspense>
  );
}
