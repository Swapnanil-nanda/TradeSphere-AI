'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PieChart, TrendingUp, ShieldCheck, DollarSign, Wallet, 
  ArrowUpRight, BarChart3, Layers, Percent, CheckCircle2, Sliders
} from 'lucide-react';

export default function WealthPortfolioPage() {
  const [totalCorpus, setTotalCorpus] = useState(1000000);

  const assetClasses = [
    { name: 'Indian Large-Cap Equities', weight: 45, value: 450000, color: '#2979FF', constituents: 'RELIANCE, TCS, HDFCBANK, INFY' },
    { name: 'Indian Mid-Cap & Growth', weight: 20, value: 200000, color: '#35C69A', constituents: 'TATAMOTORS, L&T, BAJFINANCE' },
    { name: 'US Technology Equities', weight: 20, value: 200000, color: '#D8AB5E', constituents: 'NVDA, AAPL, MSFT' },
    { name: 'Liquid Reserves & Fixed Income', weight: 15, value: 150000, color: '#8B99A8', constituents: 'Overnight Liquid Fund & Cash' }
  ];

  const sectorAllocation = [
    { sector: 'Financial Services & Banking', weight: 28, value: 280000, beta: 1.05 },
    { sector: 'Information Technology', weight: 26, value: 260000, beta: 0.92 },
    { sector: 'Energy & Retail Conglomerate', weight: 22, value: 220000, beta: 0.88 },
    { sector: 'Automotive & Manufacturing', weight: 9, value: 90000, beta: 1.18 },
    { sector: 'Cash & Short-Term Reserves', weight: 15, value: 150000, beta: 0.00 }
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Wealth Allocation & Factor Exposures</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                MULTI-ASSET CLASS
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Strategic asset allocation across domestic equities, global technology, and capital preservation tiers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/wealth/optimizer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            <span>Run MPT Optimizer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1">Total Wealth Corpus</div>
          <div className="text-base font-bold font-mono text-[#E7EDF3]">
            ₹{totalCorpus.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#35C69A] mt-1 font-mono">100% Capital Allocated</div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1">Portfolio Beta (vs NIFTY)</div>
          <div className="text-base font-bold font-mono text-[#35C69A]">
            0.94
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-mono">Low-volatility defensiveness</div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1">Annualized Expected Volatility</div>
          <div className="text-base font-bold font-mono text-[#E7EDF3]">
            14.8%
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-mono">Diversification benefit: -3.2%</div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1">1-Day 95% Parametric VaR</div>
          <div className="text-base font-bold font-mono text-[#EF6468]">
            ₹18,420 <span className="text-[10px] font-normal text-[#8B99A8]">(1.84%)</span>
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-mono">Within 2.0% risk corridor</div>
        </div>
      </div>

      {/* Asset Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Asset Class Breakdown */}
        <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
          <h2 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider font-mono mb-3">
            Asset Class Allocation
          </h2>

          <div className="space-y-3">
            {assetClasses.map((ac) => (
              <div key={ac.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ac.color }} />
                    <span className="font-semibold text-[#E7EDF3]">{ac.name}</span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="font-bold text-[#E7EDF3]">{ac.weight}%</span>
                    <span className="text-[#8B99A8] text-[10px] ml-1.5">(₹{ac.value.toLocaleString('en-IN')})</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[#0D131A] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${ac.weight}%`, backgroundColor: ac.color }}
                  />
                </div>
                <div className="text-[10px] text-[#8B99A8] font-mono pl-4.5">
                  Holdings: {ac.constituents}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
          <h2 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider font-mono mb-3">
            Sector Weight & Beta Exposure
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[#8B99A8] border-b border-[#25313D] text-[11px]">
                <tr>
                  <th className="pb-2">SECTOR</th>
                  <th className="pb-2 text-right">WEIGHT</th>
                  <th className="pb-2 text-right">VALUE</th>
                  <th className="pb-2 text-right">BETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25313D]">
                {sectorAllocation.map((sec) => (
                  <tr key={sec.sector} className="hover:bg-[#151F29]/60">
                    <td className="py-2 font-sans font-medium text-[#E7EDF3]">{sec.sector}</td>
                    <td className="py-2 text-right font-bold text-[#E7EDF3]">{sec.weight}%</td>
                    <td className="py-2 text-right text-[#8B99A8]">₹{sec.value.toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        sec.beta > 1 ? 'text-[#D8AB5E] bg-[#D8AB5E]/10' : 'text-[#35C69A] bg-[#35C69A]/10'
                      }`}>
                        {sec.beta.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Strategic Call to Action */}
      <div className="p-4 rounded-xl bg-[#111922] border border-[#25313D] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#E7EDF3]">Optimize Portfolio with Modern Portfolio Theory (MPT)</h3>
          <p className="text-[11px] text-[#8B99A8]">
            Compute Markowitz Mean-Variance weights, maximize your Sharpe ratio, and visualize the Efficient Frontier.
          </p>
        </div>
        <Link
          href="/app/wealth/optimizer"
          className="px-4 py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shrink-0"
        >
          Open MPT Optimizer
        </Link>
      </div>
    </div>
  );
}
