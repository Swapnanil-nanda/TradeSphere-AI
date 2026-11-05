'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Zap,
  User, Sliders, CheckCircle2, ChevronRight, Sparkles, BookOpen
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function LoginPage() {
  const [email, setEmail] = useState('demo.trader@tradesphere.ai');
  const [password, setPassword] = useState('TradeSafe2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.login({ email, password });
      router.push('/app/paper-trading');
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate with backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLaunch = () => {
    // Isolated guest session allotted to basic tier
    apiClient.switchUserContext('guest.trader@tradesphere.ai', 'Guest Trader');
    router.push('/app/paper-trading');
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 select-none bg-[#000000] text-[#F0F3F6]">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: The 3 Canonical Workstation Sections */}
        <div className="lg:col-span-6 bg-[#090D12] border border-[#25313D] rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2979FF] flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">
                Ω
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">TradeSphere AI</h1>
                <p className="text-[11px] text-[#8B99A8] font-mono">100% Free Self-Hosted Workstation</p>
              </div>
            </div>

            <p className="text-xs text-[#8B99A8] leading-relaxed">
              Every user receives an isolated multi-tenant account with dedicated transactional cash tracking and three canonical architecture sections:
            </p>

            {/* The 3 Canonical Sections */}
            <div className="space-y-3 font-sans text-xs">
              {/* Section 1 */}
              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2979FF]" />
                    <span>Section 1: User Profile &amp; Virtual Capital</span>
                  </span>
                  <span className="text-[#35C69A] font-mono font-bold">₹10,00,000 Equity</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Dedicated user login with independent paper trading ledger, zero real money risk, and persistent transaction history.
                </p>
              </div>

              {/* Section 2 */}
              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#D8AB5E]" />
                    <span>Section 2: Complexity Tier &amp; Access</span>
                  </span>
                  <span className="text-[#2979FF] font-mono font-bold">Tier 1: Basic Allotted</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Post-login onboarding asks your trading experience and assigns Tier 1 Basic Trader. Unlock Active Trader &amp; Pro Quant progressively.
                </p>
              </div>

              {/* Section 3 */}
              <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#35C69A]" />
                    <span>Section 3: Pre-Trade Risk Parameters</span>
                  </span>
                  <span className="text-[#35C69A] font-mono font-bold">Rule A: 1.0% Cap</span>
                </div>
                <p className="text-[11px] text-[#8B99A8] leading-relaxed">
                  Mandatory hard Stop-Loss validation, 3.0% daily session drawdown circuit breaker, and zero-sizing on risk breach.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Instant Launch Button */}
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

        {/* Right Column: User Sign In / Registration Access */}
        <div className="lg:col-span-6 bg-[#050505] border border-[#141414] rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white font-sans tracking-tight">Sign In to Your Account</h2>
              <p className="text-xs text-[#808a9d] mt-0.5">Enter your email to load your isolated profile and trading ledger</p>
            </div>

            {error && (
              <div className="bg-[#ff333a]/10 border border-[#ff333a]/30 p-3 rounded-lg flex items-center gap-2 text-xs text-[#ff333a]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google One-Click Sign In */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  const googleUserEmail = 'trader.' + Math.random().toString(36).substring(2, 7) + '@gmail.com';
                  await apiClient.googleLogin({ email: googleUserEmail, fullName: 'Google Trader' });
                  router.push('/app/paper-trading');
                } catch (e: any) {
                  setError(e.message || 'Google sign-in failed');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 border-t border-[#1a1a1a]"></div>
              <span className="text-[10px] text-[#808a9d] uppercase font-bold tracking-wider">or sign in with email</span>
              <div className="flex-1 border-t border-[#1a1a1a]"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#808a9d] font-bold mb-1">Email Address:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-[#808a9d]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded-lg pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#2979FF] font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In & Enter Workstation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3 bg-[#0D131A] rounded-xl border border-[#25313D] text-[11px] text-[#8B99A8] leading-relaxed">
              <strong className="text-white block mb-0.5">💡 Post-Login Experience:</strong>
              After entering, you will answer 3 quick questions about your trading background and be alloted to <strong>Tier 1 — Basic Trader</strong> with guided tools and safe risk limits.
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#141414] text-xs text-[#808a9d]">
            <Link href="/" className="hover:text-white transition-colors">
              &larr; Back to Home
            </Link>
            <Link href="/register" className="text-[#2979FF] hover:underline font-bold">
              Create New Account &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}