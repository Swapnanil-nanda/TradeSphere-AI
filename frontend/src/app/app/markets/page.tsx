'use client';

import React, { useState, useEffect } from 'react';
import MarketIndexCard from '../../../components/app/MarketIndexCard';
import QuoteTable from '../../../components/app/QuoteTable';
import StockCard from '../../../components/app/StockCard';
import EmptyState from '../../../components/app/EmptyState';
import ErrorState from '../../../components/app/ErrorState';
import { TableSkeleton, CardSkeleton } from '../../../components/app/LoadingSkeleton';
import { apiClient, Ticker } from '../../../lib/api-client';
import { Search, Compass, TrendingUp, TrendingDown, RefreshCw, Filter, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarketsPage() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'IN' | 'US'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GAINERS' | 'LOSERS'>('ALL');
  const router = useRouter();

  const loadTickers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTickers();
      setTickers(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch market data from the simulation server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickers();
  }, []);

  const handleSelectSymbol = (sym: string) => {
    router.push(`/app/charts?symbol=${sym}`);
  };

  // Filtered list
  const filteredTickers = tickers.filter(t => {
    // Market filter
    if (marketFilter !== 'ALL' && t.market !== marketFilter) return false;
    // Category filter
    if (categoryFilter === 'GAINERS' && t.changePct <= 0) return false;
    if (categoryFilter === 'LOSERS' && t.changePct >= 0) return false;
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
    }
    return true;
  });

  const topMovers = [...tickers].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Markets Overview
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              DUAL-MARKET FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time simulated quotes for Indian (NSE/BSE) and US (NASDAQ/NYSE) equities.
          </p>
        </div>

        <button
          onClick={loadTickers}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* Simulation Transparency Ribbon */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Data Source:</span>
          <span className="text-blue-400">TradeSphere Synthetic GBM Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            SIMULATED DATA
          </span>
          <span>Freshness: <strong className="text-slate-200">Real-time Synthetic Tick (&lt;50ms)</strong></span>
          <span className="text-slate-500">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Indices Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MarketIndexCard
          name="NIFTY 50"
          symbol="NSE:NIFTY50"
          value={24350.25}
          change={142.50}
          changePct={0.59}
          market="IN"
          currency="₹"
        />
        <MarketIndexCard
          name="BANK NIFTY"
          symbol="NSE:BANKNIFTY"
          value={51240.80}
          change={-110.20}
          changePct={-0.21}
          market="IN"
          currency="₹"
        />
        <MarketIndexCard
          name="S&P 500 ETF"
          symbol="NASDAQ:SPY"
          value={582.40}
          change={4.85}
          changePct={0.84}
          market="US"
          currency="$"
        />
        <MarketIndexCard
          name="NASDAQ 100"
          symbol="NASDAQ:QQQ"
          value={494.10}
          change={6.20}
          changePct={1.27}
          market="US"
          currency="$"
        />
      </div>

      {/* Top Movers Highlight */}
      <div>
        <h2 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Top Movers (Simulated High Volatility)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {topMovers.map(t => (
            <StockCard key={t.symbol} ticker={t} onSelect={handleSelectSymbol} />
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by symbol or company name (e.g. RELIANCE, AAPL, TCS)..."
            className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        {/* Market Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-[#1b253b]">
            <button
              onClick={() => setMarketFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                marketFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Markets
            </button>
            <button
              onClick={() => setMarketFilter('IN')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                marketFilter === 'IN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              NSE/BSE 🇮🇳
            </button>
            <button
              onClick={() => setMarketFilter('US')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                marketFilter === 'US' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              US Equities 🇺🇸
            </button>
          </div>

          <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-[#1b253b]">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                categoryFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategoryFilter('GAINERS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                categoryFilter === 'GAINERS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Gainers
            </button>
            <button
              onClick={() => setCategoryFilter('LOSERS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                categoryFilter === 'LOSERS' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Losers
            </button>
          </div>
        </div>
      </div>

      {/* Main Quotes Section */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTickers} />
      ) : filteredTickers.length === 0 ? (
        <EmptyState
          title="No symbols match your filters"
          description={`No results found for "${search}" with current market filters.`}
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearch('');
              setMarketFilter('ALL');
              setCategoryFilter('ALL');
            }
          }}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredTickers.length} active instruments</span>
            <span>Click any symbol to open in Charts &amp; Analysis</span>
          </div>
          <QuoteTable
            tickers={filteredTickers}
            onSelectSymbol={handleSelectSymbol}
          />
        </div>
      )}
    </div>
  );
}
