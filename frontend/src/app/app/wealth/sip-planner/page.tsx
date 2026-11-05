'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck, Sparkles, PieChart } from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';
import { KNOWN_ASSET_PROFILES } from '../../../../lib/mpt-solver';

const ALL_ASSETS = Object.keys(KNOWN_ASSET_PROFILES);

function SIPPlannerContent() {
  const searchParams = useSearchParams();
  const initialScheme = searchParams.get('scheme');
  const initialSymbol = searchParams.get('symbol') || (initialScheme ? '' : 'RELIANCE');
  const initialCagr = parseFloat(searchParams.get('cagr') || '15.0');

  const [selectedAsset, setSelectedAsset] = useState(initialSymbol || 'RELIANCE');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [monthlyAmount, setMonthlyAmount] = useState(currency === 'INR' ? 10000 : 500);
  const [years, setYears] = useState(15);
  const [expectedReturn, setExpectedReturn] = useState(initialCagr);
  const [stepUpPct, setStepUpPct] = useState(10);
  const [inflationRate, setInflationRate] = useState(6.0);
  const [adjustInflation, setAdjustInflation] = useState(false);
  const [result, setResult] = useState<any>(null);

  const isUS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'].includes(selectedAsset);
  const curr = currency === 'INR' ? '₹' : '$';

  useEffect(() => {
    if (isUS && currency !== 'USD') {
      setCurrency('USD');
      setMonthlyAmount(500);
    } else if (!isUS && currency === 'USD' && !selectedAsset) {
      setCurrency('INR');
      setMonthlyAmount(10000);
    }
  }, [selectedAsset]);

  // Adjust return when asset changes
  const handleSelectAsset = (sym: string) => {
    setSelectedAsset(sym);
    const prof = KNOWN_ASSET_PROFILES[sym];
    if (prof) {
      setExpectedReturn(Number((prof.expectedReturn * 100).toFixed(1)));
    }
  };

  useEffect(() => {
    apiClient.calculateSIP({
      monthly_amount: monthlyAmount,
      years,
      expected_return_pct: expectedReturn,
      step_up_pct: stepUpPct
    }).then(res => {
      setResult(res);
    });
  }, [monthlyAmount, years, expectedReturn, stepUpPct]);

  const maturityCorpus = result?.maturity_corpus || 0;
  const totalInvested = result?.total_invested || 0;
  const wealthGain = result?.wealth_gain || 0;

  // Real purchasing power adjusted for inflation
  const realPurchasingPower = adjustInflation 
    ? Math.round(maturityCorpus / Math.pow(1 + inflationRate / 100, years)) 
    : maturityCorpus;

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#E7EDF3]">SIP &amp; Step-Up Wealth Accumulation Planner</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                  ANNUAL STEP-UP COMPOUNDING
                </span>
              </div>
              <p className="text-[#8B99A8] text-[11px]">
                Simulate Systematic Investment Plans (SIP) in equities or mutual funds with dynamic annual contribution step-ups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#0D131A] p-0.5 rounded-lg border border-[#25313D]">
              {(['INR', 'USD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    setMonthlyAmount(c === 'INR' ? 10000 : 500);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                    currency === c ? 'bg-[#2979FF] text-white' : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                  }`}
                >
                  {c === 'INR' ? '₹ INR' : '$ USD'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Input Parameters Box */}
        <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs space-y-4">
          <div className="font-bold text-xs border-b border-[#25313D] pb-2 uppercase tracking-wider font-mono text-[#E7EDF3]">
            SIP Investment Parameters
          </div>

          {/* Asset Accumulation Choice */}
          <div>
            <label className="text-[11px] text-[#8B99A8] font-semibold block mb-1">Target Instrument / Stock</label>
            <select
              value={selectedAsset}
              onChange={e => handleSelectAsset(e.target.value)}
              className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-2.5 py-1.5 font-mono text-[#E7EDF3] text-xs focus:outline-none focus:border-[#2979FF]"
            >
              {ALL_ASSETS.map(s => (
                <option key={s} value={s}>
                  {s} ({KNOWN_ASSET_PROFILES[s]?.name}) • Exp CAGR: {(KNOWN_ASSET_PROFILES[s]?.expectedReturn * 100).toFixed(0)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-[#8B99A8] font-semibold">Monthly Deposit ({curr})</label>
              <span className="font-mono font-bold text-[#E7EDF3]">{curr}{monthlyAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={currency === 'INR' ? 1000 : 50}
              max={currency === 'INR' ? 200000 : 10000}
              step={currency === 'INR' ? 1000 : 50}
              value={monthlyAmount}
              onChange={e => setMonthlyAmount(parseInt(e.target.value, 10))}
              className="w-full accent-[#2979FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-[#8B99A8] font-semibold">Time Horizon</label>
              <span className="font-mono font-bold text-[#E7EDF3]">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={e => setYears(parseInt(e.target.value, 10))}
              className="w-full accent-[#2979FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-[#8B99A8] font-semibold">Expected Annual CAGR</label>
              <span className="font-mono font-bold text-[#2979FF]">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min="4"
              max="30"
              step="0.5"
              value={expectedReturn}
              onChange={e => setExpectedReturn(parseFloat(e.target.value))}
              className="w-full accent-[#2979FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-[#8B99A8] font-semibold">Annual Step-Up (% / Year)</label>
              <span className="font-mono font-bold text-[#35C69A]">+{stepUpPct}% / Year</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={stepUpPct}
              onChange={e => setStepUpPct(parseInt(e.target.value, 10))}
              className="w-full accent-[#35C69A] cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-[#25313D] flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#8B99A8]">
              <input
                type="checkbox"
                checked={adjustInflation}
                onChange={e => setAdjustInflation(e.target.checked)}
                className="rounded accent-[#2979FF]"
              />
              <span>Adjust for {inflationRate}% Inflation</span>
            </label>
          </div>
        </div>

        {/* Results Summary and Visualization */}
        <div className="lg:col-span-2 space-y-3">
          {/* Headline Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
              <div className="text-[10px] text-[#8B99A8] font-sans">Total Capital Invested</div>
              <div className="font-bold text-base text-[#E7EDF3] mt-1">
                {curr}{totalInvested.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">
                Principal contributions
              </div>
            </div>

            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
              <div className="text-[10px] text-[#8B99A8] font-sans">Compounded Wealth Gain</div>
              <div className="font-bold text-base text-[#35C69A] mt-1">
                +{curr}{wealthGain.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#35C69A] font-sans mt-0.5">
                {totalInvested > 0 ? ((wealthGain / totalInvested) * 100).toFixed(0) : 0}% Wealth Multiplier
              </div>
            </div>

            <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
              <div className="text-[10px] text-[#8B99A8] font-sans">
                {adjustInflation ? 'Real Purchasing Power' : 'Maturity Future Value'}
              </div>
              <div className="font-bold text-base text-[#2979FF] mt-1">
                {curr}{realPurchasingPower.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">
                {adjustInflation ? `Inflation-adjusted (${inflationRate}%)` : 'Nominal maturity corpus'}
              </div>
            </div>
          </div>

          {/* Yearly Compounding Schedule Table */}
          {result?.breakdown && (
            <div className="bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs overflow-hidden">
              <div className="p-3 border-b border-[#25313D] flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider font-mono text-[#E7EDF3]">
                  {selectedAsset} Milestone Compounding Ledger
                </span>
                <span className="text-[10px] text-[#8B99A8] font-mono">
                  {years} Years • {stepUpPct}% Annual Step-Up
                </span>
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead className="bg-[#0D131A] text-[#8B99A8] font-sans border-b border-[#25313D] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Year</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Invested Principal</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-[#35C69A]">Wealth Gain</th>
                      <th className="py-2.5 px-3 font-semibold text-right text-[#2979FF]">Total Portfolio Corpus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25313D]">
                    {result.breakdown.map((row: any) => (
                      <tr key={row.year} className="hover:bg-[#151F29]/60 transition-colors">
                        <td className="py-2 px-3 font-semibold text-[#E7EDF3]">Year {row.year}</td>
                        <td className="py-2 px-3 text-right text-[#8B99A8]">{curr}{row.invested.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-[#35C69A] font-bold">+{curr}{row.wealthGain.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#E7EDF3] bg-[#151F29]/40">{curr}{row.totalCorpus.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SIPPlannerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Step-Up SIP Planner...</div>}>
      <SIPPlannerContent />
    </Suspense>
  );
}
