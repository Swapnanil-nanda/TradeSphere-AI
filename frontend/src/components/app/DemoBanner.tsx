'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, ArrowRight, X } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsDemo(!apiClient.isAuthenticated());
    };
    checkAuth();

    window.addEventListener('tradesphere_auth_change', checkAuth);
    return () => window.removeEventListener('tradesphere_auth_change', checkAuth);
  }, []);

  if (!isDemo || dismissed) return null;

  return (
    <div className="bg-[#0c121f] border-b border-[#1b253b] px-3.5 py-1.5 flex items-center justify-between gap-3 text-xs text-slate-300 select-none">
      <div className="flex items-center gap-2 truncate">
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/20 shrink-0">
          <Eye className="w-3 h-3" />
          <span>GUEST DEMO</span>
        </span>
        <span className="text-slate-400 truncate text-[11px]">
          Exploring in read-only guest demo mode. Simulated market feeds active. Sign in to place orders, save watchlists, and store screener presets.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/login"
          className="px-2.5 py-1 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
        >
          <span>Sign In / Register</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-slate-500 hover:text-white transition-colors"
          title="Dismiss banner for this session"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
