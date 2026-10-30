'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Activity, Globe } from 'lucide-react';
import { apiClient } from '../../lib/api-client';

interface TickerItem {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePct: number;
  market: string;
  currency: string;
  volume: number;
}

export default function MarketsPage() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'US'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.getTickers()
      .then(data => {
        if (Array.isArray(data)) setTickers(data as any);
      })
      .catch(() => {
        // Fallback simulated list
        setTickers([
          { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', ltp: 2950.4, change: 24.8, changePct: 0.85, market: 'IN', currency: 'INR', volume: 1823900 },
          { symbol: 'NIFTY50', name: 'NIFTY 50 Benchmark Index', ltp: 24350.0, change: 102.1, changePct: 0.42, market: 'IN', currency: 'INR', volume: 4590200 },
          { symbol: 'TCS', name: 'Tata Consultancy Services', ltp: 4120.5, change: -12.8, changePct: -0.31, market: 'IN', currency: 'INR', volume: 832000 },
          { symbol: 'INFY', name: 'Infosys Limited', ltp: 1885.2, change: 14.5, changePct: 0.78, market: 'IN', currency: 'INR', volume: 1120000 },
          { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', ltp: 1740.0, change: 3.8, changePct: 0.22, market: 'IN', currency: 'INR', volume: 2400000 },
          { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', ltp: 980.5, change: -8.4, changePct: -0.85, market: 'IN', currency: 'INR', volume: 3100000 },
          { symbol: 'AAPL', name: 'Apple Inc.', ltp: 232.1, change: 2.6, changePct: 1.15, market: 'US', currency: 'USD', volume: 54100000 },
          { symbol: 'TSLA', name: 'Tesla Inc.', ltp: 218.4, change: -4.2, changePct: -1.89, market: 'US', currency: 'USD', volume: 68200000 },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', ltp: 141.2, change: 3.4, changePct: 2.45, market: 'US', currency: 'USD', volume: 92300000 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', ltp: 428.9, change: 1.9, changePct: 0.45, market: 'US', currency: 'USD', volume: 22100000 }
        ]);
      });
  }, []);

  const filtered = tickers.filter(t => {
    if (filter === 'IN' && t.market !== 'IN') return false;
    if (filter === 'US' && t.market !== 'US') return false;
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase()) && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1b253b] pb-6">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            Dual-Market Coverage
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Markets &amp; Simulated Liquidity</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time simulated feeds calibrated to Indian (NSE) and US (NASDAQ) market dynamics.
          </p>
        </div>

        {/* Live Simulator Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>24/7 Geometric Brownian Motion Running</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Market Filter */}
        <div className="flex items-center gap-1 bg-[#0c121f] p-1 rounded-xl border border-[#1b253b] text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Markets ({tickers.length})
          </button>
          <button
            onClick={() => setFilter('IN')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              filter === 'IN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇮🇳 NSE / BSE</span>
          </button>
          <button
            onClick={() => setFilter('US')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              filter === 'US' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇺🇸 NASDAQ / NYSE</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0c121f] border border-[#1b253b] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
      </div>

      {/* Market Quotes Table */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d16] border-b border-[#1b253b] text-[11px] text-slate-400 uppercase font-sans">
              <tr>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4">LTP</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Change %</th>
                <th className="py-3 px-4">Simulated Vol</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b253b]/40">
              {filtered.map((t) => {
                const isUp = t.changePct >= 0;
                const currency = t.currency === 'USD' ? '$' : '₹';
                return (
                  <tr key={t.symbol} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-white text-sm">{t.symbol}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{t.name}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.market === 'IN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {t.market === 'IN' ? 'NSE 🇮🇳' : 'NASDAQ 🇺🇸'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      {currency}{t.ltp?.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '+' : ''}{t.change?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                        isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{t.changePct?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {t.volume?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <Link
                        href="/terminal"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-bold text-[11px] transition-all"
                      >
                        <span>Trade</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
