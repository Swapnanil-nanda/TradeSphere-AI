'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, CheckCircle2, Award, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';

export default function LearningPage() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 select-none">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
          TradeSphere Academy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Institutional Knowledge. 100% Free.
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          A zero-cost, curriculum-driven academy teaching risk mathematics, market microstructure, and quantitative options analysis.
        </p>
      </div>

      {/* Module Selector & Main Lesson Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Module Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Curriculum Modules</h3>
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
                  ? 'bg-blue-600/10 border-blue-500/40 text-white'
                  : 'bg-[#0c121f] border-[#1b253b] text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span className="text-[10px] font-bold text-blue-400 block mb-1">{m.tag}</span>
              <div className="font-bold text-sm text-white">{m.title}</div>
              <div className="text-[11px] text-slate-400 mt-1">{m.lessons.length} core lessons</div>
            </button>
          ))}
        </div>

        {/* Lesson Body */}
        <div className="lg:col-span-8 bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-[#1b253b] pb-4">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{currentMod.tag}</span>
            <h2 className="text-2xl font-black text-white mt-1">{currentMod.title}</h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Core Educational Brief:</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-[#070b14] p-4 rounded-xl border border-[#1b253b]">
              {currentMod.content}
            </p>
          </div>

          {/* Lessons list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Included Lessons in This Module:</h3>
            <div className="space-y-2">
              {currentMod.lessons.map((lesson, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#070b14] border border-[#1b253b] text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </div>
                  <span>{lesson}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Knowledge Check Quiz */}
          <div className="bg-gradient-to-tr from-slate-900 to-blue-950/40 p-5 rounded-xl border border-blue-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Knowledge Check</h4>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              If your account capital is ₹10,00,000, what is the maximum permissible risk allowed by TradeSphere AI on a single trade?
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
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-[#070b14] border-[#1b253b] text-slate-300 hover:bg-slate-800'
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
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
                >
                  Verify Answer
                </button>
                {quizSubmitted && (
                  <div className="text-xs flex items-center gap-1.5 font-bold">
                    {quizAnswer === 'opt2' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct! 1% of ₹10,00,000 is exactly ₹10,000 max single-trade risk.
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
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
              href="/terminal"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
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
