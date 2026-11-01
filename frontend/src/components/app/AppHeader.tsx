'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShieldCheck, Activity, PanelLeft } from 'lucide-react';
import GlobalCommandPalette from './GlobalCommandPalette';
import WorkspaceSelector from './WorkspaceSelector';
import UserMenu from './UserMenu';
import { apiClient, PortfolioAccount } from '../../lib/api-client';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
  onOpenSlideNav?: () => void;
}

export default function AppHeader({ onToggleMobileMenu, onOpenSlideNav }: AppHeaderProps) {
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
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (onOpenSlideNav) onOpenSlideNav();
        else if (onToggleMobileMenu) onToggleMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSlideNav, onToggleMobileMenu]);

  return (
    <>
      <header className="h-12 bg-[#000000] border-b border-[#141414] px-3.5 flex items-center justify-between sticky top-0 z-20 select-none">
        {/* Left Side: Slide-In All Sites Panel Trigger & Connection Status */}
        <div className="flex items-center gap-2.5">
          {/* Slide-In Navigation Panel Trigger Button (Accessible on ALL screens) */}
          <button
            onClick={onOpenSlideNav || onToggleMobileMenu}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-white text-xs font-semibold transition-all group"
            title="Slide in Left-hand Panel to choose any site (Alt + S)"
            aria-label="Slide in Left Panel to choose every site"
          >
            <PanelLeft className="w-3.5 h-3.5 text-[#2979FF] group-hover:scale-105 transition-transform" />
            <span className="font-sans text-[11px] font-bold text-[#f0f3f6]">
              Choose Site
            </span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendHealth.connected ? 'bg-[#00c805]' : 'bg-[#2979ff]'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${backendHealth.connected ? 'bg-[#00c805]' : 'bg-[#2979ff]'}`}></span>
            </span>
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#808a9d]">
              <span className="font-semibold text-white">NSE / US</span>
              <span>•</span>
              {backendHealth.connected ? (
                <span className="text-[#00c805] font-bold bg-[#00c805]/10 px-1.5 py-0.2 rounded border border-[#00c805]/30 text-[10px]">
                  LIVE FEED
                </span>
              ) : (
                <span className="text-[#00c805] font-bold bg-[#00c805]/10 px-1.5 py-0.2 rounded border border-[#00c805]/30 text-[10px]">
                  LIVE READY
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Global Command Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded bg-[#080808] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-[#808a9d] hover:text-[#f0f3f6] text-xs transition-all w-48 sm:w-64 md:w-80 justify-between font-sans"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#808a9d] shrink-0" />
            <span className="truncate text-xs">Search symbols, tools, orders...</span>
          </div>
          <kbd className="hidden sm:inline-block bg-[#121212] border border-[#1a1a1a] rounded px-1.5 text-[10px] text-[#808a9d] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Right Side: Risk Gatekeeper Tracker, Workspace Selector, User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Rule A Daily Drawdown Tracker */}
          <div className="hidden lg:flex items-center gap-2 bg-[#080808] border border-[#1a1a1a] px-2.5 py-1 rounded text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2979FF]" />
            <span className="text-[#808a9d] text-[11px]">Daily DD:</span>
            <span className={`font-mono font-bold text-[11px] ${account?.isCircuitBreakerTripped ? 'text-[#ff333a]' : 'text-[#00c805]'}`}>
              {Number(account?.dailyDrawdownPct ?? 0).toFixed(2)}%
            </span>
            <span className="text-[#808a9d] text-[10px]">/ 3.0% Cap</span>
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
