'use client';

import React, { useState, useEffect } from 'react';
import EmptyState from '../../../components/app/EmptyState';
import ErrorState from '../../../components/app/ErrorState';
import { TableSkeleton } from '../../../components/app/LoadingSkeleton';
import { apiClient, ScreenerStock } from '../../../lib/api-client';
import { Filter, Search, RotateCcw, TrendingUp, TrendingDown, ArrowUpRight, BarChart2, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState<'ALL' | 'IN' | 'US'>('ALL');
  const [sector, setSector] = useState<string>('ALL');
  const [trend, setTrend] = useState<string>('ALL');
  const [rsiFilter, setRsiFilter] = useState<'ALL' | 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT'>('ALL');
  const [sortBy, setSortBy] = useState<'change' | 'pe' | 'rsi' | 'symbol'>('change');
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getScreenerStocks();
      setStocks(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch screener results from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetFilters = () => {
    setSearch('');
    setMarket('ALL');
    setSector('ALL');
    setTrend('ALL');
    setRsiFilter('ALL');
    setSortBy('change');
  };

  const sectors = ['ALL', ...Array.from(new Set(stocks.map(s => s.sector)))];

  // Filtering & Sorting
  const filtered = stocks
    .filter(s => {
      if (market !== 'ALL' && s.market !== market) return false;
      if (sector !== 'ALL' && s.sector !== sector) return false;
      if (trend !== 'ALL' && s.trend !== trend) return false;
      if (rsiFilter === 'OVERSOLD' && s.rsi14 >= 45) return false;
      if (rsiFilter === 'NEUTRAL' && (s.rsi14 < 45 || s.rsi14 > 60)) return false;
      if (rsiFilter === 'OVERBOUGHT' && s.rsi14 <= 60) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'change') return b.changePct - a.changePct;
      if (sortBy === 'pe') return a.peRatio - b.peRatio;
      if (sortBy === 'rsi') return b.rsi14 - a.rsi14;
      return a.symbol.localeCompare(b.symbol);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Stock Screener
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              TECHNICAL &amp; FUNDAMENTAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Filter dual-market equities by 20-EMA trend regimes, RSI(14) momentum, and valuation ratios.
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Filter Control Box */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 space-y-4">
        {/* Top Search & Market Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker or name (e.g. INFY, AAPL)..."
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-[#1b253b] text-xs">
            <button
              onClick={() => setMarket('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                market === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Markets
            </button>
            <button
              onClick={() => setMarket('IN')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                market === 'IN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              NSE/BSE 🇮🇳
            </button>
            <button
              onClick={() => setMarket('US')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                market === 'US' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              US Equities 🇺🇸
            </button>
          </div>
        </div>

        {/* Detailed Filter Dropdowns & Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Sector */}
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Trend Regime */}
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">20-EMA Trend</label>
            <select
              value={trend}
              onChange={(e) => setTrend(e.target.value)}
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Regimes</option>
              <option value="BULLISH">Bullish (Above 20-EMA)</option>
              <option value="BEARISH">Bearish (Below 20-EMA)</option>
              <option value="CONSOLIDATION">Consolidation</option>
            </select>
          </div>

          {/* RSI Momentum */}
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">RSI(14) Momentum</label>
            <select
              value={rsiFilter}
              onChange={(e: any) => setRsiFilter(e.target.value)}
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="OVERSOLD">Oversold (&lt; 45)</option>
              <option value="NEUTRAL">Neutral (45 - 60)</option>
              <option value="OVERBOUGHT">Strong Momentum (&gt; 60)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">Sort Results By</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="change">Highest % Change</option>
              <option value="rsi">Highest RSI(14)</option>
              <option value="pe">Lowest P/E Ratio</option>
              <option value="symbol">Ticker (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No stocks match these screener criteria"
          description="Try loosening your RSI, 20-EMA trend, or sector filters to see more results."
          action={{
            label: 'Reset All Filters',
            onClick: resetFilters
          }}
        />
      ) : (
        <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden shadow-xl select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#090d16] border-b border-[#1b253b] text-[11px] text-slate-400 uppercase font-sans">
                <tr>
                  <th className="py-3 px-4">Symbol &amp; Name</th>
                  <th className="py-3 px-4">Market</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Change %</th>
                  <th className="py-3 px-4">P/E Ratio</th>
                  <th className="py-3 px-4">RSI(14)</th>
                  <th className="py-3 px-4">Technical Setup</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b253b]/40">
                {filtered.map(s => {
                  const isUp = s.changePct >= 0;
                  const currency = s.market === 'IN' ? '₹' : '$';

                  return (
                    <tr key={s.symbol} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-extrabold text-white text-sm">{s.symbol}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{s.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.market === 'IN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {s.market === 'IN' ? 'NSE 🇮🇳' : 'US 🇺🇸'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans text-[11px]">
                        {s.sector}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {currency}{s.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                          {isUp ? '+' : ''}{s.changePct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {s.peRatio.toFixed(1)}x
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          s.rsi14 >= 60 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          s.rsi14 <= 45 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {s.rsi14.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="text-[11px] font-semibold text-slate-200">{s.setup}</div>
                        <span className={`text-[9px] font-bold uppercase ${
                          s.trend === 'BULLISH' ? 'text-emerald-400' :
                          s.trend === 'BEARISH' ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          ● {s.trend}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          <button
                            onClick={() => router.push(`/app/charts?symbol=${s.symbol}`)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Open Technical Chart"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => router.push(`/app/research?symbol=${s.symbol}`)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Fundamental Research"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => router.push(`/app/paper-trading?symbol=${s.symbol}`)}
                            className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                          >
                            Trade
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
