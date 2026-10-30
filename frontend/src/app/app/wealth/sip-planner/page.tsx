'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

export default function SIPPlannerPage() {
  const [monthlyAmount, setMonthlyAmount] = useState(10000);
  const [years, setYears] = useState(15);
  const [expectedReturn, setExpectedReturn] = useState(12.0);
  const [stepUpPct, setStepUpPct] = useState(10);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    apiClient.calculateSIP({
      monthly_amount: monthlyAmount,
      years,
      expected_return_pct: expectedReturn,
      step_up_pct: stepUpPct
    }).then(setResult);
  }, [monthlyAmount, years, expectedReturn, stepUpPct]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">SIP &amp; Step-Up Wealth Accumulation Planner</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Simulate Systematic Investment Plans with annual step-up compounding and wealth creation projections.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Input Parameters Box */}
        <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-4">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs border-b border-slate-100 dark:border-[#1b253b] pb-2">
            SIP Investment Parameters
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Monthly Investment</label>
              <span className="font-mono font-bold text-slate-900 dark:text-white">₹{monthlyAmount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={monthlyAmount}
              onChange={e => setMonthlyAmount(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Time Horizon</label>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={e => setYears(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Expected Annual CAGR</label>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min="4"
              max="25"
              step="0.5"
              value={expectedReturn}
              onChange={e => setExpectedReturn(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Annual Step-Up</label>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{stepUpPct}% / Year</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={stepUpPct}
              onChange={e => setStepUpPct(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Projection Scorecard & Breakdown */}
        <div className="lg:col-span-2 space-y-3">
          {result && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
                <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-sans">Total Invested Capital</div>
                  <div className="font-bold text-base text-slate-800 dark:text-slate-200">
                    ₹{result.total_invested?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-sans">Estimated Wealth Gain</div>
                  <div className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    +₹{result.wealth_gain?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
                  <div className="text-[10px] text-slate-400 font-sans">Future Maturity Value</div>
                  <div className="font-bold text-base text-blue-600 dark:text-blue-400">
                    ₹{result.maturity_corpus?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400">
                    Invested: <b className="text-slate-800 dark:text-slate-200 font-mono">
                      {Math.round((result.total_invested / result.maturity_corpus) * 100)}%
                    </b>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Wealth Gain: <b className="font-mono">
                      {Math.round((result.wealth_gain / result.maturity_corpus) * 100)}%
                    </b>
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(result.total_invested / result.maturity_corpus) * 100}%` }}
                    title="Invested"
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(result.wealth_gain / result.maturity_corpus) * 100}%` }}
                    title="Gains"
                  />
                </div>
              </div>

              {/* Milestone Breakdown Table */}
              <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
                  Annual Wealth Accumulation Milestones
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-[11px] font-mono">
                    <thead className="bg-slate-50 dark:bg-[#070b14] text-slate-500 font-sans border-b border-slate-200 dark:border-[#1b253b] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Year</th>
                        <th className="py-2 px-3">Invested (₹)</th>
                        <th className="py-2 px-3 text-emerald-600 dark:text-emerald-400">Wealth Gain (₹)</th>
                        <th className="py-2 px-3 text-blue-600 dark:text-blue-400">Corpus (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
                      {result.breakdown?.map((b: any) => (
                        <tr key={b.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-1.5 px-3 font-sans font-semibold">Year {b.year}</td>
                          <td className="py-1.5 px-3 text-slate-700 dark:text-slate-300">₹{b.invested.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">+₹{b.wealthGain.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-3 text-blue-600 dark:text-blue-400 font-bold">₹{b.totalCorpus.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
