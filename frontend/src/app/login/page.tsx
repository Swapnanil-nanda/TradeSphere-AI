'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Zap, Globe } from 'lucide-react';
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 select-none bg-[#000000] text-[#F0F3F6]">
      <div className="bg-[#050505] border border-[#141414] rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF] flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20 mx-auto">
            Ω
          </div>
          <h1 className="text-2xl font-black text-white font-sans tracking-tight">TradeSphere AI Access</h1>
          <p className="text-xs text-[#808a9d]">100% Free Self-Hosted &amp; Open Trading Research Workstation</p>
        </div>

        {/* 1-Click Instant Guest Access (No Gatekeeping) */}
        <div className="p-3 bg-[#080808] border border-[#1a1a1a] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#00c805] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00c805] animate-pulse" />
              NO GATEKEEPING
            </span>
            <span className="text-[#808a9d]">₹10,00,000 Equity</span>
          </div>
          <p className="text-[11px] text-[#808a9d] leading-relaxed">
            Anyone can explore all 33 trading, quant, and research tools immediately without logging in.
          </p>
          <Link
            href="/app/paper-trading"
            className="w-full py-2.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Launch Workstation Directly (Instant Access)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#141414]"></div>
          <span className="flex-shrink mx-2 text-[#808a9d] text-[10px] uppercase font-mono">Or Sign In with Demo Account</span>
          <div className="flex-grow border-t border-[#141414]"></div>
        </div>

        {error && (
          <div className="bg-[#ff333a]/10 border border-[#ff333a]/30 p-3 rounded-lg flex items-center gap-2 text-xs text-[#ff333a]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
            className="w-full py-2.5 rounded-lg bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-[#F0F3F6] font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In with Demo Credentials'}</span>
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 text-xs text-[#808a9d]">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Back to Home
          </Link>
          <Link href="/register" className="text-[#2979FF] hover:underline font-bold">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
