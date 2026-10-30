'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Search, Filter, TrendingUp, ShieldCheck, ArrowRight, Calculator } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api-client';

export default function MutualFundsPage() {
  const [funds, setFunds] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.getMutualFunds().then(setFunds);
  }, []);

  const categories = ['ALL', 'Large Cap', 'Flexi Cap', 'Mid Cap', 'Small Cap', 'Debt', 'Value Oriented'];

  const filtered = funds.filter(f => {
    if (categoryFilter !== 'ALL' && !f.category.includes(categoryFilter)) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Mutual Funds &amp; Institutional Schemes Directory</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Research top Indian direct mutual fund schemes with historical CAGRs, expense ratios, and AUM.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheme e.g. Parag Parikh..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1b253b] flex items-center gap-1.5 overflow-x-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-50 dark:bg-[#070b14] text-slate-500 font-sans border-b border-slate-200 dark:border-[#1b253b]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Scheme Name</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">NAV (₹)</th>
                <th className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">3Y CAGR</th>
                <th className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">5Y CAGR</th>
                <th className="py-2.5 px-3 font-semibold">AUM (₹ Cr)</th>
                <th className="py-2.5 px-3 font-semibold">Expense Ratio</th>
                <th className="py-2.5 px-3 font-semibold">Riskometer</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
              {filtered.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 dark:text-white">{f.name}</div>
                    <div className="text-[10px] text-slate-400">Growth Plan (Direct)</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                    ₹{f.nav.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{f.cagr3Y}%
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{f.cagr5Y}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                    ₹{f.aumCr.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                    {f.expenseRatio}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      f.riskometer === 'Moderate'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      {f.riskometer}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href="/app/wealth/sip-planner"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px] transition-colors"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Plan SIP</span>
                    </Link>
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
