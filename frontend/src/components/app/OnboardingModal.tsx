'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Award, CheckCircle2, Sliders, ArrowRight,
  User, Wallet, Sparkles, BookOpen, Terminal, Layers, Activity, Lock, X
} from 'lucide-react';
import { apiClient, UserProfile } from '../../lib/api-client';

interface OnboardingModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function OnboardingModal({ forceOpen = false, onClose }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Survey state
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<'safety' | 'active' | 'quant'>('safety');
  const [riskTol, setRiskTol] = useState<'strict' | 'standard' | 'institutional'>('strict');

  // Assigned Tier (Defaulting to basic per user specification)
  const [assignedTier, setAssignedTier] = useState<'basic' | 'active' | 'pro'>('basic');
  const [userName, setUserName] = useState('New Trader');

  useEffect(() => {
    const user = apiClient.getUserProfile();
    setUserName(user.name || 'Trader');
    if (forceOpen) {
      setIsOpen(true);
    }
    const handleOpen = () => {
      setStep(1);
      setIsOpen(true);
    };
    window.addEventListener('tradesphere_open_onboarding', handleOpen);
    return () => window.removeEventListener('tradesphere_open_onboarding', handleOpen);
  }, [forceOpen]);

  const handleNextToAssignment = () => {
    // If beginner or safety goal, allot basic trader
    if (experience === 'beginner' || goal === 'safety') {
      setAssignedTier('basic');
    } else if (experience === 'intermediate' || goal === 'active') {
      setAssignedTier('active');
    } else {
      setAssignedTier('pro');
    }
    setStep(2);
  };

  const handleComplete = (finalTier: 'basic' | 'active' | 'pro') => {
    apiClient.updateUserPreferences({
      tier: finalTier,
      tradingExperience: experience,
      tradingGoal: goal,
      riskPreference: riskTol,
      onboardingCompleted: true
    });
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-[#090D12] border border-[#25313D] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-[#E7EDF3] relative overflow-hidden">
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between border-b border-[#25313D] pb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#2979FF] text-white flex items-center justify-center font-bold text-[11px]">
              Ω
            </span>
            <span className="font-bold text-white font-sans">Trader Onboarding &amp; Tier Allocation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#8B99A8]">Step {step} of 2</span>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
              className="p-1 rounded text-[#8B99A8] hover:text-white hover:bg-[#151F29] transition-colors"
              title="Close Onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {step === 1 ? (
          /* STEP 1: KNOWLEDGE & EXPERIENCE SURVEY */
          <div className="space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Welcome to TradeSphere AI!
              </h2>
              <p className="text-xs text-[#8B99A8] mt-1 leading-relaxed">
                Before you begin, answer 3 quick questions so we can allot the appropriate trading complexity tier and tailor your risk guardrails.
              </p>
            </div>

            {/* Question 1: Experience */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                1. How much do you know about financial trading?
              </label>
              <div className="space-y-1.5 font-sans">
                {[
                  { id: 'beginner', title: 'Complete Beginner', desc: 'I am learning the basics. I want guided trend indicators, safety guardrails, and simple sizing.' },
                  { id: 'intermediate', title: 'Active Trader', desc: 'I have traded stocks. I understand candlestick charts, VWAP, support/resistance, and bracket orders.' },
                  { id: 'advanced', title: 'Experienced / Pro Quant', desc: 'I trade derivatives, options Greeks, order book DOM ladders, and quantitative backtests.' }
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setExperience(opt.id as any)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      experience === opt.id
                        ? 'bg-[#2979FF]/15 border-[#2979FF] text-white'
                        : 'bg-[#0D131A] border-[#25313D] text-[#8B99A8] hover:text-white hover:bg-[#111922]'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={experience === opt.id}
                      onChange={() => {}}
                      className="mt-0.5 accent-[#2979FF]"
                    />
                    <div>
                      <span className="font-bold block text-white text-xs">{opt.title}</span>
                      <span className="text-[11px] text-[#8B99A8]">{opt.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 2: Primary Goal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                2. What is your primary focus on the platform?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'safety', title: 'Capital Safety & Learning', tag: 'Beginner' },
                  { id: 'active', title: 'Intraday & Swing Trading', tag: 'Active' },
                  { id: 'quant', title: 'Options & Quant Modeling', tag: 'Quant' }
                ].map(g => (
                  <div
                    key={g.id}
                    onClick={() => setGoal(g.id as any)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      goal === g.id
                        ? 'bg-[#35C69A]/15 border-[#35C69A] text-white font-bold'
                        : 'bg-[#0D131A] border-[#25313D] text-[#8B99A8] hover:text-white'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-[#8B99A8] block">{g.tag}</span>
                    <span className="text-xs font-semibold block mt-0.5">{g.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNextToAssignment}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs shadow-md transition-all"
              >
                <span>Calculate &amp; Allot My Tier</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: ALLOTTED TIER & 3 CORE SECTIONS REVEAL */
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono text-[10px] font-bold mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                TIER ALLOCATION COMPLETE
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                You are alloted to: {assignedTier === 'basic' ? 'Tier 1 — Basic (Guided)' : assignedTier === 'active' ? 'Tier 2 — Active Trader' : 'Tier 3 — Pro Quant'}
              </h2>
              <p className="text-xs text-[#8B99A8] leading-relaxed">
                Based on your answers, your workstation has been configured with the 3 canonical settings sections below.
              </p>
            </div>

            {/* The 3 Canonical Settings Sections */}
            <div className="space-y-3 font-sans text-xs">
              {/* Section 1: User Profile & Capital */}
              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2979FF]" />
                    <span>Section 1: User Profile &amp; Virtual Capital</span>
                  </span>
                  <span className="text-[#35C69A] font-mono font-bold">₹10,00,000.00 Starting Balance</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Dedicated multi-tenant paper ledger with verified transactional cash tracking and zero real-money risk.
                </p>
              </div>

              {/* Section 2: Complexity Tier & Feature Access */}
              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#D8AB5E]" />
                    <span>Section 2: Complexity Tier &amp; Unlocked Features</span>
                  </span>
                  <div className="flex gap-1 font-mono text-[10px]">
                    <button
                      onClick={() => setAssignedTier('basic')}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        assignedTier === 'basic' ? 'bg-[#35C69A] text-black font-bold' : 'text-[#8B99A8] border-[#25313D]'
                      }`}
                    >
                      Basic
                    </button>
                    <button
                      onClick={() => setAssignedTier('active')}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        assignedTier === 'active' ? 'bg-[#2979FF] text-white font-bold' : 'text-[#8B99A8] border-[#25313D]'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setAssignedTier('pro')}
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        assignedTier === 'pro' ? 'bg-[#D8AB5E] text-black font-bold' : 'text-[#8B99A8] border-[#25313D]'
                      }`}
                    >
                      Pro
                    </button>
                  </div>
                </div>

                {/* Features breakdown for currently selected tier */}
                <div className="text-[11px] space-y-1">
                  {assignedTier === 'basic' && (
                    <div className="p-2.5 rounded-lg bg-[#111922] border border-[#35C69A]/30 text-[#E7EDF3] space-y-1">
                      <div className="font-bold text-[#35C69A]">✓ Unlocked for Basic Trader:</div>
                      <div className="text-[10px] text-[#8B99A8] leading-relaxed">
                        • Institutional Terminal with Dynamic Risk Position Sizer<br />
                        • Candlestick Charts with 20-EMA Trend Guide &amp; S/R Zones<br />
                        • Live NSE &amp; US Watchlists, Orders &amp; Portfolio Blotter<br />
                        • Complete Trader Academy, Guided Curriculum &amp; Quizzes
                      </div>
                      <div className="text-[10px] text-[#D8AB5E] pt-1">
                        🔒 Active &amp; Pro features (DOM, Options Chain, MPT, 7-Agents) hidden to prevent cognitive overload.
                      </div>
                    </div>
                  )}

                  {assignedTier === 'active' && (
                    <div className="p-2.5 rounded-lg bg-[#111922] border border-[#2979FF]/30 text-[#E7EDF3] space-y-1">
                      <div className="font-bold text-[#2979FF]">✓ Unlocked for Active Trader:</div>
                      <div className="text-[10px] text-[#8B99A8] leading-relaxed">
                        • Everything in Basic + Stock Screener &amp; Technical Analysis<br />
                        • Bracket OCO Order State Machine (Automated Take-Profit &amp; Stop-Loss)<br />
                        • Automated Trade Journal &amp; Tilt Auditor<br />
                        • Strategy Lab Builder, Mutual Funds Directory &amp; Step-Up SIP Planner
                      </div>
                      <div className="text-[10px] text-[#D8AB5E] pt-1">
                        🔒 Pro Quant features (20-depth DOM, Options Greeks, MPT) reserved for Tier 3.
                      </div>
                    </div>
                  )}

                  {assignedTier === 'pro' && (
                    <div className="p-2.5 rounded-lg bg-[#111922] border border-[#D8AB5E]/30 text-[#E7EDF3] space-y-1">
                      <div className="font-bold text-[#D8AB5E]">✓ All 33 Platform Features 100% Unlocked:</div>
                      <div className="text-[10px] text-[#8B99A8] leading-relaxed">
                        • Simulated 20-Level Depth of Market (DOM Ladder)<br />
                        • Black-Scholes Options Greeks &amp; Volatility Smile<br />
                        • Multi-Leg Options Strategy Payoff Modeler<br />
                        • 7 Specialist Autonomous Quant Agents &amp; Vectorized Backtester<br />
                        • Markowitz MPT Optimizer, Efficient Frontier &amp; 350-Path Monte Carlo
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Pre-Trade Risk Parameters */}
              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#35C69A]" />
                    <span>Section 3: Pre-Trade Risk Parameters &amp; Guardrails</span>
                  </span>
                  <span className="text-[#2979FF] font-mono font-bold">Risk Guardrails Active</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Dynamic risk controls, 3.0% daily session drawdown circuit breaker, and synchronous pre-trade gatekeeper.
                </p>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#8B99A8] hover:text-white font-semibold transition-colors"
              >
                ← Back to Survey
              </button>

              <button
                onClick={() => handleComplete(assignedTier)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs shadow-md transition-all"
              >
                <span>Launch Workstation as {assignedTier.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
