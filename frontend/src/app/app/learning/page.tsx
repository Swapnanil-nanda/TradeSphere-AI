'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap, BookOpen, CheckCircle2, ShieldCheck, ArrowRight,
  Award, HelpCircle, Video, ExternalLink, PlayCircle, Sparkles,
  Layers, BarChart3, TrendingUp, Compass, Cpu, Wallet
} from 'lucide-react';
import {
  FREE_EXTERNAL_RESOURCES,
  PLATFORM_FEATURE_GUIDES,
  ExternalResource
} from '../../../lib/academy-data';

interface LearningTrack {
  id: string;
  name: string;
  tier: 'Tier 1 — Beginner' | 'Tier 2 — Active Trader' | 'Tier 3 — Pro Quant';
  badgeColor: string;
  description: string;
  duration: string;
  prerequisites: string;
  modules: { title: string; desc: string; link: string }[];
}

export default function TraderAcademyOverviewPage() {
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({
    'trk-1-m1': true,
    'trk-1-m2': true
  });

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const learningTracks: LearningTrack[] = [
    {
      id: 'trk-1',
      name: 'Tier 1: Beginner Foundations & Risk Capital',
      tier: 'Tier 1 — Beginner',
      badgeColor: 'text-[#35C69A] bg-[#35C69A]/15 border-[#35C69A]/30',
      description: 'Master the non-negotiable fundamentals: order types, bid/ask spreads, market mechanics, and the mandatory 1.0% account risk rule.',
      duration: '45 mins • 3 Modules',
      prerequisites: 'Zero prior experience required',
      modules: [
        {
          title: 'Module 1: Market Mechanics & Order Execution',
          desc: 'Understand Bids, Asks, Spreads, Market orders vs Limit orders, and order queue priority.',
          link: '/app/paper-trading'
        },
        {
          title: 'Module 2: The 1.0% Rule & Capital Preservation',
          desc: 'Why position size must be derived from Stop-Loss distance, not available cash. Sizing to zero on risk breach.',
          link: '/app/risk'
        },
        {
          title: 'Module 3: Systematic Trend Following with 20-EMA',
          desc: 'Using the 20-period Exponential Moving Average as dynamic support, resistance, and equilibrium.',
          link: '/app/charts'
        }
      ]
    },
    {
      id: 'trk-2',
      name: 'Tier 2: Active Trader & Market Microstructure',
      tier: 'Tier 2 — Active Trader',
      badgeColor: 'text-[#2979FF] bg-[#2979FF]/15 border-[#2979FF]/30',
      description: 'Learn multi-timeframe confirmation, session VWAP equilibrium, Bracket OCO child execution, and Level 2 DOM order books.',
      duration: '1 hr 15 mins • 3 Modules',
      prerequisites: 'Completion of Beginner Foundations',
      modules: [
        {
          title: 'Module 4: Bracket OCO State Machine Architecture',
          desc: 'Automating synchronized Take-Profit and Stop-Loss orders; child-leg cancellation mechanics.',
          link: '/app/paper-trading'
        },
        {
          title: 'Module 5: 20-Level Depth of Market (DOM) Order Flow',
          desc: 'Reading bid/ask queues 20 levels deep to spot institutional liquidity walls and depth imbalances.',
          link: '/app/risk/depth'
        },
        {
          title: 'Module 6: Trade Journaling & Psychological Tilt Defense',
          desc: 'Auditing R-multiples, profit factor, win rates, and preventing post-loss revenge trading.',
          link: '/app/risk/journal'
        }
      ]
    },
    {
      id: 'trk-3',
      name: 'Tier 3: Quantitative Options & Modern Portfolio Theory',
      tier: 'Tier 3 — Pro Quant',
      badgeColor: 'text-[#D8AB5E] bg-[#D8AB5E]/15 border-[#D8AB5E]/30',
      description: 'Black-Scholes-Merton derivatives pricing, Greeks partial derivatives, multi-leg payoff geometry, and Markowitz portfolio optimization.',
      duration: '2 hrs • 4 Modules',
      prerequisites: 'Comfort with basic statistics and algebra',
      modules: [
        {
          title: 'Module 7: Black-Scholes Greeks & Volatility Surface',
          desc: 'Analytical derivation of Delta, Gamma curvature, Theta decay, Vega, and Newton-Raphson IV solver.',
          link: '/app/risk/greeks'
        },
        {
          title: 'Module 8: Multi-Leg Payoff Geometry & Spreads',
          desc: 'Designing Bull Call Spreads, Straddles, and Iron Condors with defined risk, breakevens, and POP %.',
          link: '/app/risk/payoff'
        },
        {
          title: 'Module 9: Markowitz MPT & Efficient Frontier',
          desc: 'Dirichlet covariance sampling, Tangency (Max Sharpe) portfolio, and cross-border Indo-US diversification.',
          link: '/app/wealth/optimizer'
        },
        {
          title: 'Module 10: Stochastic Monte Carlo Fan Charting',
          desc: 'Simulating 350 geometric Brownian motion paths to stress-test P95 Bull and P5 Bear horizons.',
          link: '/app/wealth/scenarios'
        }
      ]
    }
  ];

  const toggleModule = (id: string) => {
    setCompletedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalModCount = learningTracks.reduce((acc, t) => acc + t.modules.length, 0);
  const completedModCount = Object.values(completedModules).filter(Boolean).length;
  const overallProgress = Math.round((completedModCount / totalModCount) * 100);

  const filteredResources = activeCategory === 'ALL'
    ? FREE_EXTERNAL_RESOURCES
    : FREE_EXTERNAL_RESOURCES.filter(r => r.category === activeCategory);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#E7EDF3]">
      {/* Academy Hero Header */}
      <div className="bg-[#0D131A] p-5 rounded-xl border border-[#25313D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Trader Academy &amp; Quantitative Education
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                100% FREE &amp; OPEN
              </span>
            </div>
            <p className="text-xs text-[#8B99A8] mt-1 max-w-2xl">
              Zero-cost institutional curriculum bridging financial theory, quantitative derivatives, and hands-on simulated execution across all 23 platform instruments.
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-[#111922] border border-[#25313D] px-4 py-2.5 rounded-xl flex items-center gap-4 shrink-0">
          <div className="text-right font-mono">
            <span className="text-[10px] text-[#8B99A8] block font-sans">Overall Mastery</span>
            <span className="text-sm font-bold text-white">{completedModCount} / {totalModCount} Modules</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#2979FF] flex items-center justify-center font-mono font-bold text-xs text-[#2979FF]">
            {overallProgress}%
          </div>
        </div>
      </div>

      {/* Navigation Tabs to Academy Sub-sections */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/app/learning/guide"
          className="p-3.5 bg-[#111922] hover:bg-[#151F29] border border-[#25313D] hover:border-[#2979FF]/40 rounded-xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#2979FF]" />
            <div>
              <span className="text-xs font-bold text-white block">Platform Feature Guides &amp; FAQ</span>
              <span className="text-[11px] text-[#8B99A8]">Step-by-step documentation for every feature</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8B99A8] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/app/learning/quizzes"
          className="p-3.5 bg-[#111922] hover:bg-[#151F29] border border-[#25313D] hover:border-[#35C69A]/40 rounded-xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#35C69A]" />
            <div>
              <span className="text-xs font-bold text-white block">Interactive Academy Quizzes</span>
              <span className="text-[11px] text-[#8B99A8]">Test knowledge across 5 categories</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8B99A8] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/app/learning/strategies"
          className="p-3.5 bg-[#111922] hover:bg-[#151F29] border border-[#25313D] hover:border-[#D8AB5E]/40 rounded-xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <PlayCircle className="w-4 h-4 text-[#D8AB5E]" />
            <div>
              <span className="text-xs font-bold text-white block">Practical Trading Exercises</span>
              <span className="text-[11px] text-[#8B99A8]">Hands-on interactive scenarios &amp; rulebooks</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#8B99A8] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Progressive Complexity Learning Pathways */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 font-sans">
            <Compass className="w-4 h-4 text-[#2979FF]" />
            <span>Progressive Learning Pathways (Tier 1 → Tier 3)</span>
          </h2>
          <span className="text-[11px] text-[#8B99A8] font-mono">ADAPTIVE PROGRESSIVE COMPLEXITY</span>
        </div>

        <div className="space-y-4">
          {learningTracks.map((track) => (
            <div key={track.id} className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#25313D]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-mono ${track.badgeColor}`}>
                      {track.tier}
                    </span>
                    <h3 className="text-sm font-bold text-white">{track.name}</h3>
                  </div>
                  <p className="text-xs text-[#8B99A8] mt-1">{track.description}</p>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-[#8B99A8] shrink-0">
                  <span>{track.duration}</span>
                </div>
              </div>

              {/* Modules List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {track.modules.map((m, mIdx) => {
                  const modKey = `${track.id}-m${mIdx + 1}`;
                  const isDone = !!completedModules[modKey];

                  return (
                    <div
                      key={mIdx}
                      className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                        isDone
                          ? 'bg-[#0D131A] border-[#35C69A]/30'
                          : 'bg-[#0D131A] border-[#25313D] hover:border-[#2979FF]/40'
                      }`}
                    >
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#8B99A8]">0{mIdx + 1}</span>
                          <button
                            onClick={() => toggleModule(modKey)}
                            className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                              isDone
                                ? 'bg-[#35C69A]/15 text-[#35C69A]'
                                : 'bg-[#151F29] text-[#8B99A8] hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isDone ? 'Done' : 'Mark'}</span>
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-white">{m.title}</h4>
                        <p className="text-[11px] text-[#8B99A8] leading-relaxed">{m.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-[#25313D]/50 flex justify-end">
                        <Link
                          href={m.link}
                          className="text-[11px] font-semibold text-[#2979FF] hover:text-[#5CA0FF] flex items-center gap-1 transition-colors"
                        >
                          <span>Practice Live</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Free Best External Resources & Video Series */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 font-sans">
              <Video className="w-4 h-4 text-[#D8AB5E]" />
              <span>Curated Free External Masterclasses &amp; Video Series</span>
            </h2>
            <p className="text-xs text-[#8B99A8]">
              The highest quality free courses, university lectures, and video series across global institutions.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
            {['ALL', 'BEGINNER', 'OPTIONS', 'QUANT', 'WEALTH'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#2979FF] text-white border-[#2979FF] font-bold'
                    : 'bg-[#111922] text-[#8B99A8] border-[#25313D] hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-[#111922] border border-[#25313D] rounded-xl p-4 shadow-sm hover:border-[#25313D]/80 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0D131A] text-[#2979FF] border border-[#25313D] font-mono">
                    {res.category} • {res.type}
                  </span>
                  <span className="text-[10px] text-[#8B99A8] font-mono">{res.duration}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-white">{res.title}</h3>
                <span className="text-[11px] text-[#D8AB5E] font-medium block">by {res.provider}</span>
                <p className="text-xs text-[#8B99A8] leading-relaxed">{res.description}</p>
              </div>

              <div className="pt-3 border-t border-[#25313D] mt-3 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#35C69A] font-mono font-medium">{res.highlight}</span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0D131A] hover:bg-[#151F29] border border-[#25313D] text-[#2979FF] font-bold text-[11px] transition-colors"
                >
                  <span>Open Free Resource</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
