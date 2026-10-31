'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShieldCheck, Activity } from 'lucide-react';
import GlobalCommandPalette from './GlobalCommandPalette';
import WorkspaceSelector from './WorkspaceSelector';
import UserMenu from './UserMenu';
import { apiClient, PortfolioAccount } from '../../lib/api-client';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [account, setAccount] = useState<PortfolioAccount | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ status: string; connected: boolean }>({
    status: 'CHECKING',
    connected: false
  });

  useEffect(() => {
    apiClient.getAccount().then(setAccount);
    apiClient.checkBackendHealth().then(setBackendHealth);

    const interval = setInterval(() => {
      apiClient.getAccount().then(setAccount);
      apiClient.checkBackendHealth().then(setBackendHealth);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-12 bg-[#0D131A] border-b border-[#25313D] px-3.5 flex items-center justify-between sticky top-0 z-20 select-none">
        {/* Left Side: Mobile Menu Button & Connection Status */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29] transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendHealth.connected ? 'bg-[#35C69A]' : 'bg-[#2979FF]'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${backendHealth.connected ? 'bg-[#35C69A]' : 'bg-[#2979FF]'}`}></span>
            </span>
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#8B99A8]">
              <span className="font-semibold text-[#E7EDF3]">NSE / US</span>
              <span>•</span>
              {backendHealth.connected ? (
                <span className="text-[#35C69A] font-bold bg-[#35C69A]/10 px-1.5 py-0.2 rounded border border-[#35C69A]/30 text-[10px]">
                  PROD ONLINE
                </span>
              ) : (
                <span className="text-[#2979FF] font-bold bg-[#2979FF]/10 px-1.5 py-0.2 rounded border border-[#2979FF]/30 text-[10px]">
                  SIMULATOR ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Global Command Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded bg-[#111922] border border-[#25313D] hover:border-[#2979FF]/50 text-[#8B99A8] hover:text-[#E7EDF3] text-xs transition-all w-48 sm:w-64 md:w-80 justify-between font-sans"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#8B99A8] shrink-0" />
            <span className="truncate text-xs">Search symbols, tools, agents...</span>
          </div>
          <kbd className="hidden sm:inline-block bg-[#151F29] border border-[#25313D] rounded px-1.5 text-[10px] text-[#8B99A8] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Right Side: Risk Gatekeeper Tracker, Workspace Selector, User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Rule A Daily Drawdown Tracker */}
          <div className="hidden lg:flex items-center gap-2 bg-[#111922] border border-[#25313D] px-2.5 py-1 rounded text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2979FF]" />
            <span className="text-[#8B99A8] text-[11px]">Daily DD:</span>
            <span className={`font-mono font-bold text-[11px] ${account?.isCircuitBreakerTripped ? 'text-[#EF6468]' : 'text-[#35C69A]'}`}>
              {(account?.dailyDrawdownPct || 0).toFixed(2)}%
            </span>
            <span className="text-[#8B99A8] text-[10px]">/ 3.0% Cap</span>
          </div>

          {/* Workspace Preset Selector */}
          <WorkspaceSelector />

          {/* User Menu */}
          <UserMenu />
        </div>
      </header>

      {/* Global Command Search Palette Modal */}
      <GlobalCommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
