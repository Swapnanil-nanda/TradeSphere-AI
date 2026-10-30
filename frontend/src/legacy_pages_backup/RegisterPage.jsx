import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState('active'); // 'basic' | 'active' | 'pro'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('tradesphere_auth', JSON.stringify({ email, name: name || 'Paper Trader', tier }));
      setLoading(false);
      navigate('/app');
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 select-none">
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20 mx-auto">
            Ω
          </div>
          <h1 className="text-2xl font-black text-white">Create ₹10 Lakh Paper Account</h1>
          <p className="text-xs text-slate-400">100% Free. No credit card or broker connection required.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Full Name:</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Aarav Mehta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="aarav@example.com"
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
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Starting Complexity Tier Selection */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Starting Experience Tier:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'basic', label: 'Basic' },
                { id: 'active', label: 'Active' },
                { id: 'pro', label: 'Pro Quant' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id)}
                  className={`py-2 rounded-lg border font-bold text-[11px] transition-all ${
                    tier === t.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-[#070b14] border-[#1b253b] text-slate-400 hover:text-white'
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
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Virtual Ledger...' : 'Create Account & Open Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
