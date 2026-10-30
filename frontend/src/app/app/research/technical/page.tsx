'use client';

import React, { useState } from 'react';
import { LineChart, TrendingUp, TrendingDown, Layers, ShieldCheck, Activity, BarChart2 } from 'lucide-react';

export default function TechnicalAnalysisPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'AAPL', 'NVDA'];

  const indicators = [
    { name: 'RSI (14)', value: '56.4', status: 'NEUTRAL-BULLISH', interpretation: 'Momentum steady, not overbought (<70)' },
    { name: '20-EMA', value: '₹2,972.10', status: 'BULLISH', interpretation: 'Price holding firmly above trendline (+0.45%)' },
    { name: '50-EMA', value: '₹2,920.00', status: 'BULLISH', interpretation: 'Primary medium-term trend positive' },
    { name: '200-EMA', value: '₹2,780.50', status: 'STRONG_BULLISH', interpretation: 'Long-term structural bull regime' },
    { name: 'VWAP', value: '₹2,954.00', status: 'BULLISH', interpretation: 'Intraday buyers in control above institutional volume' },
    { name: 'Bollinger Bands', value: '₹2,890 - ₹3,025', status: 'EXPANDING', interpretation: 'Volatility bandwidth widening, breakout imminent' },
    { name: 'ATR (14)', value: '₹42.80', status: 'VOLATILITY_NORMAL', interpretation: 'Average True Range sets Stop distance at ₹42.80' },
    { name: 'Supertrend (10, 3)', value: '₹2,910.00 (BUY)', status: 'BUY_SIGNAL', interpretation: 'Trailing dynamic stop supports long bias' }
  ];

  const pivots = [
    { label: 'Resistance 3 (R3)', price: '3,085.00' },
    { label: 'Resistance 2 (R2)', price: '3,050.00' },
    { label: 'Resistance 1 (R1)', price: '3,015.00' },
    { label: 'Central Pivot (P)', price: '2,975.00', isCentral: true },
    { label: 'Support 1 (S1)', price: '2,940.00' },
    { label: 'Support 2 (S2)', price: '2,905.00' },
    { label: 'Support 3 (S3)', price: '2,865.00' },
  ];

  const timeframes = [
    { tf: '15-Minute', bias: 'BULLISH', detail: 'Above VWAP & EMA-20' },
    { tf: '1-Hour', bias: 'BULLISH', detail: 'Consolidating near high' },
    { tf: '4-Hour', bias: 'NEUTRAL', detail: 'Inside Bollinger band' },
    { tf: 'Daily (1D)', bias: 'STRONG_BULLISH', detail: 'Higher-high sequence' },
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Technical Analysis &amp; Indicator Matrix</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Deterministic mathematical oscillators, trend equilibrium guides, and pivot point levels.
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

      {/* Multi-Timeframe Alignment */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {timeframes.map(tf => (
          <div key={tf.tf} className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">{tf.tf}</div>
            <div className={`font-bold text-xs font-mono my-0.5 ${
              tf.bias.includes('BULLISH') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
            }`}>
              {tf.bias}
            </div>
            <div className="text-[10px] text-slate-500">{tf.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Indicators Matrix Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
            Technical Oscillators &amp; Moving Averages ({symbol})
          </div>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-50 dark:bg-[#070b14] text-slate-500 font-sans border-b border-slate-200 dark:border-[#1b253b]">
              <tr>
                <th className="py-2 px-3 font-semibold">Indicator</th>
                <th className="py-2 px-3 font-semibold">Calculated Value</th>
                <th className="py-2 px-3 font-semibold">Regime / Bias</th>
                <th className="py-2 px-3 font-semibold">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
              {indicators.map((ind, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{ind.name}</td>
                  <td className="py-2 px-3 font-mono text-slate-900 dark:text-white font-semibold">{ind.value}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-[10px] font-mono">
                      {ind.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[10px]">{ind.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pivot Points Card */}
        <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
            Classic Floor Pivot Levels
          </div>
          <div className="p-3 space-y-1.5 flex-1 font-mono">
            {pivots.map((p, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  p.isCentral
                    ? 'bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 font-bold'
                    : 'bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]'
                }`}
              >
                <span className="font-sans text-[10px] text-slate-500">{p.label}</span>
                <span className={`font-semibold ${
                  p.label.startsWith('Res') ? 'text-rose-600 dark:text-rose-400' :
                  p.label.startsWith('Sup') ? 'text-emerald-600 dark:text-emerald-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  ₹{p.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
