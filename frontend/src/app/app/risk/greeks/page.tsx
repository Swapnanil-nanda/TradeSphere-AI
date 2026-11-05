'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Percent, Calculator, Activity, ShieldCheck, RefreshCw,
  ArrowRight, Layers, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, Ticker } from '../../../../lib/api-client';
import {
  ALL_RISK_SYMBOLS,
  RISK_UNIVERSE_ASSETS,
  blackScholes
} from '../../../../lib/options-risk-engine';

function GreeksContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [spotPrice, setSpotPrice] = useState(2985.4);
  const [strikePrice, setStrikePrice] = useState(3000.0);
  const [daysToExpiry, setDaysToExpiry] = useState(14);
  const [volatilityPct, setVolatilityPct] = useState(20.0);
  const [riskFreePct, setRiskFreePct] = useState(6.5);
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol && RISK_UNIVERSE_ASSETS[sym]) {
      setSymbol(sym);
    }
  }, [searchParams]);

  const meta = RISK_UNIVERSE_ASSETS[symbol] || RISK_UNIVERSE_ASSETS['RELIANCE'];
  const isUS = meta.market === 'US';
  const curr = isUS ? '$' : '₹';

  // Fetch actual live spot price when symbol changes
  useEffect(() => {
    apiClient.getTickers().then(list => {
      const found = list.find(t => t.symbol === symbol);
      const p = found && found.ltp ? Number(found.ltp) : meta.basePrice;
      setSpotPrice(Math.round(p * 100) / 100);

      const interval = meta.strikeInterval || (p > 1000 ? 50 : 5);
      const center = Math.round(p / interval) * interval;
      setStrikePrice(center);
      setVolatilityPct(Math.round(meta.baseIV * 1000) / 10);
      setRiskFreePct(meta.riskFreeRate * 100);
    }).catch(() => {
      setSpotPrice(meta.basePrice);
      setStrikePrice(meta.basePrice);
    });
  }, [symbol, meta]);

  // Exact Black-Scholes Calculation via quantitative engine
  const bsResult = useMemo(() => {
    return blackScholes({
      spot: spotPrice,
      strike: strikePrice,
      timeYears: Math.max(0.001, daysToExpiry / 365),
      rate: riskFreePct / 100,
      vol: volatilityPct / 100,
      type: optionType
    });
  }, [spotPrice, strikePrice, daysToExpiry, riskFreePct, volatilityPct, optionType]);

  const moneynessPct = strikePrice > 0 ? ((spotPrice / strikePrice - 1) * 100) : 0;
  const isATM = Math.abs(spotPrice - strikePrice) / spotPrice < 0.015;
  const isITM = optionType === 'CALL' ? spotPrice > strikePrice : spotPrice < strikePrice;

  return (
    <div className="space-y-4 select-none pb-10 text-xs text-[#E7EDF3] max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-4 rounded-xl border border-[#25313D] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white font-sans">
                  Black-Scholes Options Greeks Engine
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                  CLOSED-FORM DERIVATIVES
                </span>
              </div>
              <p className="text-[#8B99A8] text-xs">
                Live partial derivatives (Δ, Γ, Θ, ν, ρ) computed live from actual asset spot prices and implied volatility.
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Parameters Form (Left Column) */}
        <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#25313D]">
            <span className="font-bold text-white text-xs font-sans">Model Parameters</span>
            <div className="flex bg-[#0D131A] p-0.5 rounded-lg border border-[#25313D]">
              <button
                onClick={() => setOptionType('CALL')}
                className={`px-3 py-1 rounded font-bold font-mono text-[10px] transition-colors ${
                  optionType === 'CALL' ? 'bg-[#35C69A] text-black shadow-xs' : 'text-[#8B99A8] hover:text-white'
                }`}
              >
                CALL
              </button>
              <button
                onClick={() => setOptionType('PUT')}
                className={`px-3 py-1 rounded font-bold font-mono text-[10px] transition-colors ${
                  optionType === 'PUT' ? 'bg-[#EF6468] text-white shadow-xs' : 'text-[#8B99A8] hover:text-white'
                }`}
              >
                PUT
              </button>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[#8B99A8] block text-[10px] font-sans mb-1">
                Underlying Spot Price (S): {curr}{spotPrice.toFixed(2)}
              </label>
              <input
                type="number"
                step="any"
                value={spotPrice}
                onChange={e => setSpotPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[#8B99A8] block text-[10px] font-sans mb-1">
                Strike Price (K): {curr}{strikePrice.toFixed(2)}
              </label>
              <input
                type="number"
                step="any"
                value={strikePrice}
                onChange={e => setStrikePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#8B99A8] font-sans">Days to Expiration (DTE)</span>
                <span className="text-white font-bold">{daysToExpiry} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                value={daysToExpiry}
                onChange={e => setDaysToExpiry(parseInt(e.target.value, 10))}
                className="w-full accent-[#2979FF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#8B99A8] font-sans">Implied Volatility (σ)</span>
                <span className="text-[#2979FF] font-bold">{volatilityPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={volatilityPct}
                onChange={e => setVolatilityPct(parseFloat(e.target.value))}
                className="w-full accent-[#2979FF] cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[#8B99A8] block text-[10px] font-sans mb-1">Risk-Free Rate (r): %</label>
              <input
                type="number"
                step="0.1"
                value={riskFreePct}
                onChange={e => setRiskFreePct(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#2979FF]"
              />
            </div>
          </div>
        </div>

        {/* Greeks Dashboard Output (Right 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Theoretical Fair Value Header */}
          <div className="p-4 bg-[#111922] rounded-xl border border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-[#8B99A8] font-sans uppercase tracking-wider block">
                Theoretical Black-Scholes Fair Value
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1 tabular-nums">
                {curr}{bsResult.price.toFixed(2)}
              </div>
              <div className="text-[11px] text-[#8B99A8] font-mono mt-1">
                Intrinsic: <b className="text-white">{curr}{bsResult.intrinsic.toFixed(2)}</b> | Time Extrinsic: <b className="text-[#D8AB5E]">{curr}{bsResult.extrinsic.toFixed(2)}</b>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-[#8B99A8] font-mono block">
                Moneyness: {moneynessPct >= 0 ? '+' : ''}{moneynessPct.toFixed(2)}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono inline-block mt-1 ${
                isATM ? 'bg-[#D8AB5E]/15 text-[#D8AB5E] border border-[#D8AB5E]/30' :
                isITM ? 'bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30' :
                'bg-[#EF6468]/15 text-[#EF6468] border border-[#EF6468]/30'
              }`}>
                {isATM ? 'AT THE MONEY (ATM)' : isITM ? 'IN THE MONEY (ITM)' : 'OUT OF THE MONEY (OTM)'}
              </span>
            </div>
          </div>

          {/* Greeks Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            {/* Delta */}
            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Delta (Δ)</span>
                <span className="text-[9px] text-[#8B99A8]">∂V/∂S</span>
              </div>
              <div className="text-lg font-bold text-[#35C69A] tabular-nums">
                {bsResult.delta >= 0 ? '+' : ''}{bsResult.delta.toFixed(3)}
              </div>
              <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
                Price shift per {curr}1 underlying move
              </div>
            </div>

            {/* Gamma */}
            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Gamma (Γ)</span>
                <span className="text-[9px] text-[#8B99A8]">∂²V/∂S²</span>
              </div>
              <div className="text-lg font-bold text-[#2979FF] tabular-nums">
                +{bsResult.gamma.toFixed(4)}
              </div>
              <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
                Delta curvature rate of change
              </div>
            </div>

            {/* Theta */}
            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Theta (Θ)</span>
                <span className="text-[9px] text-[#8B99A8]">∂V/∂t</span>
              </div>
              <div className="text-lg font-bold text-[#EF6468] tabular-nums">
                {curr}{bsResult.theta.toFixed(2)}/day
              </div>
              <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
                Time decay erosion per session
              </div>
            </div>

            {/* Vega */}
            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Vega (ν)</span>
                <span className="text-[9px] text-[#8B99A8]">∂V/∂σ</span>
              </div>
              <div className="text-lg font-bold text-[#D8AB5E] tabular-nums">
                +{curr}{bsResult.vega.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
                Sensitivity per 1% change in IV
              </div>
            </div>

            {/* Rho */}
            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Rho (ρ)</span>
                <span className="text-[9px] text-[#8B99A8]">∂V/∂r</span>
              </div>
              <div className="text-lg font-bold text-[#8B99A8] tabular-nums">
                {bsResult.rho >= 0 ? '+' : ''}{curr}{bsResult.rho.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
                Sensitivity per 1% interest shift
              </div>
            </div>

            {/* Leverage / Elasticity */}
            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Leverage (Ω)</span>
                <span className="text-[9px] text-[#8B99A8]">|Δ|·S/V</span>
              </div>
              <div className="text-lg font-bold text-white tabular-nums">
                {bsResult.leverage.toFixed(1)}x
              </div>
              <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
                Effective capital gearing multiplier
              </div>
            </div>
          </div>

          {/* Quick Routing Bar */}
          <div className="flex justify-between items-center p-3 bg-[#111922] rounded-xl border border-[#25313D]">
            <span className="text-xs text-[#8B99A8]">
              Ready to visualize multi-leg expiration geometry?
            </span>
            <Link
              href={`/app/risk/payoff?symbol=${symbol}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-colors"
            >
              <span>Build Strategy Payoff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Institutional Model Disclosures & Limitations Notice */}
          <div className="p-4 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-2 font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#25313D] text-[11px] font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2979FF]" />
                <span>Model Specifications &amp; Educational Disclosures</span>
              </span>
              <span className="text-[#8B99A8]">Black-Scholes-Merton (1973)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono text-[#8B99A8]">
              <div>
                <span className="text-white block font-sans font-semibold">Exercise Style:</span>
                <span>European (Exercise at Expiry Only)</span>
              </div>
              <div>
                <span className="text-white block font-sans font-semibold">Data Provenance:</span>
                <span className="text-[#2979FF]">SIMULATED (24/7 GBM Engine)</span>
              </div>
              <div>
                <span className="text-white block font-sans font-semibold">IV Engine:</span>
                <span>Newton-Raphson Inversion</span>
              </div>
            </div>

            <p className="text-[10px] text-[#8B99A8] leading-relaxed pt-1 border-t border-[#25313D]/60">
              <strong className="text-white">Model Limitation Notice: </strong>
              The classical Black-Scholes formula assumes constant continuous volatility, lognormal returns, and zero early exercise. Listed Indian equity options (NSE) and US equity options may experience early exercise premiums, volatility smile skewness, discrete dividend drops, and liquidity spread widenings that diverge from theoretical closed-form pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GreeksCalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Greeks Engine...</div>}>
      <GreeksContent />
    </Suspense>
  );
}
