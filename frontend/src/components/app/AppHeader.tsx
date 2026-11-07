'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShieldCheck, Activity, PanelLeft, Sparkles, Layers, Sliders, AlertTriangle, TrendingUp, TrendingDown, Clock, X } from 'lucide-react';
import GlobalCommandPalette from './GlobalCommandPalette';
import WorkspaceSelector from './WorkspaceSelector';
import UserMenu from './UserMenu';
import { apiClient, PortfolioAccount } from '../../lib/api-client';
import { useMarketStore } from '../../lib/market-store';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
  onOpenSlideNav?: () => void;
}

function getMarketHoursInfo() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (3600000 * 5.5));
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const totalMins = hours * 60 + minutes;

  const isWeekend = day === 0 || day === 6;
  const marketOpen = 9 * 60 + 15; // 09:15 IST
  const marketClose = 15 * 60 + 30; // 15:30 IST

  if (isWeekend) {
    return { isOpen: false, text: 'NSE: CLOSED', detail: 'Weekend' };
  }
  if (totalMins >= marketOpen && totalMins < marketClose) {
    const diff = marketClose - totalMins;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return { isOpen: true, text: 'NSE: OPEN', detail: `${h}h ${m}m left` };
  }
  return { isOpen: false, text: 'NSE: CLOSED', detail: 'Opens 09:15 IST' };
}

export default function AppHeader({ onToggleMobileMenu, onOpenSlideNav }: AppHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [account, setAccount] = useState<PortfolioAccount | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ status: string; connected: boolean }>({
    status: 'CHECKING',
    connected: false
  });
  const [currentTier, setCurrentTier] = useState<'basic' | 'active' | 'pro'>('basic');
  const [isShoonyaLive, setIsShoonyaLive] = useState(false);
  const [marketHours, setMarketHours] = useState(getMarketHoursInfo());
  const [isSquareOffModalOpen, setIsSquareOffModalOpen] = useState(false);
  const [isSquaringOff, setIsSquaringOff] = useState(false);

  const quotes = useMarketStore(state => state.quotes);
  const niftyQuote = quotes['NIFTY 50'] || quotes['NIFTY50'];
  const sensexQuote = quotes['SENSEX'];

  useEffect(() => {
    const profile = apiClient.getUserProfile();
    setCurrentTier(profile.tier || 'basic');

    apiClient.getAccount().then(setAccount);
    apiClient.checkBackendHealth().then(setBackendHealth);

    // Check Shoonya broker connection status
    fetch('/api/broker/shoonya?action=status')
      .then(r => r.json())
      .then(d => {
        if (d.connected) setIsShoonyaLive(true);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      apiClient.getAccount().then(setAccount);
      apiClient.checkBackendHealth().then(setBackendHealth);
      setMarketHours(getMarketHoursInfo());
    }, 12000);

    const handleTierChange = (e: any) => {
      if (e.detail?.tier) {
        setCurrentTier(e.detail.tier);
      }
    };
    window.addEventListener('tradesphere_tier_change', handleTierChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tradesphere_tier_change', handleTierChange);
    };
  }, []);

  const handleSelectTier = (tier: 'basic' | 'active' | 'pro') => {
    setCurrentTier(tier);
    apiClient.updateUserPreferences({ tier });
    window.dispatchEvent(new CustomEvent('tradesphere_tier_change', { detail: { tier } }));
  };

  const handleSquareOffConfirm = async () => {
    setIsSquaringOff(true);
    try {
      const result = await apiClient.squareOffAllPositions();
      alert(`Success: Closed ${result.closedCount} open positions at market.`);
      setIsSquareOffModalOpen(false);
      apiClient.getAccount().then(setAccount);
      window.dispatchEvent(new CustomEvent('tradesphere_order_placed'));
    } catch (err: any) {
      alert(`Error during emergency square off: ${err.message}`);
    } finally {
      setIsSquaringOff(false);
    }
  };

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
      if (e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsSquareOffModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSlideNav, onToggleMobileMenu]);

  // Calculate MTM metrics
  const netLiq = Number(account?.netLiquidation ?? 1000000);
  const startEq = Number(account?.initialEquity ?? 1000000);
  const totalPnl = netLiq - startEq;
  const totalPnlPct = startEq > 0 ? (totalPnl / startEq) * 100 : 0;
  const isPnlUp = totalPnl >= 0;

  return (
    <>
      <header className="h-12 bg-[#000000] border-b border-[#141414] px-3.5 flex items-center justify-between sticky top-0 z-20 select-none">
        {/* Left Side: Workstation Brand & Connection Status */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Navigation Trigger (Hidden on Desktop) */}
          <button
            onClick={onToggleMobileMenu || onOpenSlideNav}
            className="md:hidden flex items-center gap-1.5 px-2 py-1 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] text-white text-xs font-semibold transition-all"
            title="Open Navigation"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 text-[#2979FF]" />
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isShoonyaLive ? 'bg-[#00c805]' : backendHealth.connected ? 'bg-[#00c805]' : 'bg-[#2979ff]'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isShoonyaLive ? 'bg-[#00c805]' : backendHealth.connected ? 'bg-[#00c805]' : 'bg-[#2979ff]'}`}></span>
            </span>
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#808a9d]">
              <span className="font-semibold text-white">NSE / US</span>
              <span>•</span>
              {isShoonyaLive ? (
                <span className="text-[#00c805] font-bold bg-[#00c805]/10 px-1.5 py-0.2 rounded border border-[#00c805]/30 text-[10px]" title="Connected to Finvasia Shoonya live exchange feed">
                  LIVE (SHOONYA • NSE)
                </span>
              ) : (
                <span className="text-[#2979ff] font-bold bg-[#2979ff]/10 px-1.5 py-0.2 rounded border border-[#2979ff]/30 text-[10px]" title="Market data generated by 24/7 continuous GBM simulation engine">
                  SIMULATED (GBM FEED)
                </span>
              )}
            </div>
          </div>

          {/* Market Hours Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#080808] border border-[#1a1a1a] text-[10px] font-mono">
            <Clock className={`w-3 h-3 ${marketHours.isOpen ? 'text-[#00c805]' : 'text-amber-400'}`} />
            <span className={marketHours.isOpen ? 'text-[#00c805] font-bold' : 'text-amber-400 font-bold'}>
              {marketHours.text}
            </span>
            <span className="text-[#637286]">({marketHours.detail})</span>
          </div>

          {/* Benchmark Mini Ticker */}
          {niftyQuote && (
            <div className="hidden xl:flex items-center gap-2 px-2 py-0.5 rounded bg-[#080808] border border-[#1a1a1a] text-[10px] font-mono">
              <span className="text-[#808a9d]">NIFTY 50:</span>
              <span className="text-white font-bold">{niftyQuote.ltp.toLocaleString('en-IN')}</span>
              <span className={niftyQuote.changePct >= 0 ? 'text-[#00c805]' : 'text-[#ff333a]'}>
                {niftyQuote.changePct >= 0 ? '+' : ''}{niftyQuote.changePct.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Center: Global Command Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#080808] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-[#808a9d] hover:text-[#f0f3f6] text-xs transition-all w-44 sm:w-56 md:w-64 justify-between font-sans"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#808a9d] shrink-0" />
            <span className="truncate text-xs">Search symbols, tools, orders...</span>
          </div>
          <kbd className="hidden lg:inline-block bg-[#121212] border border-[#1a1a1a] rounded px-1.5 text-[10px] text-[#808a9d] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Right Side: Live MTM, Square-Off All, Progressive Tier Segment, Risk Gatekeeper Tracker, Workspace Selector, User Menu */}
        <div className="flex items-center gap-2">
          {/* Live Persistent MTM Ticker */}
          <div className="flex items-center gap-2 bg-[#080808] border border-[#1a1a1a] px-2.5 py-1 rounded text-xs font-mono">
            <span className="text-[#808a9d] text-[10px]">Total P&amp;L:</span>
            <span className={`font-bold text-[11px] flex items-center gap-0.5 ${isPnlUp ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
              {isPnlUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPnlUp ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-[10px] font-normal">({isPnlUp ? '+' : ''}{totalPnlPct.toFixed(2)}%)</span>
            </span>
          </div>

          {/* Emergency Square-Off All Button */}
          <button
            onClick={() => setIsSquareOffModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#ff333a]/10 hover:bg-[#ff333a]/20 border border-[#ff333a]/30 hover:border-[#ff333a]/60 text-[#ff333a] text-[11px] font-mono font-bold transition-all"
            title="Emergency Panic Button: Market exit all open positions (Shift+E)"
          >
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">Exit All</span>
          </button>

          {/* Progressive Complexity Tier Switcher (Basic / Active / Pro) */}
          <div className="flex items-center bg-[#080808] border border-[#1a1a1a] rounded-lg p-0.5 text-[11px] font-sans">
            <button
              onClick={() => handleSelectTier('basic')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                currentTier === 'basic'
                  ? 'bg-[#35C69A] text-black shadow-xs font-bold'
                  : 'text-[#808a9d] hover:text-white'
              }`}
              title="Tier 1: Guided Basic Mode (Charts, 20-EMA, 1% Risk Auto-Sizer)"
            >
              Basic
            </button>
            <button
              onClick={() => handleSelectTier('active')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                currentTier === 'active'
                  ? 'bg-[#2979FF] text-white shadow-xs font-bold'
                  : 'text-[#808a9d] hover:text-white'
              }`}
              title="Tier 2: Active Trader (Technicals, Screener, Bracket Orders, Journal)"
            >
              Active
            </button>
            <button
              onClick={() => handleSelectTier('pro')}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                currentTier === 'pro'
                  ? 'bg-[#D8AB5E] text-black shadow-xs font-bold'
                  : 'text-[#808a9d] hover:text-white'
              }`}
              title="Tier 3: Pro Quant (20-Depth DOM, Options Greeks, 8-Agent Quant Pipeline)"
            >
              Pro
            </button>
          </div>

          {/* Rule A Daily Drawdown Tracker */}
          <div className="hidden xl:flex items-center gap-2 bg-[#080808] border border-[#1a1a1a] px-2.5 py-1 rounded text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2979FF]" />
            <span className="text-[#808a9d] text-[11px]">Daily DD:</span>
            <span className={`font-mono font-bold text-[11px] ${account?.isCircuitBreakerTripped ? 'text-[#ff333a]' : 'text-[#00c805]'}`}>
              {Number(account?.dailyDrawdownPct ?? 0).toFixed(2)}%
            </span>
            <span className="text-[#808a9d] text-[10px]">/ 3.0% Cap</span>
          </div>

          {/* Workspace Preset Selector */}
          <WorkspaceSelector />

          {/* Optional Guided Tour / Tier Setup Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('tradesphere_open_onboarding'))}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#080808] hover:bg-[#151F29] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-[#808a9d] hover:text-[#f0f3f6] text-xs font-semibold transition-all"
            title="Configure Trading Experience Tier & Guided Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2979FF]" />
            <span className="hidden md:inline">Tour / Tier Setup</span>
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </header>

      {/* Emergency Square Off All Confirmation Modal */}
      {isSquareOffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c121f] border border-[#ff333a]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
              <div className="flex items-center gap-2 text-[#ff333a] font-bold text-base">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Emergency Square-Off All Positions</span>
              </div>
              <button
                onClick={() => setIsSquareOffModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Are you sure you want to market close all open equity and derivative positions immediately? This will cancel open orders and protect account capital.
            </p>

            <div className="bg-[#070b14] p-3 rounded-xl border border-[#1b253b] text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Account Net Liquidation:</span>
                <span className="text-white font-bold">₹{netLiq.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Total P&amp;L:</span>
                <span className={isPnlUp ? 'text-[#00c805] font-bold' : 'text-[#ff333a] font-bold'}>
                  {isPnlUp ? '+' : ''}₹{totalPnl.toFixed(2)} ({totalPnlPct.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSquareOffModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#080808] border border-[#1a1a1a] hover:bg-[#151F29] text-xs font-semibold text-slate-300 transition-all"
              >
                Cancel (Esc)
              </button>
              <button
                type="button"
                disabled={isSquaringOff}
                onClick={handleSquareOffConfirm}
                className="px-4 py-2 rounded-xl bg-[#ff333a] hover:bg-rose-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-rose-900/30 font-mono"
              >
                {isSquaringOff ? (
                  <span>Squaring Off...</span>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Confirm Square-Off</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Command Search Palette Modal */}
      <GlobalCommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
