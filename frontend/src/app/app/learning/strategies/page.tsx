'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Lightbulb, Code, ShieldCheck, CheckCircle2, TrendingUp, Zap,
  Layers, ArrowRight, PlayCircle, Eye, EyeOff, BookOpen, Compass
} from 'lucide-react';
import {
  PRACTICAL_EXERCISES,
  PracticalExercise
} from '../../../../lib/academy-data';

interface StrategyPlaybook {
  title: string;
  category: string;
  math: string;
  desc: string;
  rules: string[];
  bestRegime: string;
  relatedTool: string;
  relatedToolRoute: string;
}

export default function PracticalExercisesPage() {
  const [activeTab, setActiveTab] = useState<'EXERCISES' | 'PLAYBOOKS'>('EXERCISES');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setRevealedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHints = (id: string) => {
    setRevealedHints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const playbooks: StrategyPlaybook[] = [
    {
      title: 'Mean Reversion & Bollinger Band Z-Scores',
      category: 'Statistical Arbitrage',
      math: 'Z_t = (Price_t - SMA(20)) / StdDev(20)',
      desc: 'Exploits statistical overextensions in liquid large-cap equities. Enters long when Z < -2.0 with RSI(14) < 32 confirmation, targeting equilibrium reversion back to the 20-period mean / VWAP.',
      rules: [
        'Entry Condition: Candle closes below lower Bollinger Band (Z <= -2.0) with RSI <= 32.',
        'Stop-Loss Invariant: Hard Stop placed exactly 1.5 × ATR below the swing pivot low.',
        'Sizing Gatekeeper: Max loss capped strictly at 1.0% of account equity.',
        'Take-Profit Exit: 50% closed at session VWAP; 50% trailed along rising 20-EMA.'
      ],
      bestRegime: 'High-liquidity range-bound consolidation regimes',
      relatedTool: 'Interactive Charting & Indicators',
      relatedToolRoute: '/app/charts'
    },
    {
      title: 'Multi-Timeframe Trend Following (20-EMA & VWAP)',
      category: 'Momentum Trend',
      math: 'Trend = Price(Daily) > EMA(20) & Price(15m) > VWAP',
      desc: 'Aligns lower-timeframe intraday execution with macro daily trend momentum. Prevents counter-trend fighting and ensures high probability momentum continuation.',
      rules: [
        'Higher Timeframe Filter: Daily price holding above upward-sloping 20-EMA.',
        'Intraday Trigger: 15-minute pullback testing rising session VWAP support.',
        'Bracket OCO Execution: Take-profit target set at minimum 2.0R with hard stop-loss below pullback low.',
        'OCO Child Cancellation: If target triggers, stop-loss child leg is canceled immediately.'
      ],
      bestRegime: 'Strong directional macro trend days',
      relatedTool: 'Paper Trading Terminal',
      relatedToolRoute: '/app/paper-trading'
    },
    {
      title: 'Delta-Neutral Iron Condor Options Selling',
      category: 'Options Quantitative',
      math: 'Net Delta ≈ 0, Long Theta (Positive Time Decay)',
      desc: 'Non-directional strategy designed for range-bound volatility regimes. Sells out-of-the-money Call & Put spreads while buying wings to strictly define maximum risk.',
      rules: [
        'Sell 16-Delta OTM Call & Put (approx 1 StdDev out from spot price).',
        'Buy protective 5-Delta outer wings for defined risk cap.',
        'Verify total margin and max loss do not exceed 1.0% account risk budget.',
        'Profit Target: Close position when 50% of maximum credit is captured or at 21 DTE.'
      ],
      bestRegime: 'Elevated Implied Volatility (IV Rank > 50) expecting mean-reversion',
      relatedTool: 'Options Strategy Payoff Modeler',
      relatedToolRoute: '/app/risk/payoff'
    },
    {
      title: 'Markowitz Efficient Portfolio Allocation',
      category: 'Modern Portfolio Theory',
      math: 'Max Sharpe = (μ_p - R_f) / σ_p',
      desc: 'Solves quadratic mean-variance weights across Indian and US equities to maximize returns while dampening drawdowns via sector and cross-border currency diversification.',
      rules: [
        'Select 4 to 8 uncorrelated instruments across Indian energy, banking, and US tech.',
        'Set Risk-Free Rate benchmark (6.5% INR or 4.5% USD).',
        'Rebalance when individual asset weight drifts by more than 5% from target.',
        'Stress-test downside via 350-path Monte Carlo fan chart before capital deployment.'
      ],
      bestRegime: 'Multi-year strategic wealth compounding',
      relatedTool: 'MPT Portfolio Optimizer',
      relatedToolRoute: '/app/wealth/optimizer'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#E7EDF3]">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-5 rounded-xl border border-[#25313D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#D8AB5E]/10 text-[#D8AB5E] border border-[#D8AB5E]/30 flex items-center justify-center font-bold">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Practical Exercises &amp; Strategy Playbooks
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                HANDS-ON SIMULATION
              </span>
            </div>
            <p className="text-xs text-[#8B99A8] mt-1">
              Apply theoretical knowledge to solve real trading scenarios, calculate exact position sizes, and launch live simulated setups.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#111922] p-1 rounded-xl border border-[#25313D] self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('EXERCISES')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'EXERCISES'
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'text-[#8B99A8] hover:text-white'
            }`}
          >
            Practical Exercises ({PRACTICAL_EXERCISES.length})
          </button>
          <button
            onClick={() => setActiveTab('PLAYBOOKS')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'PLAYBOOKS'
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'text-[#8B99A8] hover:text-white'
            }`}
          >
            Strategy Playbooks ({playbooks.length})
          </button>
        </div>
      </div>

      {activeTab === 'EXERCISES' ? (
        /* PRACTICAL EXERCISES TAB */
        <div className="space-y-4">
          {PRACTICAL_EXERCISES.map((ex, idx) => {
            const isSolutionOpen = !!revealedSolutions[ex.id];
            const isHintsOpen = !!revealedHints[ex.id];

            return (
              <div
                key={ex.id}
                className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#25313D]/80 transition-all"
              >
                {/* Exercise Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#25313D]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#2979FF]/15 text-[#2979FF] font-mono font-bold text-xs flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-white">{ex.title}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0D131A] text-[#D8AB5E] border border-[#25313D] font-mono">
                      {ex.difficulty}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#8B99A8] font-mono">
                    Target Tool: <b className="text-white">{ex.targetFeature}</b>
                  </span>
                </div>

                {/* Scenario Description */}
                <div className="space-y-2">
                  <div className="p-3 bg-[#0D131A] rounded-lg border border-[#25313D] space-y-1">
                    <span className="text-[10px] font-bold text-[#8B99A8] uppercase tracking-wider font-mono">
                      Market Scenario:
                    </span>
                    <p className="text-xs text-[#E7EDF3] leading-relaxed">
                      {ex.scenario}
                    </p>
                  </div>

                  <div className="p-3 bg-[#0D131A] rounded-lg border border-[#25313D] space-y-1">
                    <span className="text-[10px] font-bold text-[#2979FF] uppercase tracking-wider font-mono">
                      Your Objective:
                    </span>
                    <p className="text-xs text-white font-medium leading-relaxed">
                      {ex.task}
                    </p>
                  </div>
                </div>

                {/* Hints Accordion */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleHints(ex.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#D8AB5E] font-semibold hover:text-[#FFE3A0] transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{isHintsOpen ? 'Hide Calculation Hints' : 'Show Calculation Hints (3)'}</span>
                  </button>

                  {isHintsOpen && (
                    <div className="p-3 bg-[#0D131A] border border-[#D8AB5E]/30 rounded-lg space-y-1.5 text-xs text-[#8B99A8]">
                      {ex.hints.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2">
                          <span className="text-[#D8AB5E] font-bold font-mono">•</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Solution Reveal & Launch Row */}
                <div className="pt-2 border-t border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={() => toggleSolution(ex.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D131A] hover:bg-[#151F29] border border-[#25313D] text-xs font-bold text-white transition-colors self-start"
                  >
                    {isSolutionOpen ? <EyeOff className="w-3.5 h-3.5 text-[#8B99A8]" /> : <Eye className="w-3.5 h-3.5 text-[#35C69A]" />}
                    <span>{isSolutionOpen ? 'Hide Verified Solution' : 'Reveal Verified Solution'}</span>
                  </button>

                  <Link
                    href={ex.featureRoute}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
                  >
                    <span>Launch &amp; Practice Live in TradeSphere AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Solution Output Box */}
                {isSolutionOpen && (
                  <div className="p-3.5 bg-[#35C69A]/10 border border-[#35C69A]/30 rounded-lg text-xs leading-relaxed space-y-1">
                    <span className="font-bold text-[#35C69A] block font-mono">
                      ✓ Mathematical Solution &amp; Execution Logic:
                    </span>
                    <p className="text-[#E7EDF3]">{ex.solution}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* STRATEGY PLAYBOOKS TAB */
        <div className="space-y-4">
          {playbooks.map((pb, pbIdx) => (
            <div
              key={pbIdx}
              className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#25313D]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/25 font-mono">
                      {pb.category}
                    </span>
                    <h2 className="text-base font-bold text-white">{pb.title}</h2>
                  </div>
                  <span className="text-[11px] text-[#D8AB5E] mt-0.5 block">Best Regime: {pb.bestRegime}</span>
                </div>

                <code className="bg-[#0D131A] px-3 py-1 rounded border border-[#25313D] text-[#35C69A] font-mono text-xs self-start sm:self-auto">
                  {pb.math}
                </code>
              </div>

              <p className="text-xs text-[#8B99A8] leading-relaxed">
                {pb.desc}
              </p>

              {/* Rules Checklist */}
              <div className="p-3 bg-[#0D131A] rounded-lg border border-[#25313D] space-y-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono block">
                  Mandatory Execution Checklist:
                </span>
                <div className="space-y-1.5 text-xs text-[#E7EDF3]">
                  {pb.rules.map((rule, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#35C69A] shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-[#8B99A8] font-mono">
                  Integrated with: <b className="text-white">{pb.relatedTool}</b>
                </span>
                <Link
                  href={pb.relatedToolRoute}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold transition-colors"
                >
                  <span>Open {pb.relatedTool}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
