'use client';

import React, { useState } from 'react';
import { FileText, Award, TrendingUp, ShieldCheck, DollarSign, PieChart } from 'lucide-react';

export default function FundamentalAnalysisPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'AAPL', 'NVDA'];

  const ratios = [
    { name: 'Trailing P/E Ratio', value: '26.4x', benchmark: 'Sector: 28.1x', status: 'FAIR_VALUE' },
    { name: 'Price to Book (P/B)', value: '2.30x', benchmark: 'Sector: 2.80x', status: 'ATTRACTIVE' },
    { name: 'EV / EBITDA', value: '14.2x', benchmark: 'Historical: 15.5x', status: 'FAIR_VALUE' },
    { name: 'Return on Equity (ROE)', value: '13.8%', benchmark: 'Target > 12%', status: 'HEALTHY' },
    { name: 'ROCE', value: '15.4%', benchmark: 'Target > 14%', status: 'HEALTHY' },
    { name: 'Debt to Equity', value: '0.38', benchmark: 'Target < 0.80', status: 'CONSERVATIVE' },
    { name: 'Interest Coverage', value: '7.8x', benchmark: 'Safe > 4.0x', status: 'VERY_SAFE' },
    { name: 'Dividend Yield', value: '0.45%', benchmark: 'Consistent payouts', status: 'STABLE' },
  ];

  const shareholding = [
    { category: 'Promoter & Promoter Group', pct: 50.3, color: 'bg-blue-600' },
    { category: 'Foreign Institutional Investors (FII)', pct: 21.8, color: 'bg-emerald-500' },
    { category: 'Domestic Institutional Investors (DII)', pct: 16.4, color: 'bg-amber-500' },
    { category: 'Retail & Public Shareholders', pct: 11.5, color: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Fundamental Analysis &amp; Financial Dossier</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Valuation multiples, profitability margins, debt sustainability, and institutional ownership.
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

      {/* Ratios Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ratios.slice(0, 4).map((r, i) => (
          <div key={i} className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
            <div className="text-[10px] text-slate-400 font-sans">{r.name}</div>
            <div className="font-bold text-sm font-mono text-slate-900 dark:text-white my-0.5">{r.value}</div>
            <div className="text-[10px] text-slate-500">{r.benchmark}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Full Ratios Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
            Balance Sheet &amp; Profitability Multiples ({symbol})
          </div>
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-50 dark:bg-[#070b14] text-slate-500 font-sans border-b border-slate-200 dark:border-[#1b253b]">
              <tr>
                <th className="py-2 px-3 font-semibold">Financial Metric</th>
                <th className="py-2 px-3 font-semibold">Value</th>
                <th className="py-2 px-3 font-semibold">Peer Benchmark</th>
                <th className="py-2 px-3 font-semibold">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
              {ratios.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{r.name}</td>
                  <td className="py-2 px-3 font-mono text-slate-900 dark:text-white font-semibold">{r.value}</td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{r.benchmark}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-[10px] font-mono">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Shareholding Pattern Card */}
        <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs border-b border-slate-100 dark:border-[#1b253b] pb-2 mb-3">
              Shareholding Pattern (Institutional)
            </div>

            <div className="space-y-3">
              {shareholding.map((sh, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400">{sh.category}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{sh.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${sh.color} rounded-full`} style={{ width: `${sh.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1b253b] text-slate-500 text-[10px]">
            Data updated quarterly per exchange filings. Promoter pledge: 0.00% (Zero encumbrance).
          </div>
        </div>
      </div>
    </div>
  );
}
