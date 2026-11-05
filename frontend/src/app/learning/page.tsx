'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, ShieldCheck, CheckCircle2, Award, ArrowRight,
  HelpCircle, AlertCircle, Video, PlayCircle, BookCheck, ExternalLink
} from 'lucide-react';
import { FREE_EXTERNAL_RESOURCES } from '../../lib/academy-data';

export default function PublicLearningPage() {
  const [activeModule, setActiveModule] = useState('risk-basics');
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const modules = [
    {
      id: 'risk-basics',
      tag: 'FOUNDATION',
      title: 'Risk Management & Capital Preservation',
      lessons: [
        'The 1% Rule: Why Single-Trade Risk Must Never Exceed 1.0%',
        'Calculating Position Size: (Equity × 1%) ÷ (Entry - StopLoss)',
        'Understanding Asymmetric Risk-to-Reward (R:R ≥ 1.5)',
        'The 3% Daily Drawdown Circuit Breaker & Overcoming Revenge Tilt'
      ],
      content: `The single biggest reason novice traders fail in the stock and options market is not bad entry timing—it is inadequate risk control. 
      If you risk 10% on every trade, a normal 5-trade losing streak wipes out over 40% of your account. 
      However, with the 1.0% single-trade risk invariant, a 5-trade losing streak only reduces your capital by ~4.9%, keeping you mathematically in the game.`
    },
    {
      id: 'market-structure',
      tag: 'PRICE ACTION',
      title: 'Technical Market Structure & VWAP',
      lessons: [
        'Volume-Weighted Average Price (VWAP) as Institutional Equilibrium',
        '20-Period Exponential Moving Average (EMA) Dynamic Trend Filter',
        'Identifying High-Volume Nodes & Support/Resistance Zones',
        'Distinguishing Trending Days from Mean-Reverting Consolidations'
      ],
      content: `Market structure is the study of how price auctions through liquidity. When price is above VWAP and the 20-EMA is sloping upward, institutions are net buyers. 
      Trading in alignment with market structure prevents you from shorting into institutional accumulation or catching falling knives.`
    },
    {
      id: 'options-mastery',
      tag: 'QUANTITATIVE',
      title: 'Options Greeks & Volatility Surface',
      lessons: [
        'Black-Scholes-Merton Pricing Model Fundamentals',
        'Delta (Δ) & Gamma (Γ): Directional and Acceleration Sensitivity',
        'Theta (Θ) Decay: Time Value Dynamics in 0-DTE vs Weekly Contracts',
        'Implied Volatility (IV) via Newton-Raphson & Volatility Crush'
      ],
      content: `Options are non-linear financial contracts. Buying out-of-the-money (OTM) options without understanding Theta decay and Implied Volatility crush is why retail option buyers lose 90%+ of their capital. 
      Mastering Black-Scholes Greeks allows you to price options theoretically and identify mispriced risk.`
    }
  ];

  const currentMod = modules.find(m => m.id === activeModule) || modules[0];

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 select-none text-[#E7EDF3]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#2979FF] uppercase tracking-widest bg-[#2979FF]/10 border border-[#2979FF]/20 px-3 py-1 rounded-full font-mono">
          TradeSphere Academy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Institutional Knowledge. 100% Free.
        </h1>
        <p className="text-[#8B99A8] text-xs sm:text-sm">
          A zero-cost, curriculum-driven academy teaching risk mathematics, market microstructure, and quantitative options analysis across all 23 platform instruments.
        </p>

        {/* Quick Sub-Section Badges */}
        <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs font-mono">
          <Link
            href="/app/learning"
            className="px-3.5 py-1.5 rounded-xl bg-[#111922] hover:bg-[#151F29] border border-[#25313D] text-[#2979FF] font-bold flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Academy</span>
          </Link>

          <Link
            href="/app/learning/guide"
            className="px-3.5 py-1.5 rounded-xl bg-[#111922] hover:bg-[#151F29] border border-[#25313D] text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <BookCheck className="w-3.5 h-3.5 text-[#35C69A]" />
            <span>Platform Guides &amp; FAQs</span>
          </Link>

          <Link
            href="/app/learning/quizzes"
            className="px-3.5 py-1.5 rounded-xl bg-[#111922] hover:bg-[#151F29] border border-[#25313D] text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-[#D8AB5E]" />
            <span>Academy Quizzes</span>
          </Link>

          <Link
            href="/app/learning/strategies"
            className="px-3.5 py-1.5 rounded-xl bg-[#111922] hover:bg-[#151F29] border border-[#25313D] text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-[#2979FF]" />
            <span>Trading Exercises</span>
          </Link>
        </div>
      </div>

      {/* Module Selector & Main Lesson Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Module Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-[#8B99A8] uppercase tracking-wider px-2 font-mono">Curriculum Modules</h3>
          {modules.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveModule(m.id);
                setQuizSubmitted(false);
                setQuizAnswer(null);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                activeModule === m.id
                  ? 'bg-[#2979FF]/10 border-[#2979FF]/40 text-white'
                  : 'bg-[#111922] border-[#25313D] text-[#8B99A8] hover:text-white hover:bg-[#151F29]'
              }`}
            >
              <span className="text-[10px] font-bold text-[#2979FF] block mb-1 font-mono">{m.tag}</span>
              <div className="font-bold text-sm text-white">{m.title}</div>
              <div className="text-[11px] text-[#8B99A8] mt-1">{m.lessons.length} core lessons</div>
            </button>
          ))}
        </div>

        {/* Lesson Body */}
        <div className="lg:col-span-8 bg-[#111922] border border-[#25313D] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#25313D] pb-4">
            <span className="text-[10px] font-bold text-[#2979FF] uppercase tracking-widest font-mono">{currentMod.tag}</span>
            <h2 className="text-2xl font-black text-white mt-1">{currentMod.title}</h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white">Core Educational Brief:</h3>
            <p className="text-[#8B99A8] text-xs sm:text-sm leading-relaxed bg-[#0D131A] p-4 rounded-xl border border-[#25313D]">
              {currentMod.content}
            </p>
          </div>

          {/* Lessons list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Included Lessons in This Module:</h3>
            <div className="space-y-2">
              {currentMod.lessons.map((lesson, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#0D131A] border border-[#25313D] text-xs text-[#E7EDF3]">
                  <div className="w-5 h-5 rounded-full bg-[#2979FF]/20 text-[#2979FF] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    {idx + 1}
                  </div>
                  <span>{lesson}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Knowledge Check Quiz */}
          <div className="bg-[#0D131A] p-5 rounded-xl border border-[#2979FF]/25 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#2979FF]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Quick Knowledge Check</h4>
            </div>

            <p className="text-xs text-[#E7EDF3] font-medium">
              If your account capital is ₹10,00,000, what is the maximum permissible single-trade risk allowed by TradeSphere AI?
            </p>

            <form onSubmit={handleQuizSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'opt1', label: 'A) ₹50,000 (5%)', correct: false },
                  { id: 'opt2', label: 'B) ₹10,000 (1%)', correct: true },
                  { id: 'opt3', label: 'C) ₹1,00,000 (10%)', correct: false }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setQuizAnswer(opt.id);
                      setQuizSubmitted(false);
                    }}
                    className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                      quizAnswer === opt.id
                        ? 'bg-[#2979FF] text-white border-[#2979FF]'
                        : 'bg-[#111922] border-[#25313D] text-[#8B99A8] hover:text-white hover:bg-[#151F29]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!quizAnswer}
                  className="px-4 py-2 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Verify Answer
                </button>
                {quizSubmitted && (
                  <div className="text-xs flex items-center gap-1.5 font-bold font-mono">
                    {quizAnswer === 'opt2' ? (
                      <span className="text-[#35C69A] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct! 1.0% of ₹10,00,000 is exactly ₹10,000 max single-trade risk.
                      </span>
                    ) : (
                      <span className="text-[#EF6468] flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> Incorrect. TradeSphere AI strictly caps risk at 1.0% (₹10,000).
                      </span>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/app/paper-trading"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2979FF] hover:text-[#5CA0FF]"
            >
              <span>Practice This In The Live Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
