'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookCheck, ShieldCheck, CheckCircle2, ArrowRight,
  HelpCircle, Search, ExternalLink, ChevronDown, ChevronUp,
  Sliders, Layers, Activity, AlertTriangle, Video, Sparkles,
  Calculator, TrendingUp, TrendingDown, CheckSquare, RotateCcw,
  Lock, Zap, Award
} from 'lucide-react';
import {
  PLATFORM_FEATURE_GUIDES,
  PLATFORM_FAQS,
  PlatformFeatureGuide,
  PlatformFAQ
} from '../../../../lib/academy-data';

function GuideContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  const [activeTab, setActiveTab] = useState<'BASIC_TRACK' | 'FEATURES' | 'FAQS'>('BASIC_TRACK');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Step Completion Tracker for Basic Trader Track
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tradesphere_curriculum_progress');
      if (saved) setCompletedSteps(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const updated = { ...prev, [stepNumber]: !prev[stepNumber] };
      try {
        localStorage.setItem('tradesphere_curriculum_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Interactive Widget States for Step 2 (Risk Sizer)
  const [calcEquity, setCalcEquity] = useState(1000000);
  const [calcEntry, setCalcEntry] = useState(2985.4);
  const [calcStopLoss, setCalcStopLoss] = useState(2950.0);
  const [calcRiskPct, setCalcRiskPct] = useState(1.0);

  const maxRiskCash = (calcEquity * calcRiskPct) / 100;
  const riskPerShare = Math.max(0, calcEntry - calcStopLoss);
  const isBreach = riskPerShare > maxRiskCash;
  const safeQty = riskPerShare > 0 ? (isBreach ? 0 : Math.floor(maxRiskCash / riskPerShare)) : 0;
  const totalAllocated = safeQty * calcEntry;

  // Interactive Widget States for Step 3 (20-EMA Simulator)
  const [trendScenario, setTrendScenario] = useState<'bullish' | 'bearish' | 'reversion'>('bullish');

  // Interactive Widget States for Step 4 (Bracket OCO Simulator)
  const [ocoState, setOcoState] = useState<'ACTIVE' | 'TP_HIT' | 'SL_HIT'>('ACTIVE');

  // Interactive Widget States for Step 5 (Circuit Breaker Simulator)
  const [simulatedLoss, setSimulatedLoss] = useState(12000);
  const breakerThreshold = 30000; // 3% of 10L
  const isBreakerTripped = simulatedLoss >= breakerThreshold;

  // Filter feature guides
  const filteredGuides = useMemo(() => {
    return PLATFORM_FEATURE_GUIDES.filter(g => {
      const matchCat = selectedCategory === 'ALL' || g.category === selectedCategory;
      const matchQuery = !searchQuery ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.whatItDoes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return PLATFORM_FAQS.filter(f => {
      const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory || (selectedCategory === 'EXECUTION' && f.category === 'PAPER_TRADING');
      const matchQuery = !searchQuery ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(prev => (prev === id ? null : id));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#E7EDF3]">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-5 rounded-xl border border-[#25313D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30 flex items-center justify-center font-bold">
            <BookCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Guided Curriculum &amp; Platform Knowledge Base
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                INTERACTIVE TRACK
              </span>
            </div>
            <p className="text-xs text-[#8B99A8] mt-1">
              Structured step-by-step master tracks, embedded risk simulators, mathematical formulas, and verified educational video courses.
            </p>
          </div>
        </div>

        {/* 3 Nav Tabs */}
        <div className="flex bg-[#111922] p-1 rounded-xl border border-[#25313D] self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('BASIC_TRACK')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'BASIC_TRACK'
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'text-[#8B99A8] hover:text-white'
            }`}
          >
            Basic Trader Pathway (5 Steps)
          </button>
          <button
            onClick={() => setActiveTab('FEATURES')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'FEATURES'
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'text-[#8B99A8] hover:text-white'
            }`}
          >
            Feature Guides ({PLATFORM_FEATURE_GUIDES.length})
          </button>
          <button
            onClick={() => setActiveTab('FAQS')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'FAQS'
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'text-[#8B99A8] hover:text-white'
            }`}
          >
            Platform FAQs ({PLATFORM_FAQS.length})
          </button>
        </div>
      </div>

      {/* TAB 1: BASIC TRADER PATHWAY: 5-STEP GUIDED STRUCTURE */}
      {activeTab === 'BASIC_TRACK' && (
        <div className="space-y-6">
          {/* Progress Header Card */}
          <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#35C69A] animate-pulse" />
                <span className="font-mono text-xs font-bold text-[#35C69A] uppercase tracking-wider">
                  Tier 1 — Basic Trader Pathway
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Core Trading Foundations &amp; Platform Execution
              </h2>
              <p className="text-xs text-[#8B99A8]">
                Master the five non-negotiable disciplines of professional trading before advancing to Tier 2 Active Trader.
              </p>
            </div>

            {/* Progress Badge */}
            <div className="bg-[#111922] px-4 py-3 rounded-xl border border-[#25313D] flex items-center gap-3 shrink-0 font-mono">
              <div>
                <span className="text-[10px] text-[#8B99A8] block">Pathway Completion</span>
                <span className="text-base font-extrabold text-white">
                  {completedCount} / 5 Steps ({Math.round((completedCount / 5) * 100)}%)
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#2979FF] flex items-center justify-center font-bold text-xs text-[#2979FF]">
                {completedCount === 5 ? '✓' : `${completedCount}/5`}
              </div>
            </div>
          </div>

          {/* STEP 1: ORDER TYPES & MATCHING */}
          <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25313D] gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#2979FF]/15 text-[#2979FF] border border-[#2979FF]/30 font-mono font-bold flex items-center justify-center text-xs">
                  01
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Step 1: Order Mechanics — Market vs Limit vs Stop-Loss
                  </h3>
                  <span className="text-[11px] text-[#8B99A8]">How institutional order matching functions in the live DOM</span>
                </div>
              </div>

              <button
                onClick={() => toggleStep(1)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                  completedSteps[1]
                    ? 'bg-[#35C69A]/20 text-[#35C69A] border-[#35C69A]/40'
                    : 'bg-[#111922] text-[#8B99A8] border-[#25313D] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{completedSteps[1] ? 'Step 1 Completed' : 'Mark Step 1 Done'}</span>
              </button>
            </div>

            <p className="text-xs text-[#E7EDF3] leading-relaxed">
              Every order submitted on TradeSphere AI routes through a matching engine. Understanding the distinction between order types protects you from price slippage during volatile earnings or opening bell periods:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1.5">
                <span className="font-bold text-[#2979FF] block">1. MARKET ORDER</span>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Executes immediately at the best available counterparty price (Ask for buys, Bid for sells). Prioritizes execution certainty over price certainty.
                </p>
              </div>

              <div className="p-3.5 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1.5">
                <span className="font-bold text-[#35C69A] block">2. LIMIT ORDER</span>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Rests in the 20-level order book. Guaranteed to execute ONLY at your specified price or better. Prioritizes price control over immediate execution.
                </p>
              </div>

              <div className="p-3.5 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1.5">
                <span className="font-bold text-[#EF6468] block">3. HARD STOP-LOSS (SL)</span>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  A mandatory conditional order that triggers an immediate exit if price breaches your invalidation level. In Basic Mode, orders cannot be placed without an SL.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/app/paper-trading"
                className="inline-flex items-center gap-1.5 text-xs text-[#2979FF] hover:underline font-bold font-mono"
              >
                <span>Open Paper Trading Terminal to practice placing Limit &amp; Stop orders &rarr;</span>
              </Link>
            </div>
          </div>

          {/* STEP 2: MANDATORY 1.0% RISK GATEKEEPER WITH EMBEDDED INTERACTIVE SIZER WIDGET */}
          <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25313D] gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono font-bold flex items-center justify-center text-xs">
                  02
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Step 2: Rule A — Mandatory 1.0% Pre-Trade Risk Position Sizer
                  </h3>
                  <span className="text-[11px] text-[#8B99A8]">The non-negotiable mathematical law of capital preservation</span>
                </div>
              </div>

              <button
                onClick={() => toggleStep(2)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                  completedSteps[2]
                    ? 'bg-[#35C69A]/20 text-[#35C69A] border-[#35C69A]/40'
                    : 'bg-[#111922] text-[#8B99A8] border-[#25313D] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{completedSteps[2] ? 'Step 2 Completed' : 'Mark Step 2 Done'}</span>
              </button>
            </div>

            <p className="text-xs text-[#E7EDF3] leading-relaxed">
              Professional trading is not about predicting price direction; it is about strictly controlling the dollar loss when you are wrong. Under <strong>Rule A</strong>, no trade is permitted to risk more than <strong>1.0% of total account equity</strong>.
            </p>

            {/* Embedded Interactive Position Sizer Sandbox */}
            <div className="p-4 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#2979FF]" />
                  <span>Interactive 1.0% Position Sizer Simulator</span>
                </span>
                <span className="text-[#35C69A] font-bold">Rule A Safe Sizing Engine</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[#8B99A8] font-mono text-[10px] mb-1">Account Capital (₹):</label>
                  <input
                    type="number"
                    value={calcEquity}
                    onChange={e => setCalcEquity(Math.max(1000, Number(e.target.value)))}
                    className="w-full bg-[#111922] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#2979FF]"
                  />
                </div>

                <div>
                  <label className="block text-[#8B99A8] font-mono text-[10px] mb-1">Planned Entry Price (₹):</label>
                  <input
                    type="number"
                    value={calcEntry}
                    onChange={e => setCalcEntry(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#111922] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#2979FF]"
                  />
                </div>

                <div>
                  <label className="block text-[#8B99A8] font-mono text-[10px] mb-1">Stop-Loss Price (₹):</label>
                  <input
                    type="number"
                    value={calcStopLoss}
                    onChange={e => setCalcStopLoss(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-[#111922] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#2979FF]"
                  />
                </div>

                <div>
                  <label className="block text-[#8B99A8] font-mono text-[10px] mb-1">Max Risk Cap (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calcRiskPct}
                    onChange={e => setCalcRiskPct(Math.max(0.1, Math.min(2.0, Number(e.target.value))))}
                    className="w-full bg-[#111922] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#2979FF]"
                  />
                </div>
              </div>

              {/* Dynamic Calculation Output Bar */}
              <div className="p-3 bg-[#111922] rounded-lg border border-[#25313D] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[#8B99A8] text-[10px] block">Risk Per Share:</span>
                  <span className="text-white font-bold text-sm">₹{riskPerShare.toFixed(2)}</span>
                </div>

                <div>
                  <span className="text-[#8B99A8] text-[10px] block">Max Allowed Cash Risk:</span>
                  <span className="text-[#2979FF] font-bold text-sm">₹{maxRiskCash.toFixed(2)}</span>
                </div>

                <div>
                  <span className="text-[#8B99A8] text-[10px] block">Calculated Safe Quantity:</span>
                  <span className={`font-black text-sm ${isBreach ? 'text-[#EF6468]' : 'text-[#35C69A]'}`}>
                    {safeQty} shares
                  </span>
                </div>

                <div>
                  <span className="text-[#8B99A8] text-[10px] block">Total Order Capital:</span>
                  <span className="text-[#D8AB5E] font-bold text-sm">₹{totalAllocated.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Rule A Invariant Alert */}
              {isBreach ? (
                <div className="p-2.5 bg-[#EF6468]/15 border border-[#EF6468]/30 rounded-lg flex items-center gap-2 text-xs text-[#EF6468]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Rule A Invariant Triggered: </strong> Single share risk (₹{riskPerShare.toFixed(2)}) exceeds maximum allowed risk (₹{maxRiskCash.toFixed(2)}). Strict Safe Sizing returns exactly 0 units. Never rounds up to 1 unit.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-[#35C69A]/15 border border-[#35C69A]/30 rounded-lg flex items-center justify-between text-xs text-[#35C69A]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Compliant with Rule A: Maximum possible trade loss is strictly ₹{(safeQty * riskPerShare).toFixed(2)} (within ₹{maxRiskCash.toFixed(2)}).</span>
                  </span>
                  <button
                    onClick={() => {
                      setCalcEquity(100000);
                      setCalcEntry(3000);
                      setCalcStopLoss(1500);
                    }}
                    className="text-[10px] font-mono text-[#8B99A8] underline hover:text-white"
                  >
                    Simulate Risk Breach Violation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3: CANDLESTICK READING & 20-EMA TREND GUIDE */}
          <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25313D] gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#D8AB5E]/15 text-[#D8AB5E] border border-[#D8AB5E]/30 font-mono font-bold flex items-center justify-center text-xs">
                  03
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Step 3: Technical Analysis — 20-EMA Dynamic Trend Guide
                  </h3>
                  <span className="text-[11px] text-[#8B99A8]">Determining institutional trend bias with zero indicator clutter</span>
                </div>
              </div>

              <button
                onClick={() => toggleStep(3)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                  completedSteps[3]
                    ? 'bg-[#35C69A]/20 text-[#35C69A] border-[#35C69A]/40'
                    : 'bg-[#111922] text-[#8B99A8] border-[#25313D] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{completedSteps[3] ? 'Step 3 Completed' : 'Mark Step 3 Done'}</span>
              </button>
            </div>

            <p className="text-xs text-[#E7EDF3] leading-relaxed">
              In Tier 1 Basic Mode, the chart is stripped of confusing oscillators, keeping only the <strong>20-period Exponential Moving Average (20-EMA)</strong> and automatic Support/Resistance zones:
            </p>

            {/* Interactive Trend Visualizer */}
            <div className="p-4 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  onClick={() => setTrendScenario('bullish')}
                  className={`px-3 py-1 rounded-lg border transition-colors ${
                    trendScenario === 'bullish'
                      ? 'bg-[#35C69A] text-black font-bold'
                      : 'bg-[#111922] text-[#8B99A8] border-[#25313D]'
                  }`}
                >
                  Scenario A: Bullish Regime (Price &gt; 20-EMA)
                </button>
                <button
                  onClick={() => setTrendScenario('bearish')}
                  className={`px-3 py-1 rounded-lg border transition-colors ${
                    trendScenario === 'bearish'
                      ? 'bg-[#EF6468] text-white font-bold'
                      : 'bg-[#111922] text-[#8B99A8] border-[#25313D]'
                  }`}
                >
                  Scenario B: Bearish Regime (Price &lt; 20-EMA)
                </button>
                <button
                  onClick={() => setTrendScenario('reversion')}
                  className={`px-3 py-1 rounded-lg border transition-colors ${
                    trendScenario === 'reversion'
                      ? 'bg-[#D8AB5E] text-black font-bold'
                      : 'bg-[#111922] text-[#8B99A8] border-[#25313D]'
                  }`}
                >
                  Scenario C: Overextended (Mean Reversion Risk)
                </button>
              </div>

              <div className="p-3 bg-[#111922] rounded-lg border border-[#25313D] text-xs space-y-1">
                {trendScenario === 'bullish' && (
                  <div>
                    <span className="font-bold text-[#35C69A] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      <span>Bullish Momentum Regime: Long Entries Favored</span>
                    </span>
                    <p className="text-[11px] text-[#8B99A8] mt-1 leading-relaxed">
                      Price is printing higher highs above the upward-sloping 20-EMA. Institutional buyers use pullbacks toward the 20-EMA line as dynamic support to initiate new long positions with tight Stop-Losses placed just below the EMA.
                    </p>
                  </div>
                )}
                {trendScenario === 'bearish' && (
                  <div>
                    <span className="font-bold text-[#EF6468] flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4" />
                      <span>Bearish Momentum Regime: Capital Preservation Favored</span>
                    </span>
                    <p className="text-[11px] text-[#8B99A8] mt-1 leading-relaxed">
                      Price is trading beneath the downward-sloping 20-EMA. Bounces toward the EMA act as overhead supply resistance. Novice traders must avoid buying falling knives; wait for price to cross and hold above the 20-EMA.
                    </p>
                  </div>
                )}
                {trendScenario === 'reversion' && (
                  <div>
                    <span className="font-bold text-[#D8AB5E] flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      <span>Extended Rubber-Band Regime: Mean Reversion Caution</span>
                    </span>
                    <p className="text-[11px] text-[#8B99A8] mt-1 leading-relaxed">
                      Price has moved more than 3 ATR away from the 20-EMA without consolidating. Buying here carries severe negative risk-reward because price statistically snaps back toward its 20-period equilibrium mean.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 4: BRACKET OCO (ONE-CANCELS-THE-OTHER) ORDERS */}
          <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25313D] gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#2979FF]/15 text-[#2979FF] border border-[#2979FF]/30 font-mono font-bold flex items-center justify-center text-xs">
                  04
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Step 4: Bracket OCO State Machine — Automated Profit &amp; Loss Protection
                  </h3>
                  <span className="text-[11px] text-[#8B99A8]">Eliminating human execution emotion through coupled exit orders</span>
                </div>
              </div>

              <button
                onClick={() => toggleStep(4)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                  completedSteps[4]
                    ? 'bg-[#35C69A]/20 text-[#35C69A] border-[#35C69A]/40'
                    : 'bg-[#111922] text-[#8B99A8] border-[#25313D] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{completedSteps[4] ? 'Step 4 Completed' : 'Mark Step 4 Done'}</span>
              </button>
            </div>

            <p className="text-xs text-[#E7EDF3] leading-relaxed">
              A Bracket Order wraps a parent opening position with two simultaneous child legs: a <strong>Take-Profit (TP) Limit</strong> and a <strong>Stop-Loss (SL) Stop</strong>. When one child leg executes, the server immediately cancels the counter-leg:
            </p>

            {/* Interactive OCO State Machine Visualizer */}
            <div className="p-4 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-sans">Simulate OCO State Machine Transition:</span>
                <button
                  onClick={() => setOcoState('ACTIVE')}
                  className="text-[10px] text-[#8B99A8] hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset OCO Simulation</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#111922] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block">Parent Order</span>
                  <span className="font-bold text-white text-xs block mt-0.5">BUY 200 @ ₹2,985.40</span>
                  <span className="text-[10px] text-[#35C69A] font-bold">FILLED</span>
                </div>

                <div className={`p-2.5 rounded-lg border transition-all ${
                  ocoState === 'TP_HIT' ? 'bg-[#35C69A]/20 border-[#35C69A] text-white' :
                  ocoState === 'SL_HIT' ? 'bg-[#111922] border-[#25313D] text-[#8B99A8]/40 line-through' :
                  'bg-[#111922] border-[#25313D] text-[#35C69A]'
                }`}>
                  <span className="text-[10px] block">Child Leg 1: Take-Profit</span>
                  <span className="font-bold text-xs block mt-0.5">SELL 200 @ ₹3,050.00</span>
                  <span className="text-[10px] font-bold">
                    {ocoState === 'TP_HIT' ? '✓ FILLED (+₹12,920)' : ocoState === 'SL_HIT' ? 'CANCELLED (OCO)' : 'ACTIVE (Resting)'}
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border transition-all ${
                  ocoState === 'SL_HIT' ? 'bg-[#EF6468]/20 border-[#EF6468] text-white' :
                  ocoState === 'TP_HIT' ? 'bg-[#111922] border-[#25313D] text-[#8B99A8]/40 line-through' :
                  'bg-[#111922] border-[#25313D] text-[#EF6468]'
                }`}>
                  <span className="text-[10px] block">Child Leg 2: Stop-Loss</span>
                  <span className="font-bold text-xs block mt-0.5">SELL 200 @ ₹2,950.00</span>
                  <span className="text-[10px] font-bold">
                    {ocoState === 'SL_HIT' ? '✓ FILLED (-₹7,080)' : ocoState === 'TP_HIT' ? 'CANCELLED (OCO)' : 'ACTIVE (Guarding)'}
                  </span>
                </div>
              </div>

              {/* Trigger Buttons */}
              <div className="flex gap-2 pt-1 font-sans">
                <button
                  onClick={() => setOcoState('TP_HIT')}
                  className="flex-1 py-1.5 rounded-lg bg-[#35C69A]/20 hover:bg-[#35C69A]/30 border border-[#35C69A]/40 text-[#35C69A] font-bold text-xs transition-colors"
                >
                  Simulate Market Rally $\rightarrow$ TP Hit
                </button>
                <button
                  onClick={() => setOcoState('SL_HIT')}
                  className="flex-1 py-1.5 rounded-lg bg-[#EF6468]/20 hover:bg-[#EF6468]/30 border border-[#EF6468]/40 text-[#EF6468] font-bold text-xs transition-colors"
                >
                  Simulate Market Drop $\rightarrow$ SL Hit
                </button>
              </div>
            </div>
          </div>

          {/* STEP 5: DAILY DRAWDOWN CIRCUIT BREAKER */}
          <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25313D] gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[#EF6468]/15 text-[#EF6468] border border-[#EF6468]/30 font-mono font-bold flex items-center justify-center text-xs">
                  05
                </span>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Step 5: Daily Drawdown Circuit Breaker — Preventing Revenge Trading Tilt
                  </h3>
                  <span className="text-[11px] text-[#8B99A8]">3.0% session loss lock protecting your account equity</span>
                </div>
              </div>

              <button
                onClick={() => toggleStep(5)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
                  completedSteps[5]
                    ? 'bg-[#35C69A]/20 text-[#35C69A] border-[#35C69A]/40'
                    : 'bg-[#111922] text-[#8B99A8] border-[#25313D] hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{completedSteps[5] ? 'Step 5 Completed' : 'Mark Step 5 Done'}</span>
              </button>
            </div>

            <p className="text-xs text-[#E7EDF3] leading-relaxed">
              Behavioral finance proves that 80% of account blowups occur due to revenge trading after multiple rapid losses. TradeSphere AI enforces an architectural <strong>3.0% daily session drawdown circuit breaker</strong>:
            </p>

            <div className="p-4 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8B99A8]">Simulate Session Realized + Unrealized Loss:</span>
                <span className={`font-bold text-sm ${isBreakerTripped ? 'text-[#EF6468]' : 'text-white'}`}>
                  -₹{simulatedLoss.toLocaleString()} ({((simulatedLoss / 1000000) * 100).toFixed(1)}% of ₹10L)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="50000"
                step="2500"
                value={simulatedLoss}
                onChange={e => setSimulatedLoss(Number(e.target.value))}
                className="w-full accent-[#EF6468] cursor-pointer"
              />

              {isBreakerTripped ? (
                <div className="p-3 bg-[#EF6468]/20 border border-[#EF6468]/40 rounded-xl text-xs text-[#EF6468] flex items-start gap-2.5 font-sans">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">SESSION CIRCUIT BREAKER TRIGGERED: WORKSTATION LOCKED</strong>
                    <span>Your session loss has hit 3.0% (₹30,000). To prevent emotional revenge trading tilt, all new opening orders are rejected by the Spring Boot server for the remainder of this session.</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-[#35C69A]/15 border border-[#35C69A]/30 rounded-lg text-xs text-[#35C69A] flex items-center justify-between font-mono">
                  <span>Session Loss Buffer Remaining: ₹{(breakerThreshold - simulatedLoss).toLocaleString()}</span>
                  <span className="font-bold">STATUS: ORDER ENTRY PERMITTED</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL PLATFORM FEATURE GUIDES */}
      {activeTab === 'FEATURES' && (
        <div className="space-y-4">
          {/* Category Filter and Search Bar */}
          <div className="bg-[#111922] p-3 rounded-xl border border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {['ALL', 'EXECUTION', 'RISK', 'OPTIONS', 'QUANT', 'WEALTH'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#2979FF] text-white border-[#2979FF] font-bold'
                      : 'bg-[#0D131A] text-[#8B99A8] border-[#25313D] hover:text-white'
                  }`}
                >
                  {cat === 'EXECUTION' ? 'TRADING' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#8B99A8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guides, formulas, tools..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8B99A8] focus:outline-none focus:border-[#2979FF]"
              />
            </div>
          </div>

          {filteredGuides.length === 0 ? (
            <div className="bg-[#111922] p-8 text-center rounded-xl border border-[#25313D] text-xs text-[#8B99A8] font-mono">
              No platform feature guides match the query "{searchQuery}".
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#25313D]/80 transition-all"
              >
                {/* Guide Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#25313D]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/25 font-mono">
                      {guide.badge}
                    </span>
                    <h2 className="text-base font-bold text-white">{guide.name}</h2>
                    <span className="text-[11px] text-[#8B99A8] font-mono">({guide.route})</span>
                  </div>

                  <Link
                    href={guide.route}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-colors self-start sm:self-auto"
                  >
                    <span>Launch Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-xs text-[#E7EDF3] leading-relaxed">
                  {guide.whatItDoes}
                </p>

                {/* Step-by-Step How-To */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                    Step-by-Step How to Use:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#8B99A8]">
                    {guide.howToUse.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                        <span className="w-4 h-4 rounded-full bg-[#2979FF]/20 text-[#2979FF] flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="text-[#E7EDF3] leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics and Formulas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                    Key Metrics &amp; Mathematical Formulas:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    {guide.keyMetrics.map((km, kmIdx) => (
                      <div key={kmIdx} className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                        <span className="text-[#35C69A] font-bold block text-[11px] font-sans">{km.name}</span>
                        <span className="text-[#8B99A8] text-[10px] mt-0.5 block leading-normal">{km.formulaOrMeaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Troubleshooting & Video Guide Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#25313D]/60 text-xs">
                  <div className="p-3 bg-[#0D131A] border border-[#25313D] rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#D8AB5E] shrink-0 mt-0.5" />
                    <div className="text-[11px] text-[#8B99A8] leading-relaxed">
                      <strong className="text-white">Troubleshooting Tip: </strong>
                      {guide.troubleshootingTip}
                    </div>
                  </div>

                  <div className="p-3 bg-[#0D131A] border border-[#25313D] rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#2979FF] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#8B99A8] block font-mono">RECOMMENDED FREE VIDEO LESSON</span>
                        <span className="text-[11px] font-bold text-white line-clamp-1">{guide.videoGuideTitle}</span>
                      </div>
                    </div>
                    <a
                      href={guide.videoGuideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#2979FF]/15 hover:bg-[#2979FF]/25 text-[#2979FF] text-[11px] font-bold font-mono transition-colors shrink-0"
                    >
                      Watch
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PLATFORM FAQS */}
      {activeTab === 'FAQS' && (
        <div className="space-y-4">
          {/* Category Filter and Search Bar */}
          <div className="bg-[#111922] p-3 rounded-xl border border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {['ALL', 'EXECUTION', 'RISK', 'OPTIONS', 'QUANT', 'WEALTH'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#2979FF] text-white border-[#2979FF] font-bold'
                      : 'bg-[#0D131A] text-[#8B99A8] border-[#25313D] hover:text-white'
                  }`}
                >
                  {cat === 'EXECUTION' ? 'TRADING' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#8B99A8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FAQs and rules..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8B99A8] focus:outline-none focus:border-[#2979FF]"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="bg-[#111922] p-8 text-center rounded-xl border border-[#25313D] text-xs text-[#8B99A8] font-mono">
                No FAQs match the query "{searchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-[#111922] border border-[#25313D] rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#0D131A] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/20 font-mono">
                          {faq.category}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white">{faq.question}</span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#8B99A8] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8B99A8] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-[#25313D]/40 text-xs text-[#8B99A8] leading-relaxed">
                        <p className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3]">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-[#8B99A8]">Loading platform curriculum...</div>}>
      <GuideContent />
    </Suspense>
  );
}
