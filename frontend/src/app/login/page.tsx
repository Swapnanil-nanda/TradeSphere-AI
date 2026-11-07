'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, ArrowRight, AlertCircle, Zap, ShieldCheck, ChevronRight
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

export default function LoginPage() {
  const [email, setEmail] = useState('demo.trader@tradesphere.ai');
  const [password, setPassword] = useState('TradeSafe2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    router.prefetch('/app/paper-trading');
  }, [router]);

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
    apiClient.switchUserContext('guest.trader@tradesphere.ai', 'Guest Trader');
    router.push('/app/paper-trading');
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 select-none bg-[#000000] text-[#F0F3F6] relative overflow-hidden">
      {/* Subtle ambient workstation background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-600/10 via-indigo-500/5 to-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[420px] w-full relative z-10 space-y-6">
        
        {/* Terminal Header & Brand Pill */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D1522] border border-[#1F2E45] text-[#2979FF] text-[11px] font-mono font-semibold tracking-wide shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35C69A] animate-pulse" />
            <span>TradeSphere AI Terminal</span>
          </div>

          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2979FF] to-[#1249B3] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25 border border-white/10">
              Ω
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-xs text-[#808a9d] mt-1">
              Sign in to access your portfolio, watchlists, and quant research
            </p>
          </div>
        </div>

        {/* Main Sleek Auth Card */}
        <div className="bg-[#06090E]/90 border border-[#182333] rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          
          {error && (
            <div className="bg-[#ff333a]/10 border border-[#ff333a]/30 p-3 rounded-xl flex items-center gap-2.5 text-xs text-[#ff333a] animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Official Google One-Click Sign In */}
          <div className="space-y-2">
            <div className="w-full flex justify-center">
              <GoogleSignInButton
                text="continue_with"
                onError={(err) => setError(err)}
                onSuccess={() => router.push('/app/paper-trading')}
              />
            </div>
          </div>

          {/* Subtle Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#16202E]" />
            <span className="text-[10px] text-[#637286] uppercase font-mono font-bold tracking-widest">
              or email
            </span>
            <div className="flex-1 border-t border-[#16202E]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <label className="block text-[#8B99A8] font-semibold text-[11px]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#637286]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-[#080D15] border border-[#1B2738] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#505D70] focus:outline-none focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] font-mono text-xs transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[#8B99A8] font-semibold text-[11px]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#637286]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#080D15] border border-[#1B2738] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#505D70] focus:outline-none focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] font-mono text-xs transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] disabled:opacity-60"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Guest Demo Launch */}
          <div className="pt-2 border-t border-[#16202E]">
            <button
              type="button"
              onClick={handleGuestLaunch}
              className="w-full py-2 rounded-xl bg-transparent hover:bg-[#0D1522] border border-[#1B2738] hover:border-[#2979FF]/40 text-[#8B99A8] hover:text-[#F0F3F6] font-semibold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-[#2979FF]" />
              <span>Launch Workstation Directly as Guest</span>
            </button>
          </div>

        </div>

        {/* Card Footer Links */}
        <div className="flex items-center justify-between text-xs text-[#808a9d] px-1">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Back to Home
          </Link>
          <div className="flex items-center gap-1">
            <span>New to TradeSphere?</span>
            <Link href="/register" className="text-[#2979FF] hover:underline font-bold">
              Sign up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
