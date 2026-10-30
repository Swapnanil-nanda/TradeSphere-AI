'use client';

import React from 'react';
import { BookCheck, ShieldCheck, CheckCircle2, ArrowRight, Lightbulb, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function InvestingGuidePage() {
  const chapters = [
    {
      num: '01',
      title: 'The Mathematics of Compounding & Rule of 72',
      summary: 'Why time in the market beats timing the market. Understanding how geometric returns compound over 10, 20, and 30 years.',
      points: [
        'Rule of 72: Divide 72 by annual CAGR to find years required to double capital (e.g., 72 / 12% = 6 years)',
        'The asymmetry of losses: A 50% drawdown requires a 100% gain just to break even',
        'Consistency over home runs: Steady 12–15% CAGR outcompetes erratic high-risk speculation'
      ]
    },
    {
      num: '02',
      title: 'Asset Allocation & Portfolio Diversification',
      summary: 'Constructing an all-weather portfolio across uncorrelated asset classes to survive severe market drawdowns.',
      points: [
        'The 100 minus age rule for equity allocation vs debt allocation',
        'Gold and Sovereign Gold Bonds (SGB) as systemic risk and currency devaluation hedges',
        'Rebalancing triggers: Annual calendar rebalance or 5% allocation corridor drift'
      ]
    },
    {
      num: '03',
      title: 'Active Trading vs Passive Long-Term Wealth Accumulation',
      summary: 'Clear boundaries between simulated high-frequency trading terminal execution and long-term passive investing.',
      points: [
        'Core & Satellite Portfolio framework: 80% in low-cost index funds/SIP, 20% in tactical quant strategies',
        'Expense Ratio drag: A 1.5% difference in TER can erode 30% of total wealth over 25 years',
        'Behavioral biases: Loss aversion, recency bias, and FOMO (Fear of Missing Out)'
      ]
    },
    {
      num: '04',
      title: 'Statutory Risk Guardrails & Position Sizing Invariants',
      summary: 'The non-negotiable risk rules enforced across TradeSphere AI.',
      points: [
        'The 1.0% single-trade max loss rule: Position size = (Account Risk ₹) / |Entry - StopLoss|',
        'The 3.0% daily drawdown circuit breaker to prevent emotional revenge trading',
        'Always trade with a defined exit plan before clicking buy or sell'
      ]
    }
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <BookCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Institutional Investing Guide &amp; Principles</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Foundational principles of capital preservation, risk mathematics, and generational wealth compounding.
            </p>
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="space-y-3">
        {chapters.map((ch) => (
          <div key={ch.num} className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold font-mono text-xs flex items-center justify-center">
                {ch.num}
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{ch.title}</h2>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              {ch.summary}
            </p>

            <div className="p-3 bg-slate-50 dark:bg-[#070b14] rounded-lg border border-slate-200 dark:border-[#1b253b] space-y-1.5">
              {ch.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
