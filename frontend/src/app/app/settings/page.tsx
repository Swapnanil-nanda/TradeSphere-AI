'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, UserProfile } from '../../../lib/api-client';
import {
  Settings, ShieldCheck, Wallet, RotateCcw, Save, CheckCircle2, Sliders,
  User, Sparkles, HelpCircle, Layers, ArrowRight
} from 'lucide-react';
import OnboardingModal from '../../../components/app/OnboardingModal';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(apiClient.getUserProfile());
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [tier, setTier] = useState<'basic' | 'active' | 'pro'>(profile.tier);
  const [riskCap, setRiskCap] = useState(profile.riskCapPct || 1.0);
  const [circuitBreaker, setCircuitBreaker] = useState(profile.circuitBreakerPct || 3.0);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const user = apiClient.getUserProfile();
    setProfile(user);
    setName(user.name);
    setEmail(user.email);
    setTier(user.tier);
    setRiskCap(user.riskCapPct || 1.0);
    setCircuitBreaker(user.circuitBreakerPct || 3.0);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = apiClient.updateUserPreferences({
      name,
      email,
      tier,
      riskCapPct: riskCap,
      circuitBreakerPct: circuitBreaker
    });
    setProfile(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleResetLedger = async () => {
    if (confirm('Reset paper trading ledger back to ₹10,00,000 equity? All positions and open orders will be cleared.')) {
      await apiClient.resetAccount();
      alert('Paper trading ledger reset to ₹10,00,000 successfully.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-[#E7EDF3]">
      {/* Onboarding Modal Triggered on Demand */}
      {showOnboarding && (
        <OnboardingModal
          forceOpen={true}
          onClose={() => {
            setShowOnboarding(false);
            const user = apiClient.getUserProfile();
            setProfile(user);
            setTier(user.tier);
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Platform &amp; Workstation Settings
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
              3 CANONICAL SECTIONS
            </span>
          </div>
          <p className="text-xs text-[#8B99A8] mt-0.5">
            Configure your personal profile, progressive complexity tier, and pre-trade risk guardrails.
          </p>
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#35C69A]/20 text-[#35C69A] border border-[#35C69A]/30 text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#35C69A]" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: USER PROFILE & VIRTUAL CAPITAL */}
        <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#2979FF]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Section 1: User Profile &amp; Virtual Capital
              </h2>
            </div>
            <span className="text-xs font-mono text-[#35C69A] font-bold">
              ₹10,00,000.00 Starting Equity
            </span>
          </div>

          <p className="text-xs text-[#8B99A8] leading-relaxed">
            Your login email uniquely isolates your paper trading positions, order book history, and risk settings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block text-[#8B99A8] font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0D131A] border border-[#25313D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2979FF]"
              />
            </div>
            <div>
              <label className="block text-[#8B99A8] font-bold mb-1">Email Address (Tenant Isolation Key)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D131A] border border-[#25313D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#2979FF] font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ADAPTIVE PROGRESSIVE COMPLEXITY TIER & FEATURE ACCESS */}
        <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25313D] gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D8AB5E]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Section 2: Complexity Tier &amp; Feature Access
              </h2>
            </div>
            
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2979FF]/15 hover:bg-[#2979FF]/25 border border-[#2979FF]/30 text-[#2979FF] hover:text-white font-mono text-[11px] font-bold transition-all self-start sm:self-auto"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Retake Onboarding Survey</span>
            </button>
          </div>

          <p className="text-xs text-[#8B99A8] leading-relaxed">
            All users are alloted to <strong>Tier 1 — Basic Guided</strong> upon first login to prevent cognitive overload. You can adjust your tier anytime to unlock advanced active trading and quantitative tools.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
            {/* Basic */}
            <div
              onClick={() => setTier('basic')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tier === 'basic'
                  ? 'bg-[#35C69A]/15 border-[#35C69A] shadow-md'
                  : 'bg-[#0D131A] border-[#25313D] hover:border-[#8B99A8]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white">Tier 1: Basic (Guided)</span>
                {tier === 'basic' && <CheckCircle2 className="w-4 h-4 text-[#35C69A]" />}
              </div>
              <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                20-EMA trend guide, automatic 1% risk position sizer, S/R zones, paper terminal, and trader academy.
              </p>
            </div>

            {/* Active */}
            <div
              onClick={() => setTier('active')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tier === 'active'
                  ? 'bg-[#2979FF]/15 border-[#2979FF] shadow-md'
                  : 'bg-[#0D131A] border-[#25313D] hover:border-[#8B99A8]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white">Tier 2: Active Trader</span>
                {tier === 'active' && <CheckCircle2 className="w-4 h-4 text-[#2979FF]" />}
              </div>
              <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                Unlocks Screener, Technical Analysis, Bracket OCO orders, Trade Journal, Strategy Builder, and SIP Planner.
              </p>
            </div>

            {/* Pro Quant */}
            <div
              onClick={() => setTier('pro')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tier === 'pro'
                  ? 'bg-[#D8AB5E]/15 border-[#D8AB5E] shadow-md'
                  : 'bg-[#0D131A] border-[#25313D] hover:border-[#8B99A8]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-white">Tier 3: Pro Quant</span>
                {tier === 'pro' && <CheckCircle2 className="w-4 h-4 text-[#D8AB5E]" />}
              </div>
              <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                All 33 tools unlocked: 20-level Level-2 DOM ladder, Black-Scholes Greeks, MPT Optimizer, and 7 Specialist Agents.
              </p>
            </div>
          </div>

          {/* Unlocked Features Breakdown Banner */}
          <div className="p-3.5 bg-[#0D131A] rounded-xl border border-[#25313D] text-xs space-y-1.5 font-sans">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Layers className="w-4 h-4 text-[#2979FF]" />
              <span>Current Unlocked Workstation Tools for {tier.toUpperCase()}:</span>
            </div>
            <div className="text-[11px] text-[#8B99A8] leading-relaxed">
              {tier === 'basic' && (
                <span>
                  ✓ Terminal, Candlestick Charts with 20-EMA Guide, Live Watchlists, Order Blotter, Portfolio Blotter, Trader Academy, Guided Curriculum, and Quizzes.<br />
                  <span className="text-[#D8AB5E]">🔒 Screener, Technicals, OCO, DOM, Greeks, MPT, and 7-Agents are hidden to maintain focus on core risk principles.</span>
                </span>
              )}
              {tier === 'active' && (
                <span>
                  ✓ Everything in Basic + Stock Screener, Technical Analysis, Historical Analogues, Bracket OCO Orders, Trade Journal, Mutual Funds Directory, and Step-Up SIP Planner.<br />
                  <span className="text-[#D8AB5E]">🔒 20-Level DOM, Black-Scholes Greeks, MPT Optimizer, Monte Carlo, and 7 Quant Agents reserved for Pro Quant.</span>
                </span>
              )}
              {tier === 'pro' && (
                <span className="text-[#35C69A] font-medium">
                  ✓ All 33 Platform Features 100% Unlocked. Level 2 DOM, Options Chain Greeks, Strategy Payoff Modeler, Vectorized Backtester, MPT Optimizer, Monte Carlo, and 7 Autonomous Quant Agents.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: PRE-TRADE RISK PARAMETERS & PAPER LEDGER RESET */}
        <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#25313D]">
            <ShieldCheck className="w-4 h-4 text-[#35C69A]" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Section 3: Pre-Trade Risk Parameters &amp; Ledger Reset
            </h2>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Single Trade Risk Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-white font-bold">
                  Rule A: Single-Trade Maximum Loss Cap:
                </label>
                <span className="font-mono font-bold text-[#2979FF] text-sm">
                  {riskCap.toFixed(1)}% (₹{(1000000 * (riskCap / 100)).toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={riskCap}
                onChange={(e) => setRiskCap(parseFloat(e.target.value))}
                className="w-full accent-[#2979FF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8B99A8] font-mono">
                <span>0.5% (Conservative)</span>
                <span>1.0% (Platform Invariant Standard)</span>
                <span>2.0% (Hard Max Cap)</span>
              </div>
            </div>

            {/* Daily Drawdown Breaker Slider */}
            <div className="space-y-2 pt-3 border-t border-[#25313D]">
              <div className="flex justify-between items-center">
                <label className="text-white font-bold">
                  Daily Session Drawdown Circuit Breaker:
                </label>
                <span className="font-mono font-bold text-[#EF6468] text-sm">
                  {circuitBreaker.toFixed(1)}% (₹{(1000000 * (circuitBreaker / 100)).toLocaleString()})
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="5.0"
                step="0.5"
                value={circuitBreaker}
                onChange={(e) => setCircuitBreaker(parseFloat(e.target.value))}
                className="w-full accent-[#EF6468] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8B99A8] font-mono">
                <span>2.0% (Strict)</span>
                <span>3.0% (Default Session Lock)</span>
                <span>5.0% (High Volatility)</span>
              </div>
            </div>

            {/* Reset Paper Ledger */}
            <div className="pt-3 border-t border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-white font-bold block mb-0.5">Reset Paper Trading Ledger</span>
                <span className="text-[#8B99A8] text-[11px]">
                  Clear simulated positions, trade history, and restore starting equity to ₹10,00,000 INR.
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetLedger}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EF6468]/15 hover:bg-[#EF6468] text-[#EF6468] hover:text-white border border-[#EF6468]/30 font-bold font-mono text-xs transition-all shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Ledger (₹10L)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Platform Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
