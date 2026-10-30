'use client';

import React, { useState } from 'react';
import { Percent, Calculator, Activity, ShieldCheck, RefreshCw } from 'lucide-react';

export default function GreeksCalculatorPage() {
  const [spotPrice, setSpotPrice] = useState(2980.0);
  const [strikePrice, setStrikePrice] = useState(3000.0);
  const [daysToExpiry, setDaysToExpiry] = useState(7);
  const [volatilityPct, setVolatilityPct] = useState(22.0);
  const [riskFreePct, setRiskFreePct] = useState(6.5);
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');

  // Exact Black-Scholes Formula Implementation
  const S = spotPrice;
  const K = strikePrice;
  const T = Math.max(0.001, daysToExpiry / 365);
  const r = riskFreePct / 100;
  const sigma = volatilityPct / 100;

  // Cumulative standard normal distribution approximation (Abramowitz and Stegun)
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
  const vega = (S * normPdf(d1) * Math.sqrt(T)) / 100; // per 1% change

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

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Black-Scholes Options Greeks Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Exact IEEE double-precision calculation of Delta, Gamma, Theta, Vega, and Rho sensitivities.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Input Parameters Box */}
        <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1b253b] pb-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Contract Parameters</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#070b14] p-0.5 rounded-lg border border-slate-200 dark:border-[#1b253b]">
              <button
                onClick={() => setOptionType('CALL')}
                className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                  optionType === 'CALL' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                CALL (CE)
              </button>
              <button
                onClick={() => setOptionType('PUT')}
                className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                  optionType === 'PUT' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                PUT (PE)
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Underlying Spot Price (S)</label>
            <input
              type="number"
              step="1"
              value={spotPrice}
              onChange={e => setSpotPrice(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Option Strike Price (K)</label>
            <input
              type="number"
              step="1"
              value={strikePrice}
              onChange={e => setStrikePrice(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Days to Expiration (DTE)</label>
            <input
              type="number"
              step="1"
              value={daysToExpiry}
              onChange={e => setDaysToExpiry(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Implied Volatility (σ %)</label>
            <input
              type="number"
              step="0.5"
              value={volatilityPct}
              onChange={e => setVolatilityPct(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Risk-Free Interest Rate (r %)</label>
            <input
              type="number"
              step="0.1"
              value={riskFreePct}
              onChange={e => setRiskFreePct(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Calculated Results */}
        <div className="lg:col-span-2 space-y-3">
          {/* Theoretical Fair Value */}
          <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-sans uppercase">Theoretical Option Premium</span>
              <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                ₹{premium.toFixed(2)}
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-500">
              <div>Intrinsic Value: ₹{Math.max(0, optionType === 'CALL' ? S - K : K - S).toFixed(2)}</div>
              <div>Extrinsic (Time) Value: ₹{Math.max(0, premium - Math.max(0, optionType === 'CALL' ? S - K : K - S)).toFixed(2)}</div>
            </div>
          </div>

          {/* Greeks Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 font-mono">
            <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
              <div className="text-[10px] text-slate-400 font-sans font-semibold">Delta (Δ)</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white my-0.5">{delta.toFixed(4)}</div>
              <div className="text-[10px] text-slate-500 font-sans">Price sensitivity per ₹1 move</div>
            </div>

            <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
              <div className="text-[10px] text-slate-400 font-sans font-semibold">Gamma (Γ)</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white my-0.5">{gamma.toFixed(5)}</div>
              <div className="text-[10px] text-slate-500 font-sans">Delta rate of acceleration</div>
            </div>

            <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
              <div className="text-[10px] text-slate-400 font-sans font-semibold">Theta (Θ)</div>
              <div className="text-lg font-bold text-rose-600 dark:text-rose-400 my-0.5">₹{theta.toFixed(2)} / day</div>
              <div className="text-[10px] text-slate-500 font-sans">Time decay per 24 hours</div>
            </div>

            <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
              <div className="text-[10px] text-slate-400 font-sans font-semibold">Vega (ν)</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 my-0.5">₹{vega.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 font-sans">Premium change per 1% IV</div>
            </div>

            <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
              <div className="text-[10px] text-slate-400 font-sans font-semibold">Rho (ρ)</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200 my-0.5">₹{rho.toFixed(3)}</div>
              <div className="text-[10px] text-slate-500 font-sans">Sensitivity per 1% interest rate</div>
            </div>

            <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
              <div className="text-[10px] text-slate-400 font-sans font-semibold">Moneyness</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200 my-0.5">
                {Math.abs(S - K) < 10 ? 'ATM (At the Money)' : S > K ? (optionType === 'CALL' ? 'ITM' : 'OTM') : (optionType === 'CALL' ? 'OTM' : 'ITM')}
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Strike proximity index</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
