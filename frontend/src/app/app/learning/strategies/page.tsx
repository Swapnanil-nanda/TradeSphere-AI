'use client';

import React from 'react';
import { Lightbulb, Code, ShieldCheck, CheckCircle2, TrendingUp, Zap, Layers } from 'lucide-react';
import Link from 'next/link';

export default function StrategyEducationPage() {
  const strategies = [
    {
      title: 'Mean Reversion & Bollinger Band Z-Scores',
      category: 'Statistical Arbitrage',
      math: 'Z_t = (Price_t - SMA(20)) / StdDev(20)',
      desc: 'Exploits short-term overextensions in liquid large-cap equities. Enters long when Z < -2.0 with RSI(14) < 30 confirmation, targeting equilibrium reversion back to 20-period mean.',
      rules: [
        'Entry Condition: Z-score <= -2.0 AND RSI(14) <= 32',
        'Stop-Loss: Placed 1.5 * ATR below the entry candle low',
        'Exit Condition: Price touches or crosses session VWAP / 20-EMA'
      ]
    },
    {
      title: 'Multi-Timeframe Trend Following (20-EMA & VWAP)',
      category: 'Trend Following',
      math: 'Trend = EMA(20, Daily) > EMA(50, Daily) & Price(15m) > VWAP',
      desc: 'Aligns lower-timeframe intraday execution with macro daily trend momentum. Prevents counter-trend fighting and ensures high probability momentum continuation.',
      rules: [
        'Higher Timeframe Filter: Daily candle above rising 20-EMA',
        'Intraday Trigger: 15-minute pullback testing rising VWAP support',
        'Bracket Exit: Take-Profit target set at 2.0R with hard Stop-Loss below pivot low'
      ]
    },
    {
      title: 'Delta-Neutral Iron Condor Options Selling',
      category: 'Options Quantitative',
      math: 'Net Delta ≈ 0, Long Theta (Positive Time Decay)',
      desc: 'Non-directional strategy designed for range-bound volatility regimes. Sells out-of-the-money Call & Put spreads while buying wings to strictly define maximum risk.',
      rules: [
        'Sell 16-Delta OTM Call & Put (approx 1 StdDev out)',
        'Buy protective 5-Delta outer wings for defined risk cap',
        'Close or roll position when 50% max profit is achieved or at 21 DTE'
      ]
    },
    {
      title: 'Walk-Forward Vectorized Backtesting & Overfitting Defense',
      category: 'Quantitative Research',
      math: 'In-Sample (Train) 70% vs Out-of-Sample (Test) 30%',
      desc: 'Institutional methodology for validating that quantitative trading rules represent genuine statistical alpha rather than curve-fitted historical noise.',
      rules: [
        'Never optimize parameters on the test partition',
        'Verify Sharpe ratio degradation does not exceed 30% out-of-sample',
        'Model realistic transaction costs (0.03% brokerage + STT + slippage)'
      ]
    }
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Quantitative Strategy Education &amp; Rulebooks</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Institutional mechanical trading setups, statistical formulas, and execution rules.
            </p>
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="space-y-3">
        {strategies.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1b253b] pb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h2>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{s.category}</span>
              </div>
              <code className="bg-slate-100 dark:bg-[#070b14] px-2.5 py-1 rounded border border-slate-200 dark:border-[#1b253b] text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                {s.math}
              </code>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              {s.desc}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-lg border border-slate-200 dark:border-[#1b253b] space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rulebook Checklist:</span>
              {s.rules.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
