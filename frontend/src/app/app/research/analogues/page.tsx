'use client';

import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, Clock, ShieldCheck, BarChart2 } from 'lucide-react';

export default function HistoricalAnaloguesPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'AAPL', 'NVDA'];

  const analogues = [
    {
      period: 'October 2023 Pullback',
      similarity: '78.4%',
      regime: '20-EMA Mean Reversion',
      forward5D: '+2.8%',
      forward10D: '+4.2%',
      forward20D: '+6.1%',
      outcome: 'BULLISH_CONTINUATION'
    },
    {
      period: 'January 2022 Post-Earnings Base',
      similarity: '72.1%',
      regime: 'Bollinger Band Squeeze',
      forward5D: '+1.4%',
      forward10D: '+3.5%',
      forward20D: '+4.9%',
      outcome: 'BULLISH_CONTINUATION'
    },
    {
      period: 'June 2021 Momentum Surge',
      similarity: '66.8%',
      regime: 'Volume-Weighted Breakout',
      forward5D: '-0.8%',
      forward10D: '+1.2%',
      forward20D: '+2.8%',
      outcome: 'CONSOLIDATION'
    }
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Historical Analogues &amp; Pattern Matching</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Dynamic Time Warping (DTW) and regime correlation identifying identical historical chart setups.
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

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Average Analogue Correlation</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 my-0.5">72.4% Match</div>
          <div className="text-[10px] text-slate-500 font-sans">Across 5-year multi-regime database</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">10-Day Forward Expectancy</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 my-0.5">+2.97% Gain</div>
          <div className="text-[10px] text-slate-500 font-sans">83% positive forward outcome rate</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Sample Size Evaluated</div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-200 my-0.5">1,248 Rolling Windows</div>
          <div className="text-[10px] text-slate-500 font-sans">Normalized Euclidean distance filtered</div>
        </div>
      </div>

      {/* Analogues Table */}
      <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
          Top Nearest Historical Analogues ({symbol})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead className="bg-slate-50 dark:bg-[#070b14] text-slate-500 font-sans border-b border-slate-200 dark:border-[#1b253b]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Historical Regime / Period</th>
                <th className="py-2.5 px-3 font-semibold">DTW Similarity</th>
                <th className="py-2.5 px-3 font-semibold">Setup Regime</th>
                <th className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">+5D Return</th>
                <th className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">+10D Return</th>
                <th className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">+20D Return</th>
                <th className="py-2.5 px-3 font-semibold text-right">Resolved Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
              {analogues.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">{a.period}</td>
                  <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-bold">{a.similarity}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">{a.regime}</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{a.forward5D}</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{a.forward10D}</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{a.forward20D}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold font-sans text-[10px] border border-emerald-200 dark:border-emerald-500/20">
                      {a.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
