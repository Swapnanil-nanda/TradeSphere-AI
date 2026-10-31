'use client';

import React, { useState, useEffect } from 'react';
import WatchlistTable from '../../../components/app/WatchlistTable';
import StockCard from '../../../components/app/StockCard';
import EmptyState from '../../../components/app/EmptyState';
import ErrorState from '../../../components/app/ErrorState';
import { TableSkeleton, CardSkeleton } from '../../../components/app/LoadingSkeleton';
import { apiClient, Ticker } from '../../../lib/api-client';
import { Plus, Eye, Search, Trash2, ArrowUpRight, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WatchlistGroup {
  id: string;
  name: string;
  symbols: string[];
}

export default function WatchlistsPage() {
  const [allTickers, setAllTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Watchlist collections
  const [watchlists, setWatchlists] = useState<WatchlistGroup[]>([
    { id: 'default', name: 'Primary Watchlist', symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'AAPL', 'NVDA'] },
    { id: 'nifty-momentum', name: 'Nifty Momentum', symbols: ['RELIANCE', 'ICICIBANK', 'SBIN', 'TATAMOTORS'] },
    { id: 'us-tech', name: 'US Tech Leaders', symbols: ['AAPL', 'MSFT', 'NVDA', 'TSLA'] }
  ]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('default');
  const [activeSymbol, setActiveSymbol] = useState<string>('RELIANCE');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const router = useRouter();

  // Load saved watchlists from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tradesphere_watchlists');
      if (saved) {
        setWatchlists(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, []);

  // Save on change
  const saveWatchlists = (newList: WatchlistGroup[]) => {
    setWatchlists(newList);
    try {
      localStorage.setItem('tradesphere_watchlists', JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const tickers = await apiClient.getTickers();
      setAllTickers(tickers);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load watchlist tickers. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];

  const watchlistTickers = activeWatchlist
    ? activeWatchlist.symbols
        .map(sym => allTickers.find(t => t.symbol === sym))
        .filter((t): t is Ticker => t !== undefined)
    : [];

  const handleRemoveSymbol = (symbol: string) => {
    const updated = watchlists.map(w => {
      if (w.id === activeWatchlistId) {
        return { ...w, symbols: w.symbols.filter(s => s !== symbol) };
      }
      return w;
    });
    saveWatchlists(updated);
  };

  const handleAddSymbol = (symbol: string) => {
    if (!activeWatchlist.symbols.includes(symbol)) {
      const updated = watchlists.map(w => {
        if (w.id === activeWatchlistId) {
          return { ...w, symbols: [...w.symbols, symbol] };
        }
        return w;
      });
      saveWatchlists(updated);
    }
    setSearchQuery('');
  };

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    const newId = `wl-${Date.now()}`;
    const newList: WatchlistGroup = {
      id: newId,
      name: newListName.trim(),
      symbols: ['RELIANCE', 'AAPL']
    };
    const updated = [...watchlists, newList];
    saveWatchlists(updated);
    setActiveWatchlistId(newId);
    setNewListName('');
    setShowAddModal(false);
  };

  const handleDeleteWatchlist = (id: string) => {
    if (watchlists.length <= 1) {
      alert('You must keep at least one watchlist.');
      return;
    }
    const updated = watchlists.filter(w => w.id !== id);
    saveWatchlists(updated);
    setActiveWatchlistId(updated[0].id);
  };

  const selectedTicker = allTickers.find(t => t.symbol === activeSymbol) || watchlistTickers[0];

  // Search candidate tickers
  const searchCandidates = searchQuery.trim()
    ? allTickers.filter(t =>
        (t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
         t.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !activeWatchlist.symbols.includes(t.symbol)
      ).slice(0, 5)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Watchlists
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PERSISTENT STORAGE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize and monitor custom baskets of Indian and US equities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Watchlist</span>
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
            SIMULATED WATCHLIST
          </span>
          <span>Freshness: <strong className="text-slate-200">Real-time Synthetic Tick (&lt;50ms)</strong></span>
          <span className="text-slate-500">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Watchlist Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1b253b] pb-3">
        {watchlists.map(w => (
          <div
            key={w.id}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              w.id === activeWatchlistId
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-[#0c121f] text-slate-400 hover:text-white border border-[#1b253b]'
            }`}
            onClick={() => setActiveWatchlistId(w.id)}
          >
            <span>{w.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 text-slate-300 font-mono">
              {w.symbols.length}
            </span>
            {watchlists.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWatchlist(w.id);
                }}
                className="text-slate-400 hover:text-rose-400 p-0.5"
                title="Delete watchlist"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Symbol Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-[#0c121f] border border-[#1b253b] rounded-2xl p-2 px-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Add symbol to "${activeWatchlist?.name}" (e.g. INFY, TSLA, HDFCBANK)...`}
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Search Results Dropdown */}
        {searchCandidates.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0c121f] border border-[#1b253b] rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-[#1b253b]">
            {searchCandidates.map(c => (
              <div
                key={c.symbol}
                onClick={() => handleAddSymbol(c.symbol)}
                className="p-2.5 px-4 flex items-center justify-between hover:bg-slate-800/60 cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{c.symbol}</span>
                  <span className="text-slate-400 truncate max-w-xs">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-300">
                    {c.currency === 'USD' ? '$' : '₹'}{(c.ltp ?? 0).toFixed(2)}
                  </span>
                  <span className="text-blue-400 font-semibold text-[11px] flex items-center gap-0.5">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Watchlist Table + Selected Ticker Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : watchlistTickers.length === 0 ? (
            <EmptyState
              title="Watchlist is empty"
              description={`There are currently no symbols in "${activeWatchlist?.name}". Search above to add stocks.`}
            />
          ) : (
            <WatchlistTable
              tickers={watchlistTickers}
              onRemoveSymbol={handleRemoveSymbol}
              onSelectSymbol={(sym) => setActiveSymbol(sym)}
              activeSymbol={activeSymbol}
            />
          )}
        </div>

        {/* Right Sidebar: Selected Stock Spotlight */}
        <div>
          <h2 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <span>Instrument Spotlight</span>
          </h2>

          {selectedTicker ? (
            <div className="space-y-4">
              <StockCard ticker={selectedTicker} />

              <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 text-xs space-y-3">
                <div className="font-extrabold text-white pb-2 border-b border-[#1b253b] flex items-center justify-between">
                  <span>Simulated Statistics</span>
                  <span className="text-[10px] text-emerald-400 font-mono">LIVE FEED</span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                    <span className="text-slate-500 block text-[10px]">DAY HIGH</span>
                    <span className="text-white font-bold">{selectedTicker.currency === 'USD' ? '$' : '₹'}{(selectedTicker.dayHigh ?? selectedTicker.ltp ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                    <span className="text-slate-500 block text-[10px]">DAY LOW</span>
                    <span className="text-white font-bold">{selectedTicker.currency === 'USD' ? '$' : '₹'}{(selectedTicker.dayLow ?? selectedTicker.ltp ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                    <span className="text-slate-500 block text-[10px]">VOLUME</span>
                    <span className="text-white font-bold">{(((selectedTicker.volume ?? 0) / 1000) || 0).toFixed(0)}K</span>
                  </div>
                  <div className="bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                    <span className="text-slate-500 block text-[10px]">SPREAD</span>
                    <span className="text-blue-400 font-bold">
                      {selectedTicker.currency === 'USD' ? '$' : '₹'}{Math.max(0, (selectedTicker.ask ?? selectedTicker.ltp ?? 0) - (selectedTicker.bid ?? selectedTicker.ltp ?? 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => router.push(`/app/charts?symbol=${selectedTicker.symbol}`)}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center text-xs transition-all"
                  >
                    Open Chart
                  </button>
                  <button
                    onClick={() => router.push(`/app/paper-trading?symbol=${selectedTicker.symbol}`)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center text-xs transition-all"
                  >
                    Trade
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 text-center text-xs text-slate-500">
              Select any symbol from your watchlist to preview statistics.
            </div>
          )}
        </div>
      </div>

      {/* New Watchlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateWatchlist}
            className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Create New Watchlist</h3>
            <p className="text-xs text-slate-400">
              Enter a descriptive name for your custom basket of stocks.
            </p>

            <input
              type="text"
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g. Swing Trading Candidates"
              className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl border border-[#1b253b] text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
