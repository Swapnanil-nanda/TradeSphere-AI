import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Zap, Bot, Activity, Layers, ArrowLeft, Sun, Moon, PanelLeftClose, PanelLeft, PanelBottomClose, PanelBottom } from 'lucide-react';
import { useTheme } from '../lib/theme';

export default function Header({ 
  mode, 
  setMode, 
  portfolio, 
  activeSymbol, 
  onOpenCoach,
  watchlistOpen,
  onToggleWatchlist,
  blotterOpen,
  onToggleBlotter
}) {
  const { theme, toggleTheme } = useTheme();

  const account = portfolio?.account || {
    netLiquidation: 1000000,
    dailyPnL: 0,
    dailyPnLPct: 0,
    currentCash: 1000000,
    tradingLocked: false
  };

  const isProfit = account.dailyPnL >= 0;

  return (
    <header className="h-12 border-b border-slate-200 dark:border-[#1b253b] bg-white dark:bg-[#0c121f] px-3.5 flex items-center justify-between text-xs select-none transition-colors">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-2.5">
        <Link href="/app/dashboard" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Back to Dashboard">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-medium text-[11px] hidden sm:inline">App</span>
        </Link>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {onToggleWatchlist && (
          <button
            onClick={onToggleWatchlist}
            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            title={watchlistOpen ? "Hide Watchlist" : "Show Watchlist"}
          >
            {watchlistOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        )}

        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-xs">
            Ω
          </div>
          <div className="font-bold text-xs tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
            <span>TradeSphere</span>
            <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              TERMINAL
            </span>
          </div>
        </Link>

        {/* Active Market Badge */}
        <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-semibold text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>24/7 PAPER SIMULATOR</span>
        </div>
      </div>

      {/* Adaptive 3-Tier Mode Switcher */}
      <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b]">
        <button
          onClick={() => setMode('basic')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
            mode === 'basic'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Basic: Clean charts, 20-EMA trend guide, 1% auto-risk sizing, plain-English coach"
        >
          <Layers className="w-3 h-3" />
          <span className="hidden sm:inline">Basic</span>
        </button>

        <button
          onClick={() => setMode('active')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
            mode === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Active: Multi-timeframe candlesticks, VWAP, Bracket OCO orders, trade journal"
        >
          <Activity className="w-3 h-3" />
          <span className="hidden sm:inline">Active</span>
        </button>

        <button
          onClick={() => setMode('pro')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
            mode === 'pro'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Pro Quant: 20-depth DOM ladder, Black-Scholes Greeks, backtester"
        >
          <Zap className="w-3 h-3" />
          <span className="hidden sm:inline">Pro Quant</span>
        </button>
      </div>

      {/* Account Equity, Circuit Breaker & AI Coach */}
      <div className="flex items-center gap-3">
        {/* Net Equity */}
        <div className="text-right hidden sm:block">
          <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Net Equity</div>
          <div className="font-semibold text-slate-900 dark:text-white text-xs font-mono tabular-nums">
            ₹{account.netLiquidation?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Daily PnL */}
        <div className="text-right">
          <div className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Today's P&L</div>
          <div className={`font-semibold text-xs font-mono tabular-nums ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isProfit ? '+' : ''}₹{account.dailyPnL?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({account.dailyPnLPct?.toFixed(2)}%)
          </div>
        </div>

        {/* Circuit Breaker Status */}
        {account.tradingLocked ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-bold text-[10px] animate-pulse">
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            <span className="hidden sm:inline">CIRCUIT BREAKER</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium text-[10px]" title="3% Daily Drawdown Circuit Breaker Guard">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>3% RISK GUARD</span>
          </div>
        )}

        {/* AI Risk Coach Button */}
        <button
          onClick={onOpenCoach}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <Bot className="w-3.5 h-3.5 text-blue-200" />
          <span className="hidden md:inline">AI Coach</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
