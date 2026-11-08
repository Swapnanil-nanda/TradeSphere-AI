'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/api-client';
import { 
  ShieldCheck, ArrowRight, Zap, TrendingUp, TrendingDown, 
  BarChart2, Layers, Bot, Activity, CheckCircle2, Lock, 
  Cpu, Award, BookOpen, AlertTriangle, ChevronDown, ChevronUp,
  HelpCircle, DollarSign, RefreshCw, Sparkles
} from 'lucide-react';

interface TickerData {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePct: number;
  market: string;
  currency: string;
}

export default function HomePage() {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [activeTier, setActiveTier] = useState<'basic' | 'active' | 'pro'>('active');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedPreviewSymbol, setSelectedPreviewSymbol] = useState<string>('RELIANCE');

  // Fetch real-time ticker snapshots from backend via apiClient
  useEffect(() => {
    apiClient.getTickers()
      .then(data => {
        if (Array.isArray(data)) setTickers(data as any);
      })
      .catch(() => {
        // Fallback default sample tickers
        setTickers([
          { symbol: 'RELIANCE', name: 'Reliance Industries', ltp: 2950.4, change: 24.8, changePct: 0.85, market: 'IN', currency: 'INR' },
          { symbol: 'NIFTY50', name: 'Nifty 50 Index', ltp: 24350.0, change: 102.1, changePct: 0.42, market: 'IN', currency: 'INR' },
          { symbol: 'TCS', name: 'Tata Consultancy', ltp: 4120.5, change: -12.8, changePct: -0.31, market: 'IN', currency: 'INR' },
          { symbol: 'AAPL', name: 'Apple Inc.', ltp: 232.1, change: 2.6, changePct: 1.15, market: 'US', currency: 'USD' },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', ltp: 141.2, change: 3.4, changePct: 2.45, market: 'US', currency: 'USD' },
          { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', ltp: 1740.0, change: 3.8, changePct: 0.22, market: 'IN', currency: 'INR' }
        ]);
      });
  }, []);

  const previewTicker = tickers.find((t) => t.symbol === selectedPreviewSymbol) || tickers[0] || {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    ltp: 2950.4,
    change: 24.8,
    changePct: 0.85,
    market: 'IN',
    currency: 'INR'
  };

  const faqs = [
    {
      q: 'Is TradeSphere AI really 100% free with no hidden charges?',
      a: 'Yes. TradeSphere AI was designed and engineered for students and retail traders on a $0 / ₹0 budget. There are zero subscription tiers, zero credit card requirements, and zero broker commissions. The platform runs 100% self-hosted or publicly in simulation mode.'
    },
    {
      q: 'How does the Pre-Trade Risk Gatekeeper prevent account blowups?',
      a: 'Unlike standard brokers that allow users to risk their entire balance on a single trade, TradeSphere AI enforces a synchronous pre-trade risk invariant. Orders are validated against configurable risk limits and account capital before execution, auto-calculating disciplined position sizes and enforcing a 3% daily drawdown breaker.'
    },
    {
      q: 'How does the 24/7 market simulator work without exchange API keys?',
      a: 'TradeSphere AI incorporates a high-performance Geometric Brownian Motion (GBM) stochastic generator coupled with Average True Range (ATR) volatility. It produces realistic 120ms price ticks, volume deltas, and simulated 20-level order book ladders for 10 core NSE and NASDAQ symbols 24 hours a day.'
    },
    {
      q: 'What is the starting virtual paper-trading capital?',
      a: 'Every registered account receives an initial virtual paper balance of ₹10,00,000 (INR). You can test long/short equities, bracket OCO orders, and track real-time Mark-to-Market (MTM) P&L in the blotter.'
    },
    {
      q: 'Is TradeSphere AI SEBI registered or affiliated with any broker?',
      a: 'No. TradeSphere AI is strictly an educational research platform and paper-trading sandbox. It is NOT a SEBI-registered advisor or licensed broker and does not accept or process real client funds.'
    }
  ];

  return (
    <div className="space-y-24 pb-20 select-none">
      {/* 1. Live Market Ticker Tape */}
      <div className="bg-[#0c121f] border-b border-[#1b253b] overflow-hidden py-2.5">
        <div className="flex items-center gap-2 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SIMULATED 24/7 FEED</span>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 text-xs font-mono">
            {tickers.map((t) => {
              const isUp = t.changePct >= 0;
              return (
                <Link
                  key={t.symbol}
                  href={`/app/paper-trading?symbol=${t.symbol}`}
                  className="flex items-center gap-2 shrink-0 hover:bg-slate-800/40 px-2 py-0.5 rounded transition-colors"
                >
                  <span className="font-bold text-slate-200">{t.symbol}</span>
                  <span className="text-slate-400 text-[11px]">
                    {t.currency === 'USD' ? '$' : '₹'}{t.ltp?.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-bold flex items-center ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '+' : ''}{t.changePct?.toFixed(2)}%
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Institutional Pre-Trade Risk Gatekeeper Built-In</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Master Market Structure. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Master Pre-Trade Risk.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              An India-first, zero-fee financial research, simulated execution, and paper-trading terminal. Experience 24/7 realistic market simulation, simulated 20-level order book ladders, and real-time Black-Scholes Options Greeks — with disciplined risk guardrails.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/app/paper-trading"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Explore Demo (No Sign-in Required)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-[#0c121f] hover:bg-[#141d30] border border-[#1b253b] text-slate-200 font-semibold text-sm transition-all"
              >
                Create Account / Sign In
              </Link>
              <Link
                href="/learning"
                className="px-4 py-3.5 text-slate-400 hover:text-white font-semibold text-sm flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Learning Academy</span>
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#1b253b]">
              <div>
                <div className="text-2xl font-black text-white">₹0 / Free</div>
                <div className="text-xs text-slate-400 font-medium">Zero Subscription Fees</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">Risk Controls</div>
                <div className="text-xs text-slate-400 font-medium">Dynamic Pre-Trade Gatekeeper</div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-400">24/7 GBM</div>
                <div className="text-xs text-slate-400 font-medium">Continuous Market Sim</div>
              </div>
            </div>
          </div>

          {/* Right Column: Workstation & Live Market Demo Preview */}
          <div className="lg:col-span-5">
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

              {/* Terminal Chrome Bar */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1b253b]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-bold text-xs text-white ml-1">Live Demo Terminal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded font-mono">
                    24/7 GBM STREAM
                  </span>
                </div>
              </div>

              {/* Symbol Tabs */}
              <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar font-mono text-[11px]">
                {['RELIANCE', 'NIFTY50', 'NVDA', 'AAPL'].map((sym) => {
                  const isSelected = (previewTicker.symbol === sym) || (sym === 'NIFTY50' && previewTicker.symbol.startsWith('NIFTY'));
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setSelectedPreviewSymbol(sym)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-[#070b14] text-slate-400 hover:text-white border border-[#1b253b]'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>

              {/* Selected Symbol Real-Time Quote Card */}
              <div className="bg-[#070b14] border border-[#1b253b] rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <span>{previewTicker.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {previewTicker.market === 'US' ? 'NASDAQ' : 'NSE'}
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                      {previewTicker.currency === 'USD' ? '$' : '₹'}
                      {Number(previewTicker.ltp || 2950.4).toFixed(2)}
                    </div>
                  </div>
                  <div
                    className={`text-right font-mono text-xs font-bold px-2 py-1 rounded ${
                      (previewTicker.changePct || 0) >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {(previewTicker.changePct || 0) >= 0 ? '+' : ''}
                    {(previewTicker.changePct || 0.85).toFixed(2)}%
                    <div className="text-[10px] font-normal text-slate-400">
                      {(previewTicker.change || 0) >= 0 ? '+' : ''}
                      {(previewTicker.change || 24.8).toFixed(2)} pts
                    </div>
                  </div>
                </div>

                {/* Simulated Microstructure Mini-Ladder */}
                <div className="pt-2 border-t border-[#1b253b]/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
                    <span className="text-emerald-400 font-semibold">BID DEPTH (BUY)</span>
                    <span className="text-slate-500">SPREAD: ~0.02%</span>
                    <span className="text-rose-400 font-semibold">ASK DEPTH (SELL)</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 flex justify-between items-center">
                        <span className="text-slate-300 text-[10px]">1,250 qty</span>
                        <span className="text-emerald-400 font-bold">
                          {previewTicker.currency === 'USD' ? '$' : '₹'}
                          {(Number(previewTicker.ltp || 2950.4) - 0.25).toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded px-2 py-1 flex justify-between items-center">
                        <span className="text-rose-400 font-bold">
                          {previewTicker.currency === 'USD' ? '$' : '₹'}
                          {(Number(previewTicker.ltp || 2950.4) + 0.25).toFixed(2)}
                        </span>
                        <span className="text-slate-300 text-[10px]">1,420 qty</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded px-2 py-0.5 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">2,800 qty</span>
                        <span className="text-emerald-400">
                          {previewTicker.currency === 'USD' ? '$' : '₹'}
                          {(Number(previewTicker.ltp || 2950.4) - 0.75).toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded px-2 py-0.5 flex justify-between items-center text-[10px]">
                        <span className="text-rose-400">
                          {previewTicker.currency === 'USD' ? '$' : '₹'}
                          {(Number(previewTicker.ltp || 2950.4) + 0.75).toFixed(2)}
                        </span>
                        <span className="text-slate-400">3,100 qty</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Technical Signals */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="bg-[#0b101b] rounded-lg p-2 border border-[#1b253b]">
                    <div className="text-[10px] text-slate-400">20-EMA TREND</div>
                    <div className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>Bullish Momentum</span>
                    </div>
                  </div>
                  <div className="bg-[#0b101b] rounded-lg p-2 border border-[#1b253b]">
                    <div className="text-[10px] text-slate-400">ORDER BOOK LADDER</div>
                    <div className="text-blue-400 font-bold flex items-center gap-1 mt-0.5">
                      <Layers className="w-3 h-3" />
                      <span>20-Level Depth</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Demo Exploration CTA */}
              <div className="space-y-2">
                <Link
                  href={`/app/paper-trading?symbol=${encodeURIComponent(previewTicker.symbol)}`}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/25"
                >
                  <span>Explore Demo Without Signing In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-slate-400 text-center">
                  Instant access to live simulated charts, DOM ladder &amp; stock screener.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 The Ideal User Journey Flowchart */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Zero-Friction Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            1. The ideal user journey
          </h2>
        </div>

        <div className="bg-[#090D14] border border-[#1b253b] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative">
          {/* Step 1: Public Landing Page */}
          <div className="bg-[#0e1624] border border-[#223049] rounded-2xl p-5 text-center">
            <h4 className="font-bold text-base text-white">Public landing page</h4>
            <p className="text-xs text-slate-400 mt-1">
              Product overview, screenshots, features and data disclaimer
            </p>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Step 2: Explore demo without signing in */}
          <div className="bg-[#0e1624] border border-[#223049] rounded-2xl p-5 text-center relative hover:border-blue-500/40 transition-all">
            <h4 className="font-bold text-base text-white">Explore demo without signing in</h4>
            <p className="text-xs text-slate-400 mt-1">
              Sample screener, simulated market data, read only charts and learning content
            </p>
            <div className="mt-3 flex justify-center">
              <Link
                href="/app/paper-trading"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-white font-mono text-xs font-bold transition-all"
              >
                <span>Launch Free Demo Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Step 3: Authentication required (Green border card matching picture) */}
          <div className="bg-[#0e1624] border-2 border-emerald-500/50 rounded-2xl p-6 text-center relative shadow-lg shadow-emerald-500/5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold mb-2">
              <Lock className="w-3 h-3" />
              <span>Authentication required</span>
            </div>
            <h4 className="font-bold text-base text-white">Create account / Sign in</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto">
              Before personal watchlists, persistent accounts, order placement, journals and saved research
            </p>
            <div className="mt-3 flex justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Step 4: Choose experience level */}
          <div className="bg-[#0e1624] border border-[#223049] rounded-2xl p-5 text-center">
            <h4 className="font-bold text-base text-white">Choose experience level</h4>
            <div className="flex items-center justify-center gap-3 my-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">Basic</span>
              <span className="text-slate-500">&rarr;</span>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold">Active</span>
              <span className="text-slate-500">&rarr;</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">Pro</span>
            </div>
            <p className="text-xs text-slate-400">
              This should control interface complexity, not financial permissions.
            </p>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>

          {/* Step 5: Personal TradeSphere workspace */}
          <div className="bg-[#1e232d] border border-[#2e3746] rounded-2xl p-6 text-center shadow-lg">
            <h4 className="font-bold text-base text-white">Personal TradeSphere workspace</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto">
              Personal paper account, watchlists, orders, portfolio and research
            </p>
          </div>
        </div>

        {/* Why this is better */}
        <div className="mt-6 text-left max-w-md">
          <div className="flex items-center gap-2 text-white font-bold text-sm mb-1.5">
            <span>Why this is better</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-90 text-slate-400" />
          </div>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li>Visitors can understand and explore the product immediately.</li>
          </ul>
        </div>
      </section>

      {/* 3. Paper-Trading Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-950/40 via-[#0c121f] to-indigo-950/30 border border-[#1b253b] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              Deterministic Simulation
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Why Paper-Trading on TradeSphere AI Is Different.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Standard paper trading apps give you fake executions at mid-prices without bid/ask spreads, market slippage, or risk boundaries—reinforcing bad habits that blow real accounts. 
              TradeSphere AI pairs deterministic paper orders against a simulated 20-level order book with disciplined risk guardrails and automated trade journaling.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-[#070b14] p-4 rounded-xl border border-[#1b253b]">
                <h4 className="font-bold text-white text-xs">₹10 Lakh Virtual Balance</h4>
                <p className="text-[11px] text-slate-400 mt-1">Realistic capital base for proper position sizing.</p>
              </div>
              <div className="bg-[#070b14] p-4 rounded-xl border border-[#1b253b]">
                <h4 className="font-bold text-white text-xs">Bracket OCO Fills</h4>
                <p className="text-[11px] text-slate-400 mt-1">Automated SL/TP state machine monitoring every tick.</p>
              </div>
              <div className="bg-[#070b14] p-4 rounded-xl border border-[#1b253b]">
                <h4 className="font-bold text-white text-xs">3% Circuit Breaker</h4>
                <p className="text-[11px] text-slate-400 mt-1">Locks trading after 3% drawdown to eliminate tilt.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Platform Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
            Institutional Capability
          </h2>
          <h3 className="text-3xl font-extrabold text-white">
            Built Around Non-Negotiable Risk Invariants
          </h3>
          <p className="text-slate-400 text-sm mt-3">
            Everything you need to analyze market microstructure, calculate options volatility surfaces, and backtest quantitative strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Pre-Trade Risk Gatekeeper</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              No order executes without passing synchronous risk checks. Protects paper capital with configurable risk thresholds, hard stop-losses, and a 3% daily drawdown breaker.
            </p>
            <Link href="/features#risk-gatekeeper" className="text-[11px] text-blue-400 font-semibold flex items-center gap-1 hover:underline">
              <span>Inspect Gatekeeper Rules</span> &rarr;
            </Link>
          </div>

          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Simulated 20-Level Order Book Ladder</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Inspect resting liquidity with 20 levels of continuous bids and asks. Direct limit execution from the ladder with transient ~120ms streaming tick cycle updates without whole-page React re-render lag.
            </p>
            <Link href="/features#level2-dom" className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 hover:underline">
              <span>Explore DOM Microstructure</span> &rarr;
            </Link>
          </div>

          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-4 hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Black-Scholes Options Greeks</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Closed-form European Black-Scholes Delta, Gamma, Theta, Vega, and IV calculated via Newton-Raphson across simulated strike chains with model disclosures.
            </p>
            <Link href="/features#options-greeks" className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 hover:underline">
              <span>View Greeks Engine</span> &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Beginner / Professional User Modes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-[#0c121f] to-[#070b14] border border-[#1b253b] rounded-3xl p-8 lg:p-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
              Adaptive Progressive Complexity
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tailored Complexity for Beginners &amp; Quants
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Beginners get guided risk guardrails without cognitive overload. Experienced quants get simulated 20-level DOM ladders, Black-Scholes Greeks, and vectorized backtesters.
            </p>

            {/* Mode Switcher Buttons */}
            <div className="inline-flex items-center gap-1 bg-[#070b14] p-1 rounded-xl border border-[#1b253b] mt-6 text-xs">
              <button
                onClick={() => setActiveTier('basic')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTier === 'basic' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Beginner: Guided Mode
              </button>
              <button
                onClick={() => setActiveTier('active')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTier === 'active' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Intermediate: Active Day Trader
              </button>
              <button
                onClick={() => setActiveTier('pro')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTier === 'pro' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Professional: Quant Mode
              </button>
            </div>
          </div>

          {/* Mode Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTier === 'basic' && (
              <>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-blue-400">Beginner Mode</div>
                  <h4 className="text-white font-bold text-sm">Clean Charts &amp; 20-EMA Trends</h4>
                  <p className="text-slate-400 text-xs">
                    Simplified charts showing only essential trend directions, dynamic Support/Resistance zones, and no clutter.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Capital Preservation</div>
                  <h4 className="text-white font-bold text-sm">Dynamic Risk &amp; Position Sizing</h4>
                  <p className="text-slate-400 text-xs">
                    One-click auto-sizer calculates safe position sizes based on your stop-loss distance, ensuring you never risk more than your predefined allocation.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-indigo-400">Contextual Mentorship</div>
                  <h4 className="text-white font-bold text-sm">Plain-English AI Coach</h4>
                  <p className="text-slate-400 text-xs">
                    Deterministic coaching cards translating technical price action into clear market structure guidelines.
                  </p>
                </div>
              </>
            )}

            {activeTier === 'active' && (
              <>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-blue-400">Active Trader</div>
                  <h4 className="text-white font-bold text-sm">Multi-Timeframe VWAP &amp; RSI</h4>
                  <p className="text-slate-400 text-xs">
                    1m, 5m, 15m, and 1D candlestick charts with volume profiles, RSI(14), and dual-market watchlists.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Execution Agility</div>
                  <h4 className="text-white font-bold text-sm">Bracket OCO Orders</h4>
                  <p className="text-slate-400 text-xs">
                    One-Cancels-the-Other state machine automatically links Take-Profit and Stop-Loss orders with sub-second cancellations.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-indigo-400">Performance Tracking</div>
                  <h4 className="text-white font-bold text-sm">Automated Trade Journal</h4>
                  <p className="text-slate-400 text-xs">
                    Comprehensive log calculating R-multiples, win expectancy, and MTM profit/loss across every trade.
                  </p>
                </div>
              </>
            )}

            {activeTier === 'pro' && (
              <>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-blue-400">Professional Quant</div>
                  <h4 className="text-white font-bold text-sm">Simulated 20-Level DOM Ladder</h4>
                  <p className="text-slate-400 text-xs">
                    Real-time order book ladder with bid/ask depth volume bars, spread analytics, and instant fill triggers.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-emerald-400">Derivatives Analytics</div>
                  <h4 className="text-white font-bold text-sm">Black-Scholes Greeks Surface</h4>
                  <p className="text-slate-400 text-xs">
                    Live computation of Delta, Gamma, Theta, Vega, and IV via Newton-Raphson across strikes and 0-DTE to 30D expiries.
                  </p>
                </div>
                <div className="bg-[#090d16] p-5 rounded-xl border border-[#1b253b] space-y-3">
                  <div className="text-xs font-bold text-indigo-400">Quantitative Strategy</div>
                  <h4 className="text-white font-bold text-sm">Vectorized Backtester</h4>
                  <p className="text-slate-400 text-xs">
                    Backtest EMA cross, RSI mean reversion, and VWAP breakout strategies with Sharpe ratio, max drawdown, and equity curves.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/app/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <span>Explore All Tiers in Workstation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Learning Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">TradeSphere Academy</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Structured Learning for Every Stage</h3>
          </div>
          <Link href="/learning" className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mt-2 md:mt-0">
            <span>View Full Curriculum</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              MODULE 1
            </span>
            <h4 className="text-base font-bold text-white">Pre-Trade Risk Management 101</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Why position sizing is 10x more important than entry timing. Master dynamic risk sizing, R-multiples, and account survival mathematics.
            </p>
            <Link href="/learning#risk-basics" className="text-xs text-blue-400 font-semibold hover:underline block pt-2">
              Start Module &rarr;
            </Link>
          </div>

          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              MODULE 2
            </span>
            <h4 className="text-base font-bold text-white">Market Structure &amp; Auction Theory</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Understand VWAP, 20-EMA trend alignment, and 20-level simulated order book dynamics. Learn how institutional liquidity works.
            </p>
            <Link href="/learning#market-structure" className="text-xs text-indigo-400 font-semibold hover:underline block pt-2">
              Start Module &rarr;
            </Link>
          </div>

          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MODULE 3
            </span>
            <h4 className="text-base font-bold text-white">Options Greeks &amp; Volatility Surface</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Demystify Black-Scholes Delta, Gamma, Theta decay, and Implied Volatility. Transition from gambling to quantitative options trading.
            </p>
            <Link href="/learning#options-mastery" className="text-xs text-emerald-400 font-semibold hover:underline block pt-2">
              Start Module &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Transparent Answers
          </span>
          <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need to know about TradeSphere AI simulation, risk guardrails, and compliance.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between text-white font-bold text-sm hover:bg-slate-800/20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-[#1b253b]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
              Start Trading With Complete Discipline Today.
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              No credit card required. No API keys needed. Instant ₹10,00,000 simulated capital with institutional risk guardrails out of the box.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/app/paper-trading"
                className="px-8 py-3.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-sm shadow-lg transition-all hover:scale-105"
              >
                Launch Live Terminal Now
              </Link>
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-xl bg-blue-950/60 hover:bg-blue-950 text-white border border-white/20 font-bold text-sm transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
