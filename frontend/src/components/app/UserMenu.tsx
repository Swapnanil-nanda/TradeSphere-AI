'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react';
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
        className="flex items-center gap-2 p-1 px-2.5 rounded bg-[#111922] hover:bg-[#151F29] border border-[#25313D] text-xs text-[#E7EDF3] transition-all"
      >
        <div className="w-5 h-5 rounded bg-[#2979FF] text-white font-bold flex items-center justify-center text-[10px] shadow-2xs">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block text-left font-sans">
          <div className="font-semibold text-xs leading-tight text-[#E7EDF3]">{user.name}</div>
          <div className="text-[10px] text-[#8B99A8] capitalize font-mono">{user.tier} Tier</div>
        </div>
        <ChevronDown className="w-3 h-3 text-[#8B99A8]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-60 bg-[#111922] border border-[#25313D] rounded-md shadow-2xl p-1.5 z-50 text-xs space-y-1">
          {/* User info banner */}
          <div className="p-2.5 border-b border-[#25313D] bg-[#0D131A] rounded-t mb-1">
            <div className="font-bold text-[#E7EDF3] text-xs">{user.name}</div>
            <div className="text-[11px] text-[#8B99A8] truncate font-mono">{user.email}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151F29] border border-[#25313D] text-[#35C69A] font-semibold text-[10px] font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>₹10,00,000 Equity (1% Cap)</span>
            </div>
          </div>

          <Link
            href="/app/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#8B99A8]" />
            <span>Settings &amp; Risk Controls</span>
          </Link>

          <button
            onClick={handleResetLedger}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#151F29] text-[#8B99A8] hover:text-[#D8AB5E] transition-colors text-left"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D8AB5E]" />
            <span>Reset Virtual Ledger (₹10L)</span>
          </button>

          <div className="border-t border-[#25313D] pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#151F29] text-[#EF6468] transition-colors text-left font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
