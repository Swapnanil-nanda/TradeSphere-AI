import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Heart, ArrowRight, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Our Mission — TradeSphere AI',
  description: 'Democratizing institutional trading and risk analytics on a $0 budget for retail traders and students.'
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 select-none">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
          Our Mission &amp; Philosophy
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Democratizing Institutional Trading Tools on a $0 Budget.
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Built for students, aspiring quants, and retail traders in India who refuse to be exit liquidity for algorithms and predatory financial influencers.
        </p>
      </div>

      {/* Origin & Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white">100% Free Forever</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            TradeSphere AI was engineered on a ₹0 student budget using free, self-hosted technologies. We believe foundational trading education and risk sandboxes should never be locked behind expensive paywalls or broker kickbacks.
          </p>
        </div>

        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Risk-First Architecture</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Most trading platforms encourage hyperactive over-trading because brokers profit from transaction volume. TradeSphere AI inverts this: our Pre-Trade Risk Gatekeeper actively blocks reckless trades and enforces account survival rules.
          </p>
        </div>

        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">24/7 Zero-Key Autonomy</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            No expensive exchange API feeds required. With our built-in Geometric Brownian Motion (GBM) tick generator, learners can practice order execution, options pricing, and risk management 24 hours a day, 365 days a year.
          </p>
        </div>
      </div>

      {/* Target Personas */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-3xl p-8 sm:p-12 space-y-6">
        <h2 className="text-2xl font-bold text-white">Who TradeSphere AI is Built For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070b14] p-5 rounded-xl border border-[#1b253b] space-y-2">
            <span className="text-xs font-bold text-blue-400">BEGINNERS</span>
            <h4 className="text-white font-bold text-sm">Learning Without Financial Ruin</h4>
            <p className="text-slate-400 text-xs">
              Students and novice traders who want to build real chart-reading and risk-sizing habits without losing real money to emotional mistakes.
            </p>
          </div>
          <div className="bg-[#070b14] p-5 rounded-xl border border-[#1b253b] space-y-2">
            <span className="text-xs font-bold text-emerald-400">INTERMEDIATE TRADERS</span>
            <h4 className="text-white font-bold text-sm">Discipline &amp; Tilt Elimination</h4>
            <p className="text-slate-400 text-xs">
              Retail traders battling revenge trading, lack of stop-loss adherence, and inconsistent position sizing.
            </p>
          </div>
          <div className="bg-[#070b14] p-5 rounded-xl border border-[#1b253b] space-y-2">
            <span className="text-xs font-bold text-indigo-400">QUANTITATIVE ENTHUSIASTS</span>
            <h4 className="text-white font-bold text-sm">Derivatives &amp; Microstructure</h4>
            <p className="text-slate-400 text-xs">
              Engineering and finance students studying Black-Scholes Greeks, Level 2 order books, and vectorized algorithmic backtesting.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-white">Experience the platform today</h3>
        <Link
          href="/terminal"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all"
        >
          <span>Launch Paper Trading Terminal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
