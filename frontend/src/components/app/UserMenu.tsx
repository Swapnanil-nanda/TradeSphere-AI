'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(apiClient.getUserProfile());
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(apiClient.getUserProfile());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetLedger = async () => {
    if (confirm('Reset paper trading balance back to initial ₹10,00,000 equity?')) {
      await apiClient.resetAccount();
      window.location.reload();
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('tradesphere_token');
    localStorage.removeItem('tradesphere_user');
    router.push('/login');
  };

  return (
    <div className="relative select-none" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 dark:bg-[#0c121f] dark:hover:bg-[#162035] border border-slate-200 dark:border-[#1b253b] text-xs text-slate-800 dark:text-slate-200 transition-all"
      >
        <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shadow-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <div className="font-semibold text-xs leading-tight text-slate-900 dark:text-slate-100">{user.name}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.tier} Tier</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl shadow-lg p-2 z-50 text-xs space-y-1">
          {/* User info banner */}
          <div className="p-3 border-b border-slate-100 dark:border-[#1b253b] mb-1">
            <div className="font-bold text-slate-900 dark:text-white text-xs">{user.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{user.email}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
              <ShieldCheck className="w-3 h-3" />
              <span>₹10,00,000 Paper Balance</span>
            </div>
          </div>

          <Link
            href="/app/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings &amp; Risk Parameters</span>
          </Link>

          <button
            onClick={handleResetLedger}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-left"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>Reset Paper Ledger (₹10L)</span>
          </button>

          <div className="border-t border-slate-100 dark:border-[#1b253b] pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors text-left font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
