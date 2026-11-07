'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock, Mail, User, ArrowRight, AlertCircle, Zap, ShieldCheck
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState<'basic' | 'active' | 'pro'>('pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    router.prefetch('/app/paper-trading');
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await apiClient.register({
        name,
        email,
        password,
        tier
      });
      router.push('/app/paper-trading');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check credentials or try again.');
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
            <span>Create Free Account • ₹10,00,000 Capital</span>
          </div>

          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2979FF] to-[#1249B3] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25 border border-white/10">
              Ω
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Create Your Account</h1>
            <p className="text-xs text-[#808a9d] mt-1">
              Join thousands of traders mastering risk and quant market structure
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

          {/* Official Google One-Click Registration */}
          <div className="space-y-2">
            <div className="w-full flex justify-center">
              <GoogleSignInButton
                text="signup_with"
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

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs font-sans">
            <div className="space-y-1">
              <label className="block text-[#8B99A8] font-semibold text-[11px]">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-[#637286]" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#1B2738] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#505D70] focus:outline-none focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] text-xs transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[#8B99A8] font-semibold text-[11px]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#637286]" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#1B2738] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#505D70] focus:outline-none focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] font-mono text-xs transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[#8B99A8] font-semibold text-[11px]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#637286]" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080D15] border border-[#1B2738] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-[#505D70] focus:outline-none focus:border-[#2979FF] focus:ring-1 focus:ring-[#2979FF] font-mono text-xs transition-all"
                />
              </div>
            </div>

            {/* Complexity Mode Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[#8B99A8] font-semibold text-[11px]">
                Preferred Initial Experience Mode
              </label>
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
                    className={`py-2 rounded-xl border font-bold text-[11px] transition-all ${
                      tier === t.id
                        ? 'bg-[#2979FF] text-white border-[#2979FF] shadow-sm shadow-blue-500/20'
                        : 'bg-[#080D15] border-[#1B2738] text-[#808a9d] hover:text-white hover:border-slate-600'
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
              className="w-full py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Create Free Account'}</span>
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
            <span>Already registered?</span>
            <Link href="/login" className="text-[#2979FF] hover:underline font-bold">
              Sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
