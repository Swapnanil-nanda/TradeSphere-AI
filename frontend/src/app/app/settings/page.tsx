'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, UserProfile } from '../../../lib/api-client';
import {
  Settings, ShieldCheck, Wallet, RotateCcw, Save, CheckCircle2, Sliders,
  User, Sparkles, HelpCircle, Layers, ArrowRight, Zap, Key, Lock, AlertCircle,
  ExternalLink, Globe, RefreshCw
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

  // Finvasia Shoonya Live Broker State
  const [shoonyaUserId, setShoonyaUserId] = useState('');
  const [shoonyaPassword, setShoonyaPassword] = useState('');
  const [shoonyaTotpSecret, setShoonyaTotpSecret] = useState('');
  const [shoonyaVendorCode, setShoonyaVendorCode] = useState('');
  const [shoonyaApiKey, setShoonyaApiKey] = useState('');
  const [shoonyaConnected, setShoonyaConnected] = useState(false);
  const [shoonyaConnecting, setShoonyaConnecting] = useState(false);
  const [shoonyaUname, setShoonyaUname] = useState('');
  const [shoonyaFeedback, setShoonyaFeedback] = useState<string | null>(null);
  const [executionMode, setExecutionMode] = useState<'paper' | 'shoonya'>('paper');

  useEffect(() => {
    const user = apiClient.getUserProfile();
    setProfile(user);
    setName(user.name);
    setEmail(user.email);
    setTier(user.tier);
    setRiskCap(user.riskCapPct || 1.0);
    setCircuitBreaker(user.circuitBreakerPct || 3.0);

    // Check existing Shoonya Broker Status
    fetch('/api/broker/shoonya?action=status')
      .then(r => r.json())
      .then(d => {
        if (d.connected) {
          setShoonyaConnected(true);
          setShoonyaUname(d.session?.uname || 'Finvasia Trader');
          setExecutionMode('shoonya');
        }
      })
      .catch(() => {});

    try {
      const savedShoonyaId = localStorage.getItem('tradesphere_shoonya_uid');
      if (savedShoonyaId) setShoonyaUserId(savedShoonyaId);
      const savedMode = localStorage.getItem('tradesphere_execution_mode');
      if (savedMode === 'shoonya') setExecutionMode('shoonya');
    } catch {}
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
    try {
      localStorage.setItem('tradesphere_execution_mode', executionMode);
      if (shoonyaUserId) localStorage.setItem('tradesphere_shoonya_uid', shoonyaUserId);
    } catch {}
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleConnectShoonya = async () => {
    if (!shoonyaUserId || !shoonyaPassword || !shoonyaVendorCode || !shoonyaApiKey) {
      setShoonyaFeedback('Please fill all required Shoonya credentials: User ID, Password, Vendor Code, and API Key.');
      return;
    }

    setShoonyaConnecting(true);
    setShoonyaFeedback(null);

    try {
      const res = await fetch('/api/broker/shoonya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auth',
          credentials: {
            userId: shoonyaUserId,
            password: shoonyaPassword,
            totpSecret: shoonyaTotpSecret,
            vendorCode: shoonyaVendorCode,
            apiKey: shoonyaApiKey
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Authentication with Finvasia failed.');
      }

      setShoonyaConnected(true);
      setShoonyaUname(data.session?.uname || 'Finvasia Trader');
      setExecutionMode('shoonya');
      setShoonyaFeedback(`✓ Connected successfully! Account: ${data.session?.uname || shoonyaUserId}. Live NSE/BSE execution is ready.`);
      try {
        localStorage.setItem('tradesphere_shoonya_uid', shoonyaUserId);
        localStorage.setItem('tradesphere_execution_mode', 'shoonya');
      } catch {}
    } catch (err: any) {
      setShoonyaFeedback(`Connection Error: ${err.message}`);
    } finally {
      setShoonyaConnecting(false);
    }
  };

  const handleDisconnectShoonya = async () => {
    await fetch('/api/broker/shoonya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'disconnect' })
    }).catch(() => {});

    setShoonyaConnected(false);
    setShoonyaUname('');
    setExecutionMode('paper');
    setShoonyaFeedback('Disconnected from Finvasia Shoonya. Workstation reverted to Paper Simulation mode.');
    try {
      localStorage.setItem('tradesphere_execution_mode', 'paper');
    } catch {}
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
              4 CANONICAL SECTIONS
            </span>
          </div>
          <p className="text-xs text-[#8B99A8] mt-0.5">
            Configure your personal profile, progressive complexity tier, pre-trade risk guardrails, and free live Finvasia Shoonya broker integration.
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
                Section 1: User Profile &amp; Account Identity
              </h2>
            </div>
            <span className="text-xs font-mono text-[#35C69A] font-bold">
              ₹10,00,000.00 Starting Virtual Capital
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
                Section 2: Complexity Tier &amp; Progressive Disclosure
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
            All users begin at <strong>Tier 1 — Basic Guided</strong> to prevent cognitive overload. Progressive complexity controls UI density, not financial permissions or paywalls.
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
                All 33 tools unlocked: 20-level Level-2 DOM ladder, Black-Scholes Greeks, MPT Optimizer, and 8-Agent Quant Pipeline.
              </p>
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

        {/* SECTION 4: FINVASIA SHOONYA LIVE BROKER INTEGRATION (100% FREE LIFETIME API) */}
        <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#25313D] gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#35C69A]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Section 4: Finvasia Shoonya Live Broker (100% Free Lifetime API)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {shoonyaConnected ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00c805]/15 text-[#00c805] border border-[#00c805]/30 text-[11px] font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00c805] animate-pulse" />
                  <span>CONNECTED ({shoonyaUname})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25313D] text-[#8B99A8] border border-[#354352] text-[11px] font-mono">
                  <span>SANDBOX SIMULATION</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[#8B99A8] leading-relaxed">
            <strong>Shoonya by Finvasia</strong> is India&apos;s leading 100% free trading broker with zero brokerage on Equity Delivery, Intraday, and F&amp;O, and zero API subscription fees. Connect your free Shoonya account to stream real exchange ticks and execute live orders with synchronous 1% risk gatekeeping.
          </p>

          {/* Execution Mode Radio Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div
              onClick={() => setExecutionMode('paper')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                executionMode === 'paper'
                  ? 'bg-[#2979FF]/15 border-[#2979FF]'
                  : 'bg-[#0D131A] border-[#25313D] hover:border-[#8B99A8]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white">Paper Trading Simulation</span>
                {executionMode === 'paper' && <CheckCircle2 className="w-4 h-4 text-[#2979FF]" />}
              </div>
              <p className="text-[11px] text-[#8B99A8]">
                Virtual ₹10,00,000 capital sandbox. Risk-free testing with 24/7 GBM ticks and bracket orders.
              </p>
            </div>

            <div
              onClick={() => {
                if (!shoonyaConnected) {
                  alert('Please connect and verify your Finvasia Shoonya credentials below first.');
                } else {
                  setExecutionMode('shoonya');
                }
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                executionMode === 'shoonya'
                  ? 'bg-[#00c805]/15 border-[#00c805]'
                  : 'bg-[#0D131A] border-[#25313D] hover:border-[#8B99A8]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white">Finvasia Shoonya Live Broker</span>
                {executionMode === 'shoonya' && <CheckCircle2 className="w-4 h-4 text-[#00c805]" />}
              </div>
              <p className="text-[11px] text-[#8B99A8]">
                Direct live market execution on NSE/BSE via official Finvasia Noren API with Rule A risk controls.
              </p>
            </div>
          </div>

          {/* Shoonya Credentials Form */}
          <div className="bg-[#0D131A] border border-[#25313D] rounded-xl p-4 space-y-3.5 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#8B99A8] font-bold mb-1">Client Code / User ID</label>
                <input
                  type="text"
                  placeholder="e.g. FA12345"
                  value={shoonyaUserId}
                  onChange={(e) => setShoonyaUserId(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#25313D] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#35C69A]"
                />
              </div>

              <div>
                <label className="block text-[#8B99A8] font-bold mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Finvasia Password"
                  value={shoonyaPassword}
                  onChange={(e) => setShoonyaPassword(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#25313D] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#35C69A]"
                />
              </div>

              <div>
                <label className="block text-[#8B99A8] font-bold mb-1">TOTP Secret / 2FA Code</label>
                <input
                  type="password"
                  placeholder="Base32 Key or 6-digit TOTP"
                  value={shoonyaTotpSecret}
                  onChange={(e) => setShoonyaTotpSecret(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#25313D] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#35C69A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8B99A8] font-bold mb-1">Vendor Code</label>
                <input
                  type="text"
                  placeholder="e.g. VENDOR_U"
                  value={shoonyaVendorCode}
                  onChange={(e) => setShoonyaVendorCode(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#25313D] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#35C69A]"
                />
              </div>

              <div>
                <label className="block text-[#8B99A8] font-bold mb-1">API Key (Prism Portal)</label>
                <input
                  type="password"
                  placeholder="Finvasia API Key"
                  value={shoonyaApiKey}
                  onChange={(e) => setShoonyaApiKey(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#25313D] rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#35C69A]"
                />
              </div>
            </div>

            {shoonyaFeedback && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                shoonyaFeedback.startsWith('✓')
                  ? 'bg-[#00c805]/10 border-[#00c805]/30 text-[#00c805]'
                  : 'bg-[#ff333a]/10 border-[#ff333a]/30 text-[#ff333a]'
              }`}>
                {shoonyaFeedback.startsWith('✓') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{shoonyaFeedback}</span>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <a
                href="https://shoonya.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#2979FF] hover:underline"
              >
                <span>Open Free Shoonya Account / Generate API Keys</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                {shoonyaConnected ? (
                  <button
                    type="button"
                    onClick={handleDisconnectShoonya}
                    className="px-4 py-2 rounded-xl bg-[#EF6468]/15 hover:bg-[#EF6468] text-[#EF6468] hover:text-white border border-[#EF6468]/30 font-bold font-mono text-xs transition-all"
                  >
                    Disconnect Shoonya
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectShoonya}
                    disabled={shoonyaConnecting}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#00c805] hover:bg-[#009b04] text-black font-bold font-mono text-xs transition-all disabled:opacity-50 shadow-md shadow-green-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${shoonyaConnecting ? 'animate-spin' : ''}`} />
                    <span>{shoonyaConnecting ? 'Authenticating...' : 'Test & Connect Shoonya'}</span>
                  </button>
                )}
              </div>
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
