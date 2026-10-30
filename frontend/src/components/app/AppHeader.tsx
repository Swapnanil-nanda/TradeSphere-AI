'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, Bell, ShieldCheck, Activity, AlertCircle, Sun, Moon } from 'lucide-react';
import GlobalSearchModal from './GlobalSearchModal';
import ModeSelector from './ModeSelector';
import UserMenu from './UserMenu';
import { apiClient, PortfolioAccount } from '../../lib/api-client';
import { useTheme } from '../../lib/theme';

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
  const { theme, toggleTheme } = useTheme();

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
      <header className="h-13 bg-white dark:bg-[#090d16] border-b border-slate-200 dark:border-[#1b253b] px-4 flex items-center justify-between sticky top-0 z-20 select-none transition-colors">
        {/* Left Side: Mobile Menu Button & Market Status */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${backendHealth.connected ? 'bg-emerald-400' : 'bg-blue-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${backendHealth.connected ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            </span>
            <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline-flex items-center gap-1.5">
              <span>NSE / US</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              {backendHealth.connected ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 text-[10px]">
                  PROD BACKEND ONLINE
                </span>
              ) : (
                <span className="text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 text-[10px]">
                  STANDALONE SIMULATOR
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Global Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] hover:border-blue-500/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs transition-all w-44 sm:w-64 md:w-80 justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search symbols, charts, tools...</span>
          </div>
          <kbd className="hidden sm:inline-block bg-white dark:bg-[#162035] border border-slate-200 dark:border-[#233354] rounded px-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Right Side: Risk Tracker, Mode Selector, Theme Toggle, User Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Daily Drawdown Risk Tracker */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] px-2.5 py-1 rounded-lg text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">Daily DD:</span>
            <span className={`font-mono font-bold text-[11px] ${account?.isCircuitBreakerTripped ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {(account?.dailyDrawdownPct || 0).toFixed(2)}%
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-[10px]">/ 3.0% Max</span>
          </div>

          {/* Mode Selector */}
          <div className="hidden sm:block">
            <ModeSelector />
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Menu Dropdown */}
          <UserMenu />
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
