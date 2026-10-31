'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
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
      router.push('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate with backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 select-none">
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20 mx-auto">
            Ω
          </div>
          <h1 className="text-2xl font-black text-white">Sign In to TradeSphere AI</h1>
          <p className="text-xs text-slate-400">Access your ₹10,00,000 paper trading terminal &amp; journals</p>
        </div>

        {/* Demo Fast Track Badge */}
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-center gap-2.5 text-xs text-blue-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Demo credentials pre-filled for immediate testing!</span>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating with Backend...' : 'Sign In & Launch Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-400 hover:underline font-bold">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
