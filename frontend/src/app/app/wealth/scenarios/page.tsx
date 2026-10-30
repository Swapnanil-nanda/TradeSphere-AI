'use client';

import React, { useState } from 'react';
import { Target, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, HeartHandshake } from 'lucide-react';

interface ScenarioGoal {
  id: string;
  name: string;
  targetAmount: number;
  years: number;
  inflationPct: number;
  expectedReturnPct: number;
  desc: string;
}

export default function WealthScenariosPage() {
  const [selectedScenario, setSelectedScenario] = useState('fire');
  const [targetAmount, setTargetAmount] = useState(50000000); // ₹5 Crore
  const [years, setYears] = useState(15);
  const [inflation, setInflation] = useState(6.0);
  const [expectedReturn, setExpectedReturn] = useState(12.0);

  const presetScenarios: ScenarioGoal[] = [
    {
      id: 'fire',
      name: 'Financial Independence (F.I.R.E)',
      targetAmount: 50000000,
      years: 15,
      inflationPct: 6.0,
      expectedReturnPct: 12.0,
      desc: 'Build a perpetual passive income corpus allowing you to retire early and live off safe 4% withdrawal rate.'
    },
    {
      id: 'home',
      name: 'Luxury Home Down Payment',
      targetAmount: 15000000,
      years: 7,
      inflationPct: 5.5,
      expectedReturnPct: 11.5,
      desc: 'Accumulate a debt-free down payment buffer for prime real estate acquisition without liquidating emergency cash.'
    },
    {
      id: 'education',
      name: 'Ivy League / Global Higher Education',
      targetAmount: 20000000,
      years: 12,
      inflationPct: 7.0,
      expectedReturnPct: 12.5,
      desc: 'Protect against international tuition inflation and foreign exchange depreciation for premier education.'
    },
    {
      id: 'ten_cr',
      name: '₹10 Crore Ultra-High-Net-Worth Milestone',
      targetAmount: 100000000,
      years: 20,
      inflationPct: 6.0,
      expectedReturnPct: 13.0,
      desc: 'Institutional-scale long-term equity compounding achieving eight-figure net-worth milestone.'
    }
  ];

  const handleSelectPreset = (p: ScenarioGoal) => {
    setSelectedScenario(p.id);
    setTargetAmount(p.targetAmount);
    setYears(p.years);
    setInflation(p.inflationPct);
    setExpectedReturn(p.expectedReturnPct);
  };

  // Math Calculations:
  // Inflation adjusted future value: FV = Target * (1 + inflation)^years
  const inflationAdjustedGoal = Math.round(targetAmount * Math.pow(1 + inflation / 100, years));

  // Required monthly savings using annuity formula:
  // FV = PMT * [ ((1 + r)^n - 1) / r ]
  const r = (expectedReturn / 100) / 12;
  const n = years * 12;
  const requiredMonthly = Math.round((inflationAdjustedGoal * r) / (Math.pow(1 + r, n) - 1));
  const totalInvested = requiredMonthly * n;
  const wealthGain = inflationAdjustedGoal - totalInvested;

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Goal-Based Wealth Scenario Modeler</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Simulate life goals, inflation adjustments, and required monthly investment trajectories.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {presetScenarios.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              selectedScenario === p.id
                ? 'bg-blue-50/60 dark:bg-blue-600/10 border-blue-600 dark:border-blue-500 shadow-2xs'
                : 'bg-white dark:bg-[#0c121f] border-slate-200 dark:border-[#1b253b] hover:border-slate-300'
            }`}
          >
            <div className="font-bold text-slate-900 dark:text-white text-xs mb-1">{p.name}</div>
            <div className="font-mono text-blue-600 dark:text-blue-400 font-bold text-[11px] mb-1">
              ₹{(p.targetAmount / 10000000).toFixed(1)} Cr in {p.years}Y
            </div>
            <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Controls */}
        <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-3.5">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-xs border-b border-slate-100 dark:border-[#1b253b] pb-2">
            Target Scenario Parameters
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Today&apos;s Target Goal Value (₹)</label>
            <input
              type="number"
              step="500000"
              value={targetAmount}
              onChange={e => setTargetAmount(parseInt(e.target.value, 10) || 1000000)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Years to Goal ({years} Years)</label>
            <input
              type="range"
              min="1"
              max="35"
              value={years}
              onChange={e => setYears(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Estimated Annual Inflation ({inflation}%)</label>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={inflation}
              onChange={e => setInflation(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-500 font-semibold block mb-1">Expected Portfolio Return ({expectedReturn}%)</label>
            <input
              type="range"
              min="6"
              max="20"
              step="0.5"
              value={expectedReturn}
              onChange={e => setExpectedReturn(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Results Cards */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-1">
              <div className="text-[10px] text-slate-400 font-sans">Required Monthly Investment</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                ₹{requiredMonthly.toLocaleString('en-IN')} / mo
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                To reach target comfortably in {years} years.
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-1">
              <div className="text-[10px] text-slate-400 font-sans">Inflation-Adjusted Target Goal</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                ₹{inflationAdjustedGoal.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                Factoring in {inflation}% annual cost-of-living inflation.
              </div>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs space-y-3">
            <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Scenario Capital Dynamics</div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[10px] text-slate-400 font-sans">Total Self-Funded Principal</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{totalInvested.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
                <div className="text-[10px] text-slate-400 font-sans">Compound Interest Generated</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                  +₹{wealthGain.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <strong>Compounding Multiplier: </strong> 
              Every ₹1.00 you invest in this scenario generates approximately 
              <b className="text-blue-600 dark:text-blue-400"> ₹{(wealthGain / totalInvested).toFixed(2)}</b> in passive compound interest gains.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
