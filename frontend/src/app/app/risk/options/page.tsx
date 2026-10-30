'use client';

import React, { useState } from 'react';
import { Layers, RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import OptionsChain from '../../../../components/OptionsChain';

export default function OptionsAnalyticsPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'NIFTY50'];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Options Analytics &amp; Volatility Surface</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Black-Scholes pricing model with Newton-Raphson implied volatility and multi-strike Greeks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-800 dark:text-slate-200"
            >
              {symbols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Options Structure Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono">
        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Put-Call Ratio (PCR)</div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">1.18 (Mild Bullish)</div>
        </div>
        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Max Pain Strike</div>
          <div className="text-base font-bold text-slate-900 dark:text-white">₹3,000.00</div>
        </div>
        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">ATM Implied Volatility (IV)</div>
          <div className="text-base font-bold text-blue-600 dark:text-blue-400">22.4%</div>
        </div>
        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Historical Volatility (HV20)</div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-200">19.2%</div>
        </div>
      </div>

      {/* Full Chain Component */}
      <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs h-[520px] overflow-hidden">
        <OptionsChain symbol={symbol} spotPrice={2985.4} />
      </div>
    </div>
  );
}
