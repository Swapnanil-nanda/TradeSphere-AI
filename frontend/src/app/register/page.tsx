'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<'basic' | 'active' | 'pro'>('active');
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

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 select-none bg-[#000000] text-[#F0F3F6]">
      <div className="bg-[#050505] border border-[#141414] rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF] flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20 mx-auto">
            Ω
          </div>
          <h1 className="text-2xl font-black text-white font-sans tracking-tight">Create Virtual Account</h1>
          <p className="text-xs text-[#808a9d]">100% Free • Verified ₹10,00,000 Paper Capital &amp; Cash Ledger</p>
        </div>

        {/* 1-Click Instant Guest Access */}
        <div className="p-3 bg-[#080808] border border-[#1a1a1a] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#00c805] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00c805] animate-pulse" />
              NO GATEKEEPING
            </span>
            <span className="text-[#808a9d]">Instant Launch</span>
          </div>
          <p className="text-[11px] text-[#808a9d] leading-relaxed">
            Skip registration anytime and jump directly to the live trading workstation.
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
          <span className="flex-shrink mx-2 text-[#808a9d] text-[10px] uppercase font-mono">Or Register Personal Account</span>
          <div className="flex-grow border-t border-[#141414]"></div>
        </div>

        {error && (
          <div className="bg-[#ff333a]/10 border border-[#ff333a]/30 p-3 rounded-lg flex items-center gap-2 text-xs text-[#ff333a]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[#808a9d] font-bold mb-1">Full Name:</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#808a9d]" />
              <input
                type="text"
                required
                placeholder="Aarav Mehta"
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
                placeholder="aarav@example.com"
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
            <label className="block text-[#808a9d] font-bold mb-1.5">Starting Experience Tier:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'basic', label: 'Basic' },
                { id: 'active', label: 'Active' },
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
            className="w-full py-2.5 rounded-lg bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Registering with Backend OMS...' : 'Create Account & Open Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 text-xs text-[#808a9d]">
          <Link href="/" className="hover:text-white transition-colors">
            &larr; Back to Home
          </Link>
          <Link href="/login" className="text-[#2979FF] hover:underline font-bold">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
