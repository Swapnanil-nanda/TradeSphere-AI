'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { PieChart, Search, Filter, TrendingUp, ShieldCheck, ArrowRight, Calculator, CheckCircle2, Sliders } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

const DEFAULT_SCHEMES = [
  { name: 'Nippon India Large Cap Fund', category: 'Large Cap', aumCr: 32450, nav: 84.2, cagr3Y: 22.4, cagr5Y: 18.2, expenseRatio: 0.78, riskometer: 'Very High', benchmark: 'NIFTY 100 TRI' },
  { name: 'Parag Parikh Flexi Cap Fund', category: 'Flexi Cap', aumCr: 68120, nav: 79.5, cagr3Y: 24.1, cagr5Y: 21.6, expenseRatio: 0.62, riskometer: 'Very High', benchmark: 'NIFTY 500 TRI' },
  { name: 'HDFC Mid-Cap Opportunities Fund', category: 'Mid Cap', aumCr: 71200, nav: 194.8, cagr3Y: 28.5, cagr5Y: 23.8, expenseRatio: 0.74, riskometer: 'Very High', benchmark: 'NIFTY Midcap 150 TRI' },
  { name: 'Mirae Asset Large & Midcap Fund', category: 'Large & Mid Cap', aumCr: 41800, nav: 142.1, cagr3Y: 21.8, cagr5Y: 19.4, expenseRatio: 0.65, riskometer: 'Very High', benchmark: 'NIFTY LargeMidcap 250 TRI' },
  { name: 'SBI Small Cap Fund', category: 'Small Cap', aumCr: 29400, nav: 168.4, cagr3Y: 26.2, cagr5Y: 24.1, expenseRatio: 0.69, riskometer: 'Very High', benchmark: 'BSE 250 SmallCap TRI' },
  { name: 'ICICI Prudential Corporate Bond Fund', category: 'Debt', aumCr: 26500, nav: 29.4, cagr3Y: 7.4, cagr5Y: 7.9, expenseRatio: 0.32, riskometer: 'Moderate', benchmark: 'CRISIL Corporate Bond Index' },
  { name: 'Bandhan Sterling Value Fund', category: 'Value Oriented', aumCr: 11200, nav: 138.9, cagr3Y: 25.6, cagr5Y: 20.8, expenseRatio: 0.81, riskometer: 'Very High', benchmark: 'NIFTY 500 Value 50 TRI' },
  { name: 'Motilal Oswal Nasdaq 100 Fund of Fund', category: 'International Tech', aumCr: 8400, nav: 42.8, cagr3Y: 19.8, cagr5Y: 22.4, expenseRatio: 0.54, riskometer: 'Very High', benchmark: 'NASDAQ-100 TRI' }
];

function MutualFundsContent() {
  const [funds, setFunds] = useState<any[]>(DEFAULT_SCHEMES);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [compareFundA, setCompareFundA] = useState<any>(DEFAULT_SCHEMES[0]);
  const [compareFundB, setCompareFundB] = useState<any>(DEFAULT_SCHEMES[1]);

  const categories = ['ALL', 'Large Cap', 'Flexi Cap', 'Mid Cap', 'Small Cap', 'Debt', 'Value Oriented', 'International Tech'];

  const filtered = funds.filter(f => {
    if (categoryFilter !== 'ALL' && !f.category.includes(categoryFilter)) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#E7EDF3]">Mutual Funds &amp; Institutional Schemes Directory</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                  NAV INTELLIGENCE
                </span>
              </div>
              <p className="text-[#8B99A8] text-[11px]">
                Direct mutual fund scheme analytics with verified 3Y/5Y CAGRs, TER expense ratios, and AUM rankings.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8B99A8]" />
            <input
              type="text"
              placeholder="Search scheme e.g. Parag Parikh..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg pl-8 pr-3 py-1.5 text-[#E7EDF3] placeholder-[#8B99A8] focus:outline-none focus:border-[#2979FF]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3 pt-3 border-t border-[#25313D] flex items-center gap-1.5 overflow-x-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-[#2979FF] text-white shadow-2xs'
                  : 'bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] border border-[#25313D]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Scheme Compare Matrix */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#25313D] pb-2">
          <span className="font-bold text-xs uppercase tracking-wider font-mono text-[#E7EDF3]">
            Direct Mutual Fund Head-to-Head Comparison
          </span>
          <span className="text-[10px] text-[#8B99A8]">Select two schemes to compare metrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#0D131A] p-3 rounded-lg border border-[#25313D] space-y-2">
            <select
              value={compareFundA.name}
              onChange={e => setCompareFundA(funds.find(f => f.name === e.target.value) || funds[0])}
              className="w-full bg-[#151F29] border border-[#25313D] rounded px-2 py-1 text-xs font-bold text-[#E7EDF3]"
            >
              {funds.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1">
              <div className="bg-[#151F29] p-2 rounded">
                <span className="text-[9px] text-[#8B99A8] block font-sans">3Y CAGR</span>
                <span className="text-xs font-bold text-[#35C69A]">{compareFundA.cagr3Y}%</span>
              </div>
              <div className="bg-[#151F29] p-2 rounded">
                <span className="text-[9px] text-[#8B99A8] block font-sans">5Y CAGR</span>
                <span className="text-xs font-bold text-[#35C69A]">{compareFundA.cagr5Y}%</span>
              </div>
              <div className="bg-[#151F29] p-2 rounded">
                <span className="text-[9px] text-[#8B99A8] block font-sans">Expense Ratio</span>
                <span className="text-xs font-bold text-[#E7EDF3]">{compareFundA.expenseRatio}%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0D131A] p-3 rounded-lg border border-[#25313D] space-y-2">
            <select
              value={compareFundB.name}
              onChange={e => setCompareFundB(funds.find(f => f.name === e.target.value) || funds[1])}
              className="w-full bg-[#151F29] border border-[#25313D] rounded px-2 py-1 text-xs font-bold text-[#E7EDF3]"
            >
              {funds.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1">
              <div className="bg-[#151F29] p-2 rounded">
                <span className="text-[9px] text-[#8B99A8] block font-sans">3Y CAGR</span>
                <span className="text-xs font-bold text-[#35C69A]">{compareFundB.cagr3Y}%</span>
              </div>
              <div className="bg-[#151F29] p-2 rounded">
                <span className="text-[9px] text-[#8B99A8] block font-sans">5Y CAGR</span>
                <span className="text-xs font-bold text-[#35C69A]">{compareFundB.cagr5Y}%</span>
              </div>
              <div className="bg-[#151F29] p-2 rounded">
                <span className="text-[9px] text-[#8B99A8] block font-sans">Expense Ratio</span>
                <span className="text-xs font-bold text-[#E7EDF3]">{compareFundB.expenseRatio}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead className="bg-[#0D131A] text-[#8B99A8] font-sans border-b border-[#25313D]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Scheme Name</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">NAV (₹)</th>
                <th className="py-2.5 px-3 font-semibold text-[#35C69A]">3Y CAGR</th>
                <th className="py-2.5 px-3 font-semibold text-[#35C69A]">5Y CAGR</th>
                <th className="py-2.5 px-3 font-semibold">AUM (₹ Cr)</th>
                <th className="py-2.5 px-3 font-semibold">TER</th>
                <th className="py-2.5 px-3 font-semibold">Riskometer</th>
                <th className="py-2.5 px-3 font-semibold text-right">SIP Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#25313D]">
              {filtered.map((f, idx) => (
                <tr key={idx} className="hover:bg-[#151F29]/60 transition-colors">
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-[#E7EDF3]">{f.name}</div>
                    <div className="text-[10px] text-[#8B99A8] font-mono">{f.benchmark}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-[#151F29] text-[#8B99A8] font-semibold text-[10px] border border-[#25313D]">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#E7EDF3]">₹{f.nav}</td>
                  <td className="py-2.5 px-3 font-bold text-[#35C69A]">+{f.cagr3Y}%</td>
                  <td className="py-2.5 px-3 font-bold text-[#35C69A]">+{f.cagr5Y}%</td>
                  <td className="py-2.5 px-3 text-[#8B99A8]">₹{f.aumCr.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-[#E7EDF3]">{f.expenseRatio}%</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.riskometer === 'Moderate' ? 'bg-[#2979FF]/15 text-[#2979FF]' : 'bg-[#EF6468]/15 text-[#EF6468]'
                    }`}>
                      {f.riskometer}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <Link
                      href={`/app/wealth/sip-planner?scheme=${encodeURIComponent(f.name)}&cagr=${f.cagr5Y}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-semibold text-[10px] transition-colors"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Start SIP</span>
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

export default function MutualFundsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Mutual Funds Directory...</div>}>
      <MutualFundsContent />
    </Suspense>
  );
}
