'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, UserProfile } from '../../../lib/api-client';
import { Settings, ShieldCheck, Wallet, RotateCcw, Save, CheckCircle2, Sliders, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(apiClient.getUserProfile());
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [tier, setTier] = useState<'basic' | 'active' | 'pro'>(profile.tier);
  const [riskCap, setRiskCap] = useState(profile.riskCapPct || 1.0);
  const [circuitBreaker, setCircuitBreaker] = useState(profile.circuitBreakerPct || 3.0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Platform &amp; Risk Settings
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              USER PREFERENCES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure risk thresholds, progressive complexity tiers, and paper capital parameters.
          </p>
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1b253b]">
            <User className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              User Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Adaptive Progressive Complexity Tier */}
        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1b253b]">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Adaptive Progressive Complexity Tier
            </h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Choose your trading interface density and feature set. Switch at any time.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Basic */}
            <div
              onClick={() => setTier('basic')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tier === 'basic'
                  ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-[#070b14] border-[#1b253b] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs text-white">Tier 1: Basic Guided</span>
                {tier === 'basic' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                20-EMA trend guide, automatic 1% risk position sizer, S/R zones, plain-English coach advice.
              </p>
            </div>

            {/* Active */}
            <div
              onClick={() => setTier('active')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tier === 'active'
                  ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-[#070b14] border-[#1b253b] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs text-white">Tier 2: Active Trader</span>
                {tier === 'active' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Multi-timeframe candlesticks, VWAP, Bollinger Bands, Bracket OCO orders, trade journal.
              </p>
            </div>

            {/* Pro Quant */}
            <div
              onClick={() => setTier('pro')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tier === 'pro'
                  ? 'bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-[#070b14] border-[#1b253b] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-xs text-white">Tier 3: Pro Quant</span>
                {tier === 'pro' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                20-level Level-2 DOM ladder, Black-Scholes Options Greeks (Delta, Gamma, Vega), backtester.
              </p>
            </div>
          </div>
        </div>

        {/* Pre-Trade Risk Parameters */}
        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1b253b]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Pre-Trade Risk Parameters
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Single Trade Risk Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-semibold">
                  Single-Trade Maximum Risk Cap:
                </label>
                <span className="font-mono font-bold text-blue-400 text-sm">
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
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5% (Conservative)</span>
                <span>1.0% (Standard)</span>
                <span>2.0% (Maximum Cap)</span>
              </div>
            </div>

            {/* Daily Drawdown Breaker Slider */}
            <div className="space-y-2 pt-3 border-t border-[#1b253b]">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-semibold">
                  Daily Drawdown Circuit Breaker Limit:
                </label>
                <span className="font-mono font-bold text-rose-400 text-sm">
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
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>2.0% (Strict)</span>
                <span>3.0% (Default Invariant)</span>
                <span>5.0% (High Volatility)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Capital & Ledger Reset */}
        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1b253b]">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Paper Ledger Management
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-white font-bold block mb-0.5">Initial Paper Capital</span>
              <span className="text-slate-400 text-[11px]">
                Reset your account balance, equity curve, and closed trades back to initial ₹10,00,000 INR.
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetLedger}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold transition-all shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Ledger (₹10L)</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30"
          >
            <Save className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
