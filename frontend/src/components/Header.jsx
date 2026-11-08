import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, PanelLeftClose, PanelLeft, Layers, Sliders, Activity } from 'lucide-react';

export default function Header({ 
  mode, 
  setMode, 
  portfolio, 
  activeSymbol, 
  onOpenCoach,
  watchlistOpen,
  onToggleWatchlist
}) {
  const account = portfolio?.account || {
    netLiquidation: 1000000,
    dailyPnL: 0,
    dailyPnLPct: 0,
    currentCash: 1000000,
    tradingLocked: false
  };

  const isProfit = account.dailyPnL >= 0;

  return (
    <header className="h-11 border-b border-[#25313D] bg-[#0D131A] px-3 flex items-center justify-between text-xs select-none">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-2.5">
        <Link 
          href="/app/dashboard" 
          className="flex items-center gap-1.5 text-[#8B99A8] hover:text-[#E7EDF3] px-2 py-0.5 rounded hover:bg-[#151F29] transition-colors" 
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-medium text-[11px] hidden sm:inline font-sans">App</span>
        </Link>

        <div className="h-3.5 w-[1px] bg-[#25313D]" />

        {onToggleWatchlist && (
          <button
            onClick={onToggleWatchlist}
            className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29] transition-colors"
            title={watchlistOpen ? "Collapse Watchlist" : "Expand Watchlist"}
          >
            {watchlistOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
          </button>
        )}

        <Link href="/" className="flex items-center gap-1.5 group font-sans">
          <div className="w-5 h-5 rounded bg-[#2979FF] flex items-center justify-center font-black text-white text-[10px] shadow-2xs">
            Ω
          </div>
          <div className="font-bold text-xs tracking-tight text-[#E7EDF3] flex items-center gap-1">
            <span>TradeSphere</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#151F29] text-[#2979FF] border border-[#25313D]">
              TERMINAL
            </span>
          </div>
        </Link>

        {/* Active Market Badge */}
        <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D] font-mono text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35C69A] animate-pulse" />
          <span>24/7 PAPER SIMULATOR</span>
        </div>
      </div>

      {/* Adaptive 3-Tier Mode Switcher */}
      <div className="flex items-center p-0.5 rounded bg-[#111922] border border-[#25313D]">
        <button
          onClick={() => setMode('basic')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
            mode === 'basic'
              ? 'bg-[#2979FF] text-white shadow-2xs'
              : 'text-[#8B99A8] hover:text-[#E7EDF3]'
          }`}
          title="Basic: Clean charts, 20-EMA trend guide, dynamic risk sizing"
        >
          <Layers className="w-3 h-3" />
          <span>Basic</span>
        </button>

        <button
          onClick={() => setMode('active')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
            mode === 'active'
              ? 'bg-[#2979FF] text-white shadow-2xs'
              : 'text-[#8B99A8] hover:text-[#E7EDF3]'
          }`}
          title="Active: Candlesticks, VWAP, RSI, Bracket OCO"
        >
          <Activity className="w-3 h-3" />
          <span>Active</span>
        </button>

        <button
          onClick={() => setMode('pro')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
            mode === 'pro'
              ? 'bg-[#2979FF] text-white shadow-2xs'
              : 'text-[#8B99A8] hover:text-[#E7EDF3]'
          }`}
          title="Pro: 20-Level DOM, Black-Scholes Greeks, Strategy Backtester"
        >
          <Sliders className="w-3 h-3" />
          <span>Pro Quant</span>
        </button>
      </div>

      {/* Financial Portfolio Metrics */}
      <div className="flex items-center gap-3">
        {/* Day P&L */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111922] border border-[#25313D] text-[11px] font-mono">
          <span className="text-[#8B99A8]">Day P&amp;L:</span>
          <span className={`font-semibold num-tabular ${isProfit ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
            {isProfit ? '+' : ''}₹{account.dailyPnL?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-[10px] num-tabular ${isProfit ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
            ({isProfit ? '+' : ''}{account.dailyPnLPct?.toFixed(2)}%)
          </span>
        </div>

        {/* Net Liquidation Capital */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111922] border border-[#25313D] text-[11px] font-mono">
          <span className="text-[#8B99A8]">Equity:</span>
          <span className="font-bold text-[#E7EDF3] num-tabular">
            ₹{account.netLiquidation?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Pre-trade Risk Status */}
        <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono text-[#35C69A] bg-[#151F29] border border-[#25313D] px-2 py-0.5 rounded">
          <ShieldCheck className="w-3 h-3 text-[#35C69A]" />
          <span>1% RISK CAP ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
