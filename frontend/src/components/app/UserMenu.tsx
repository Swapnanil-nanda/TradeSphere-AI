'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, RotateCcw, ShieldCheck, ChevronDown, User, LogIn } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(apiClient.getUserProfile());
  const [isAuthed, setIsAuthed] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const update = () => {
      setUser(apiClient.getUserProfile());
      setIsAuthed(apiClient.isAuthenticated());
    };
    update();

    window.addEventListener('tradesphere_auth_change', update);
    window.addEventListener('tradesphere_tier_change', update);
    return () => {
      window.removeEventListener('tradesphere_auth_change', update);
      window.removeEventListener('tradesphere_tier_change', update);
    };
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
    apiClient.logout();
    router.push('/login');
  };

  return (
    <div className="relative select-none" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 px-2.5 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] text-xs text-[#F0F3F6] transition-all"
      >
        <div className={`w-5 h-5 rounded ${isAuthed ? 'bg-[#2979FF]' : 'bg-[#D8AB5E]'} text-white font-bold flex items-center justify-center text-[10px] shadow-2xs`}>
          {isAuthed ? (user.name ? user.name.charAt(0).toUpperCase() : 'U') : 'G'}
        </div>
        <div className="hidden sm:block text-left font-sans">
          <div className="font-semibold text-xs leading-tight text-[#F0F3F6]">
            {isAuthed ? user.name : 'Guest Demo'}
          </div>
          <div className="text-[10px] text-[#808a9d] capitalize font-mono">
            {isAuthed ? `${user.tier} Tier` : 'Demo Mode'}
          </div>
        </div>
        <ChevronDown className="w-3 h-3 text-[#808a9d]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-64 bg-[#050505] border border-[#141414] rounded-lg shadow-2xl p-1.5 z-50 text-xs space-y-1">
          {isAuthed ? (
            <>
              {/* Authenticated user banner */}
              <div className="p-2.5 border-b border-[#141414] bg-[#080808] rounded mb-1">
                <div className="font-bold text-white text-xs">{user.name}</div>
                <div className="text-[11px] text-[#808a9d] truncate font-mono">{user.email}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#101010] border border-[#1a1a1a] text-[#00c805] font-semibold text-[10px] font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>₹10,00,000 Equity (1% Cap)</span>
                </div>
              </div>

              <Link
                href="/app/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#121212] text-[#808a9d] hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-[#808a9d]" />
                <span>Settings &amp; Risk Controls</span>
              </Link>

              <button
                onClick={handleResetLedger}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#121212] text-[#808a9d] hover:text-[#D8AB5E] transition-colors text-left"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D8AB5E]" />
                <span>Reset Virtual Ledger (₹10L)</span>
              </button>

              <div className="border-t border-[#141414] pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-[#121212] text-[#ff333a] transition-colors text-left font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest / Demo Mode banner */}
              <div className="p-2.5 border-b border-[#141414] bg-[#080808] rounded mb-1 space-y-1">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D8AB5E]"></span>
                  <span>Guest Demo Session</span>
                </div>
                <p className="text-[10px] text-[#808a9d] leading-relaxed">
                  You are exploring simulated market data. Sign in to place orders, save watchlists, and preserve presets.
                </p>
              </div>

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold transition-colors text-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In or Register</span>
              </Link>

              <button
                onClick={async () => {
                  setOpen(false);
                  await apiClient.googleLogin({
                    email: 'trader.' + Math.random().toString(36).substring(2, 7) + '@gmail.com',
                    fullName: 'Google Trader'
                  });
                  window.location.reload();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#121212] hover:bg-[#1c1c1c] text-white font-semibold transition-colors text-xs mt-1"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
