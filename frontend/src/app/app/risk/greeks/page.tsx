'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Percent, Calculator, Activity, ShieldCheck, RefreshCw } from 'lucide-react';
import { apiClient, Ticker } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'NIFTY50', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'TATAMOTORS',
  'AAPL', 'NVDA', 'TSLA', 'MSFT', 'SPY', 'QQQ'
];

function GreeksContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [spotPrice, setSpotPrice] = useState(1165.0);
  const [strikePrice, setStrikePrice] = useState(1180.0);
  const [daysToExpiry, setDaysToExpiry] = useState(7);
  const [volatilityPct, setVolatilityPct] = useState(22.0);
  const [riskFreePct, setRiskFreePct] = useState(6.5);
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  // Fetch actual live spot price when symbol changes
  useEffect(() => {
    apiClient.getTickers().then(list => {
      const found = list.find(t => t.symbol === symbol);
      if (found && found.ltp) {
        const p = Number(found.ltp);
        setSpotPrice(p);
        const step = p > 10000 ? 100 : p > 1000 ? 50 : 5;
        setStrikePrice(Math.round((p * 1.01) / step) * step);
      }
    }).catch(() => {});
  }, [symbol]);

  // Exact Black-Scholes Formula Implementation
  const S = spotPrice;
  const K = strikePrice;
  const T = Math.max(0.001, daysToExpiry / 365);
  const r = riskFreePct / 100;
  const sigma = volatilityPct / 100;

  const normCdf = (x: number) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return 0.5 * (1.0 + sign * y);
  };

  const normPdf = (x: number) => {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  };

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  let premium = 0;
  let delta = 0;
  const gamma = normPdf(d1) / (S * sigma * Math.sqrt(T));
  const vega = (S * normPdf(d1) * Math.sqrt(T)) / 100;

  let theta = 0;
  let rho = 0;

  if (optionType === 'CALL') {
    premium = S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d2);
    delta = normCdf(d1);
    theta = (-(S * normPdf(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normCdf(d2)) / 365;
    rho = (K * T * Math.exp(-r * T) * normCdf(d2)) / 100;
  } else {
    premium = K * Math.exp(-r * T) * normCdf(-d2) - S * normCdf(-d1);
    delta = normCdf(d1) - 1;
    theta = (-(S * normPdf(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normCdf(-d2)) / 365;
    rho = (-K * T * Math.exp(-r * T) * normCdf(-d2)) / 100;
  }

  const isUS = symbol === 'AAPL' || symbol === 'NVDA' || symbol === 'TSLA' || symbol === 'MSFT' || symbol === 'SPY' || symbol === 'QQQ';
  const curr = isUS ? '$' : '₹';

  return (
    <div className="space-y-4 select-none pb-8 text-xs text-[#F0F3F6]">
      {/* Header */}
      <div className="bg-[#050505] p-4 rounded-xl border border-[#141414] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white font-sans">Black-Scholes Options Greeks Engine</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-mono">
                  ANALYTIC GREEKS
                </span>
              </div>
              <p className="text-[#808a9d] text-[11px]">
                Closed-form pricing derivatives (Δ, Γ, Θ, ν, ρ) computed live from actual asset spot prices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-[#080808] border border-[#1a1a1a] rounded-lg px-3 py-1.5 font-mono font-bold text-white focus:outline-none focus:border-[#2979FF]"
            >
              {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Parameters Form (Left 1/3) */}
        <div className="bg-[#050505] p-4 rounded-xl border border-[#141414] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#141414]">
            <span className="font-bold text-white text-xs font-sans">Model Parameters</span>
            <div className="flex bg-[#080808] p-0.5 rounded border border-[#1a1a1a]">
              <button
                onClick={() => setOptionType('CALL')}
                className={`px-2.5 py-0.5 rounded font-bold font-mono text-[10px] ${optionType === 'CALL' ? 'bg-[#00c805] text-black' : 'text-[#808a9d]'}`}
              >
                CALL
              </button>
              <button
                onClick={() => setOptionType('PUT')}
                className={`px-2.5 py-0.5 rounded font-bold font-mono text-[10px] ${optionType === 'PUT' ? 'bg-[#ff333a] text-white' : 'text-[#808a9d]'}`}
              >
                PUT
              </button>
            </div>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div>
              <label className="text-[#808a9d] block text-[10px] font-sans mb-1">Underlying Spot Price (S)</label>
              <input
                type="number"
                step="any"
                value={spotPrice}
                onChange={e => setSpotPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[#808a9d] block text-[10px] font-sans mb-1">Strike Price (K)</label>
              <input
                type="number"
                step="any"
                value={strikePrice}
                onChange={e => setStrikePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[#808a9d] block text-[10px] font-sans mb-1">Days to Expiration (DTE): {daysToExpiry}d</label>
              <input
                type="range"
                min="1"
                max="90"
                value={daysToExpiry}
                onChange={e => setDaysToExpiry(parseInt(e.target.value, 10))}
                className="w-full accent-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[#808a9d] block text-[10px] font-sans mb-1">Implied Volatility (σ): {volatilityPct}%</label>
              <input
                type="range"
                min="5"
                max="100"
                value={volatilityPct}
                onChange={e => setVolatilityPct(parseFloat(e.target.value))}
                className="w-full accent-[#2979FF]"
              />
            </div>

            <div>
              <label className="text-[#808a9d] block text-[10px] font-sans mb-1">Risk-Free Rate (r): {riskFreePct}%</label>
              <input
                type="number"
                step="0.1"
                value={riskFreePct}
                onChange={e => setRiskFreePct(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#2979FF]"
              />
            </div>
          </div>
        </div>

        {/* Greeks Dashboard Output (Right 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Theoretical Fair Value Header */}
          <div className="p-4 bg-[#050505] rounded-xl border border-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-[#808a9d] font-sans uppercase tracking-wider block">Theoretical Black-Scholes Fair Value</span>
              <div className="text-2xl font-black font-mono text-white mt-1 tabular-nums">
                {curr}{premium > 0 ? premium.toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#808a9d] font-mono block">Moneyness: {((S / K - 1) * 100).toFixed(2)}%</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono inline-block mt-1 ${
                Math.abs(S - K) / S < 0.015 ? 'bg-[#2979FF]/10 text-[#2979FF]' : S > K ? 'bg-[#00c805]/10 text-[#00c805]' : 'bg-[#ff333a]/10 text-[#ff333a]'
              }`}>
                {Math.abs(S - K) / S < 0.015 ? 'AT_THE_MONEY (ATM)' : S > K ? 'IN_THE_MONEY (ITM)' : 'OUT_OF_THE_MONEY (OTM)'}
              </span>
            </div>
          </div>

          {/* Greeks Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3.5 bg-[#050505] rounded-xl border border-[#141414]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Delta (Δ)</span>
                <span className="text-[9px] text-[#808a9d]">∂V/∂S</span>
              </div>
              <div className="text-lg font-bold text-[#00c805] tabular-nums">{delta.toFixed(3)}</div>
              <div className="text-[10px] text-[#808a9d] mt-1 font-sans">Price exposure per {curr}1 underlying move</div>
            </div>

            <div className="p-3.5 bg-[#050505] rounded-xl border border-[#141414]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Gamma (Γ)</span>
                <span className="text-[9px] text-[#808a9d]">∂²V/∂S²</span>
              </div>
              <div className="text-lg font-bold text-[#2979FF] tabular-nums">{gamma.toFixed(4)}</div>
              <div className="text-[10px] text-[#808a9d] mt-1 font-sans">Delta rate of acceleration</div>
            </div>

            <div className="p-3.5 bg-[#050505] rounded-xl border border-[#141414]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Theta (Θ)</span>
                <span className="text-[9px] text-[#808a9d]">∂V/∂t</span>
              </div>
              <div className="text-lg font-bold text-[#ff333a] tabular-nums">{curr}{theta.toFixed(2)}/day</div>
              <div className="text-[10px] text-[#808a9d] mt-1 font-sans">Time decay per session</div>
            </div>

            <div className="p-3.5 bg-[#050505] rounded-xl border border-[#141414]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Vega (ν)</span>
                <span className="text-[9px] text-[#808a9d]">∂V/∂σ</span>
              </div>
              <div className="text-lg font-bold text-[#D8AB5E] tabular-nums">{curr}{vega.toFixed(2)}</div>
              <div className="text-[10px] text-[#808a9d] mt-1 font-sans">Option value per 1% IV shift</div>
            </div>

            <div className="p-3.5 bg-[#050505] rounded-xl border border-[#141414]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Rho (ρ)</span>
                <span className="text-[9px] text-[#808a9d]">∂V/∂r</span>
              </div>
              <div className="text-lg font-bold text-slate-300 tabular-nums">{curr}{rho.toFixed(2)}</div>
              <div className="text-[10px] text-[#808a9d] mt-1 font-sans">Sensitivity per 1% interest shift</div>
            </div>

            <div className="p-3.5 bg-[#050505] rounded-xl border border-[#141414]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">Leverage (Ω)</span>
                <span className="text-[9px] text-[#808a9d]">Elasticity</span>
              </div>
              <div className="text-lg font-bold text-white tabular-nums">
                {premium > 0 ? ((Math.abs(delta) * S) / premium).toFixed(1) : '—'}x
              </div>
              <div className="text-[10px] text-[#808a9d] mt-1 font-sans">Effective gearing multiplier</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GreeksCalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#808a9d] font-mono text-xs">Loading Greeks Engine...</div>}>
      <GreeksContent />
    </Suspense>
  );
}
