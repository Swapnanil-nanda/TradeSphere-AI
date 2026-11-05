'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, User, ArrowRight, Zap, AlertCircle, ShieldCheck, Sliders, CheckCircle2
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<'basic' | 'active' | 'pro'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.register({ name, email, password, tier });
      router.push('/app/paper-trading');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to backend registration service.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLaunch = () => {
    apiClient.switchUserContext('guest.trader@tradesphere.ai', 'Guest Trader');
    router.push('/app/paper-trading');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 select-none bg-[#000000] text-[#F0F3F6]">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: The 3 Canonical Sections Explained */}
        <div className="lg:col-span-6 bg-[#090D12] border border-[#25313D] rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2979FF] flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">
                Ω
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Create Virtual Account</h1>
                <p className="text-[11px] text-[#8B99A8] font-mono">Verified ₹10,00,000 Paper Capital</p>
              </div>
            </div>

            <p className="text-xs text-[#8B99A8] leading-relaxed">
              Every newly registered trader account operates under 3 canonical architectural sections:
            </p>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2979FF]" />
                    <span>Section 1: User Profile &amp; Virtual Capital</span>
                  </span>
                  <span className="text-[#35C69A] font-mono font-bold">₹10,00,000 Starting</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Isolated paper ledger with real-time balance tracking, order history, and position mark-to-market.
                </p>
              </div>

              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#D8AB5E]" />
                    <span>Section 2: Complexity Tier &amp; Access</span>
                  </span>
                  <span className="text-[#2979FF] font-mono font-bold">Tier 1: Basic Allotted</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Starts with guided charts, 1% risk sizers, and academy. Active &amp; Pro tools unlock progressively.
                </p>
              </div>

              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#35C69A]" />
                    <span>Section 3: Pre-Trade Risk Parameters</span>
                  </span>
                  <span className="text-[#35C69A] font-mono font-bold">Rule A: 1.0% Cap</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Automatic position sizing gatekeeper prevents catastrophic loss by capping single-trade risk to 1.0%.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#25313D]">
            <button
              onClick={handleGuestLaunch}
              className="w-full py-2.5 rounded-xl bg-[#2979FF]/15 hover:bg-[#2979FF]/25 border border-[#2979FF]/40 text-[#2979FF] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-[#2979FF]" />
              <span>Launch Workstation Directly as Guest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Register Form */}
        <div className="lg:col-span-6 bg-[#050505] border border-[#141414] rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white font-sans tracking-tight">Register Personal Account</h2>
              <p className="text-xs text-[#808a9d] mt-0.5">Free virtual paper trading account for Indian and US markets</p>
            </div>

            {error && (
              <div className="bg-[#ff333a]/10 border border-[#ff333a]/30 p-3 rounded-lg flex items-center gap-2 text-xs text-[#ff333a]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-[#808a9d] font-bold mb-1">Full Name:</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#808a9d]" />
                  <input
                    type="text"
                    required
                    placeholder="Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#2979FF] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#808a9d] font-bold mb-1">Email Address:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-[#808a9d]" />
                  <input
                    type="email"
                    required
                    placeholder="aarav@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#2979FF] font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#808a9d] font-bold mb-1">Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-[#808a9d]" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#2979FF] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Starting Complexity Tier Selection */}
              <div>
                <label className="block text-[#808a9d] font-bold mb-1.5">Initial Allocation Tier:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'basic', label: 'Basic (Guided)' },
                    { id: 'active', label: 'Active Trader' },
                    { id: 'pro', label: 'Pro Quant' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTier(t.id as any)}
                      className={`py-2 rounded-lg border font-bold text-[11px] transition-all ${
                        tier === t.id
                          ? 'bg-[#2979FF] text-white border-[#2979FF] shadow-sm'
                          : 'bg-[#080808] border-[#1a1a1a] text-[#808a9d] hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>{loading ? 'Creating Account...' : 'Register & Enter Workstation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#141414] text-xs text-[#808a9d]">
            <Link href="/" className="hover:text-white transition-colors">
              &larr; Back to Home
            </Link>
            <Link href="/login" className="text-[#2979FF] hover:underline font-bold">
              Sign In to Existing Account &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
