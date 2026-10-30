import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Zap, Bot, Activity, Layers, TrendingUp, Home } from 'lucide-react';

export default function Header({ mode, setMode, portfolio, activeSymbol, onOpenCoach }) {
  const account = portfolio?.account || {
    netLiquidation: 1000000,
    dailyPnL: 0,
    dailyPnLPct: 0,
    currentCash: 1000000,
    tradingLocked: false
  };

  const isProfit = account.dailyPnL >= 0;

  return (
    <header className="h-14 border-b border-[#1b253b] bg-[#0c121f] px-4 flex items-center justify-between text-xs select-none">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity" title="Back to Public Website">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/20">
            Ω
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              TradeSphere<span className="text-blue-500">AI</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Terminal Engine</div>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#070b14] border border-[#1b253b] text-slate-300 hover:text-white font-semibold text-[11px] transition-all ml-1"
        >
          <Home className="w-3 h-3 text-blue-400" />
          <span>Website</span>
        </Link>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* 24/7 Simulator Status Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>24/7 PAPER SIMULATOR</span>
        </div>
      </div>

      {/* Adaptive 3-Tier Mode Switcher */}
      <div className="flex items-center p-1 rounded-lg bg-[#070b14] border border-[#1b253b]">
        <button
          onClick={() => setMode('basic')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
            mode === 'basic'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Basic (Guided)</span>
        </button>

        <button
          onClick={() => setMode('active')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
            mode === 'active'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Active Trader</span>
        </button>

        <button
          onClick={() => setMode('pro')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
            mode === 'pro'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Pro Quant</span>
        </button>
      </div>

      {/* Account Equity, Circuit Breaker & AI Coach */}
      <div className="flex items-center gap-4">
        {/* Net Equity */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Net Equity</div>
          <div className="font-bold text-white text-sm font-['JetBrains_Mono']">
            ₹{account.netLiquidation?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Daily PnL */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Today's P&L</div>
          <div className={`font-bold text-sm font-['JetBrains_Mono'] ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}₹{account.dailyPnL?.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({account.dailyPnLPct?.toFixed(2)}%)
          </div>
        </div>

        {/* Circuit Breaker Status */}
        {account.tradingLocked ? (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-bounce">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>CIRCUIT BREAKER</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-semibold" title="3% Daily Drawdown Circuit Breaker Guard">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RISK GUARD 3%</span>
          </div>
        )}

        {/* AI Risk Coach Button */}
        <button
          onClick={onOpenCoach}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>AI Coach</span>
        </button>
      </div>
    </header>
  );
}
