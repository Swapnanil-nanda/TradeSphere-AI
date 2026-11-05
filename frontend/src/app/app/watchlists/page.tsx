'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import WatchlistTable, { SortField, SortDirection } from '../../../components/app/WatchlistTable';
import StockCard from '../../../components/app/StockCard';
import WatchlistAlertsModal from '../../../components/app/WatchlistAlertsModal';
import WatchlistCompareModal from '../../../components/app/WatchlistCompareModal';
import EmptyState from '../../../components/app/EmptyState';
import ErrorState from '../../../components/app/ErrorState';
import { TableSkeleton } from '../../../components/app/LoadingSkeleton';
import {
  apiClient,
  Ticker,
  WatchlistBackendData,
  WatchlistAlert
} from '../../../lib/api-client';
import { useMarketStore } from '../../../lib/market-store';
import {
  Plus,
  Search,
  Trash2,
  Copy,
  Edit2,
  Download,
  Upload,
  Bell,
  Scale,
  LineChart,
  Activity,
  Globe,
  Radio,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function WatchlistsPage() {
  // State
  const [allTickers, setAllTickers] = useState<Ticker[]>([]);
  const [watchlists, setWatchlists] = useState<WatchlistBackendData[]>([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | number>('wl_default');
  const [activeSymbol, setActiveSymbol] = useState<string>('RELIANCE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'EQUITIES' | 'INDICES' | 'ETFS'>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modals & Action States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [renameInput, setRenameInput] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertSymbol, setAlertSymbol] = useState('RELIANCE');
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // CSV Import file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Watchlists & Alerts
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tickers, wls, userAlerts] = await Promise.all([
        apiClient.getTickers(),
        apiClient.getWatchlists(),
        apiClient.getWatchlistAlerts()
      ]);

      if (Array.isArray(tickers) && tickers.length > 0) {
        setAllTickers(tickers);
      }
      if (Array.isArray(wls) && wls.length > 0) {
        setWatchlists(wls);
        if (!wls.some((w) => w.id === activeWatchlistId)) {
          setActiveWatchlistId(wls[0].id);
        }
      }
      if (Array.isArray(userAlerts)) {
        setAlerts(userAlerts);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn('[WatchlistsPage] Service sync warning:', err);
      // Fallback safely to prevent crashing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to synchronized ticks from useMarketStore (zero independent component timers)
  const storeLastUpdated = useMarketStore((state) => state.lastUpdated);
  useEffect(() => {
    if (storeLastUpdated) {
      setLastUpdated(new Date(storeLastUpdated).toLocaleTimeString());
    }
  }, [storeLastUpdated]);

  // Active Watchlist
  const activeWatchlist = useMemo(() => {
    if (!Array.isArray(watchlists) || watchlists.length === 0) return undefined;
    return watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];
  }, [watchlists, activeWatchlistId]);

  // Active Watchlist Tickers with Ordering
  const watchlistTickers = useMemo(() => {
    if (!activeWatchlist || !Array.isArray(activeWatchlist.instruments)) return [];

    let list = activeWatchlist.instruments.map((item) => {
      const t = allTickers.find((tick) => tick.symbol === item.symbol);
      if (t) return t;
      const basePrice = Number(item.basePrice ?? 1000);
      return {
        symbol: item.symbol,
        name: item.name || `${item.symbol} Equity`,
        market: (item.market as any) || 'IN',
        exchange: item.exchange || 'NSE',
        currency: item.currency || 'INR',
        ltp: basePrice,
        bid: Number((basePrice - 0.05).toFixed(2)),
        ask: Number((basePrice + 0.05).toFixed(2)),
        change: 0,
        changePct: 0,
        volume: 100000,
        dayHigh: Number((basePrice * 1.01).toFixed(2)),
        dayLow: Number((basePrice * 0.99).toFixed(2)),
        timestamp: Date.now(),
        isSimulated: !isLiveFeed,
        isLive: isLiveFeed
      } as Ticker;
    });

    // Exchange Filtering
    if (exchangeFilter !== 'ALL') {
      list = list.filter((t) => {
        if (exchangeFilter === 'NSE') return t.exchange === 'NSE';
        if (exchangeFilter === 'BSE') return t.exchange === 'BSE';
        if (exchangeFilter === 'NASDAQ') return t.exchange === 'NASDAQ';
        if (exchangeFilter === 'NYSE') return t.exchange === 'NYSE';
        return true;
      });
    }

    // Category Filtering
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'INDICES') {
        list = list.filter((t) => t.symbol.includes('NIFTY') || t.symbol.includes('BANK') || t.symbol === 'SPY' || t.symbol === 'QQQ' || t.symbol === 'SENSEX');
      } else if (categoryFilter === 'ETFS') {
        list = list.filter((t) => t.symbol === 'SPY' || t.symbol === 'QQQ');
      } else {
        list = list.filter((t) => !t.symbol.includes('NIFTY') && !t.symbol.includes('SENSEX') && t.symbol !== 'SPY' && t.symbol !== 'QQQ');
      }
    }

    // Sorting
    if (sortField) {
      list = [...list].sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (sortField === 'symbol') {
          return sortDirection === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
        }
        valA = Number(valA ?? 0);
        valB = Number(valB ?? 0);
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return list;
  }, [activeWatchlist, allTickers, exchangeFilter, categoryFilter, sortField, sortDirection, isLiveFeed]);

  // Selected Ticker for Spotlight
  const selectedTicker = useMemo(() => {
    return (
      allTickers.find((t) => t.symbol === activeSymbol) ||
      watchlistTickers[0] ||
      allTickers[0]
    );
  }, [allTickers, activeSymbol, watchlistTickers]);

  // Candidate Search Results
  const searchCandidates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const existingSymbols = new Set(activeWatchlist?.instruments?.map((i) => i.symbol) || []);
    return allTickers
      .filter((t) => (t.symbol.toLowerCase().includes(q) || (t.name && t.name.toLowerCase().includes(q))) && !existingSymbols.has(t.symbol))
      .slice(0, 6);
  }, [searchQuery, allTickers, activeWatchlist]);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(undefined);
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Reordering Handlers
  const handleMoveUp = async (index: number) => {
    if (!activeWatchlist || !Array.isArray(activeWatchlist.instruments) || index <= 0) return;
    const currentSymbols = activeWatchlist.instruments.map((i) => i.symbol);
    const temp = currentSymbols[index];
    currentSymbols[index] = currentSymbols[index - 1];
    currentSymbols[index - 1] = temp;

    const updatedInstruments = currentSymbols.map((sym) =>
      activeWatchlist.instruments.find((i) => i.symbol === sym)!
    );
    const updated = watchlists.map((w) =>
      w.id === activeWatchlist.id ? { ...w, instruments: updatedInstruments } : w
    );
    setWatchlists(updated);

    try {
      await apiClient.reorderWatchlistItems(activeWatchlist.id, currentSymbols);
    } catch {}
  };

  const handleMoveDown = async (index: number) => {
    if (!activeWatchlist || !Array.isArray(activeWatchlist.instruments) || index >= activeWatchlist.instruments.length - 1) return;
    const currentSymbols = activeWatchlist.instruments.map((i) => i.symbol);
    const temp = currentSymbols[index];
    currentSymbols[index] = currentSymbols[index + 1];
    currentSymbols[index + 1] = temp;

    const updatedInstruments = currentSymbols.map((sym) =>
      activeWatchlist.instruments.find((i) => i.symbol === sym)!
    );
    const updated = watchlists.map((w) =>
      w.id === activeWatchlist.id ? { ...w, instruments: updatedInstruments } : w
    );
    setWatchlists(updated);

    try {
      await apiClient.reorderWatchlistItems(activeWatchlist.id, currentSymbols);
    } catch {}
  };

  // Create Watchlist
  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiClient.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Create Custom Watchlist' } }));
      return;
    }
    if (!newListName.trim()) return;
    try {
      const created = await apiClient.createWatchlist(newListName.trim());
      setWatchlists((prev) => [...prev, created]);
      setActiveWatchlistId(created.id);
      setNewListName('');
      setShowCreateModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create watchlist');
    }
  };

  // Rename Watchlist
  const handleRenameWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiClient.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Rename Watchlist' } }));
      return;
    }
    if (!renameInput.trim() || !activeWatchlist) return;
    try {
      const updated = await apiClient.renameWatchlist(activeWatchlist.id, renameInput.trim());
      setWatchlists((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setShowRenameModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to rename watchlist');
    }
  };

  // Duplicate Watchlist
  const handleDuplicateWatchlist = async () => {
    if (!apiClient.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Duplicate Watchlist' } }));
      return;
    }
    if (!activeWatchlist) return;
    try {
      const dup = await apiClient.duplicateWatchlist(activeWatchlist.id);
      setWatchlists((prev) => [...prev, dup]);
      setActiveWatchlistId(dup.id);
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate watchlist');
    }
  };

  // Delete Watchlist
  const handleDeleteWatchlist = async (id: string | number) => {
    if (!apiClient.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Delete Watchlist' } }));
      return;
    }
    if (watchlists.length <= 1) {
      alert('You must keep at least one primary watchlist.');
      return;
    }
    if (!confirm('Are you sure you want to delete this watchlist?')) return;

    try {
      await apiClient.deleteWatchlist(id);
      const remaining = watchlists.filter((w) => w.id !== id);
      setWatchlists(remaining);
      setActiveWatchlistId(remaining[0].id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete watchlist');
    }
  };

  // Add Symbol
  const handleAddSymbol = async (sym: string) => {
    if (!apiClient.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Add Symbol to Watchlist' } }));
      return;
    }
    if (!activeWatchlist) return;
    try {
      const updated = await apiClient.addWatchlistItem(activeWatchlist.id, sym);
      setWatchlists((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setSearchQuery('');
    } catch (err: any) {
      alert(err.message || 'Failed to add symbol');
    }
  };

  // Remove Symbol
  const handleRemoveSymbol = async (sym: string) => {
    if (!apiClient.isAuthenticated()) {
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Remove Symbol from Watchlist' } }));
      return;
    }
    if (!activeWatchlist) return;
    try {
      const updated = await apiClient.removeWatchlistItem(activeWatchlist.id, sym);
      setWatchlists((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    } catch (err: any) {
      alert(err.message || 'Failed to remove symbol');
    }
  };

  // Toggle Compare
  const handleToggleCompare = (sym: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(sym)) {
        return prev.filter((s) => s !== sym);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 instruments simultaneously.');
        return prev;
      }
      return [...prev, sym];
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!activeWatchlist || watchlistTickers.length === 0) {
      alert('Current watchlist has no instruments to export.');
      return;
    }

    const headers = ['Symbol', 'Name', 'Exchange', 'Market', 'LTP', 'Change', 'ChangePct', 'Volume', 'DayHigh', 'DayLow', 'Currency'];
    const rows = watchlistTickers.map((t) => [
      t.symbol,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      t.exchange,
      t.market,
      Number(t.ltp ?? 0).toFixed(2),
      Number(t.change ?? 0).toFixed(2),
      Number(t.changePct ?? 0).toFixed(2),
      Number(t.volume ?? 0),
      Number(t.dayHigh ?? t.ltp ?? 0).toFixed(2),
      Number(t.dayLow ?? t.ltp ?? 0).toFixed(2),
      t.currency
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TradeSphere_Watchlist_${(activeWatchlist.name || 'Core').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeWatchlist) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      const extractedSymbols: string[] = [];

      for (const line of lines) {
        const parts = line.split(',');
        const sym = parts[0]?.replace(/["']/g, '').trim().toUpperCase();
        if (sym && sym !== 'SYMBOL' && sym.length >= 2 && !extractedSymbols.includes(sym)) {
          extractedSymbols.push(sym);
        }
      }

      if (extractedSymbols.length === 0) {
        alert('No valid symbols detected in uploaded CSV.');
        return;
      }

      let addedCount = 0;
      for (const sym of extractedSymbols.slice(0, 15)) {
        try {
          await apiClient.addWatchlistItem(activeWatchlist.id, sym);
          addedCount++;
        } catch {}
      }

      const refreshed = await apiClient.getWatchlists();
      setWatchlists(refreshed);
      alert(`Successfully imported ${addedCount} instruments into ${activeWatchlist.name}.`);
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10 select-none text-[#F0F3F6]">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Watchlists
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-mono">
              WORKSTATION ACTIVE
            </span>
          </div>
          <p className="text-xs text-[#808a9d] mt-0.5">
            Institutional basket management, live ticks, rule triggers, and comparative analysis
          </p>
        </div>

        {/* Global Action Buttons & Feed Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Feed Mode Toggle: Live vs 24/7 Simulator */}
          <button
            onClick={() => setIsLiveFeed(!isLiveFeed)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border ${
              isLiveFeed
                ? 'bg-[#00c805]/10 border-[#00c805]/40 text-[#00c805] hover:bg-[#00c805]/20'
                : 'bg-[#2979ff]/10 border-[#2979ff]/40 text-[#2979ff] hover:bg-[#2979ff]/20'
            }`}
            title="Toggle between Live Exchange Data (NSE/US) and 24/7 Simulation"
          >
            <span className={`w-2 h-2 rounded-full ${isLiveFeed ? 'bg-[#00c805] animate-pulse' : 'bg-[#2979ff]'}`}></span>
            <span>{isLiveFeed ? 'SIMULATED (GBM TICK STREAM)' : '24/7 SIMULATOR'}</span>
          </button>

          {/* New Watchlist */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#2979FF] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New List</span>
          </button>

          {/* Price Alerts */}
          <button
            onClick={() => {
              setAlertSymbol(selectedTicker?.symbol || 'RELIANCE');
              setShowAlertModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] text-[#F0F3F6] text-xs font-semibold transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-[#D8AB5E]" />
            <span>Alerts</span>
            {alerts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#D8AB5E]/20 text-[#D8AB5E] text-[10px] font-mono">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Compare Modal Trigger */}
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00c805]/15 hover:bg-[#00c805]/25 border border-[#00c805]/40 text-[#00c805] text-xs font-bold transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({selectedForCompare.length})</span>
            </button>
          )}

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] text-[#808a9d] hover:text-[#F0F3F6] text-xs transition-colors"
            title="Export watchlist as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* CSV Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#080808] hover:bg-[#121212] border border-[#1a1a1a] text-[#808a9d] hover:text-[#F0F3F6] text-xs transition-colors"
            title="Import symbols from CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleImportCSV}
            className="hidden"
          />
        </div>
      </div>

      {/* 2. Microstructure Data Feed Banner */}
      <div className="bg-[#050505] border border-[#141414] rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between text-xs text-[#808a9d] gap-3">
        <div className="flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${isLiveFeed ? 'text-[#00c805] animate-pulse' : 'text-[#2979ff]'}`} />
          <span className="font-semibold text-white">Active Data Stream:</span>
          <span className="font-mono font-bold text-white">
            {isLiveFeed ? 'Real-Time Exchange Feed (NSE / BSE / NASDAQ)' : '24/7 Geometric Brownian Motion Engine'}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className={`px-1.5 py-0.2 rounded font-bold ${
            isLiveFeed
              ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
              : 'bg-[#2979ff]/10 text-[#2979ff] border border-[#2979ff]/30'
          }`}>
            {isLiveFeed ? 'LIVE DATA' : 'SIMULATED'}
          </span>
          <span>Latency: <strong className="text-white">&lt;50ms</strong></span>
          <span className="text-[#808a9d] hidden sm:inline">{lastUpdated || new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 3. Watchlist Tabs Bar with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141414] pb-3">
        {/* Watchlist Selection Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {watchlists.map((w) => (
            <div
              key={w.id}
              onClick={() => setActiveWatchlistId(w.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                w.id === activeWatchlist?.id
                  ? 'bg-[#2979FF] text-white shadow-md shadow-blue-500/20'
                  : 'bg-[#080808] text-[#808a9d] hover:text-[#F0F3F6] border border-[#1a1a1a]'
              }`}
            >
              <span>{w.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/50 text-[#808a9d] font-mono">
                {w.instruments?.length || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Actions for Active Watchlist */}
        {activeWatchlist && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => {
                setRenameInput(activeWatchlist.name);
                setShowRenameModal(true);
              }}
              className="p-1.5 rounded text-[#808a9d] hover:text-[#F0F3F6] hover:bg-[#121212] transition-colors"
              title="Rename active watchlist"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDuplicateWatchlist}
              className="p-1.5 rounded text-[#808a9d] hover:text-[#F0F3F6] hover:bg-[#121212] transition-colors"
              title="Duplicate into new watchlist"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {!activeWatchlist.defaultList && (
              <button
                onClick={() => handleDeleteWatchlist(activeWatchlist.id)}
                className="p-1.5 rounded text-[#808a9d] hover:text-[#ff333a] hover:bg-[#121212] transition-colors"
                title="Delete this watchlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Filter Bar & Quick Instrument Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Exchange Filter Pills */}
        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded border border-[#141414] text-[11px] font-mono">
          {(['ALL', 'NSE', 'BSE', 'NASDAQ', 'NYSE'] as const).map((ex) => (
            <button
              key={ex}
              onClick={() => setExchangeFilter(ex)}
              className={`px-2 py-0.5 rounded transition-colors ${
                exchangeFilter === ex
                  ? 'bg-[#2979FF] text-white font-bold'
                  : 'text-[#808a9d] hover:text-white'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded border border-[#141414] text-[11px] font-mono">
          {(['ALL', 'EQUITIES', 'INDICES', 'ETFS'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-0.5 rounded transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#181818] text-white font-bold border border-[#2a2a2a]'
                  : 'text-[#808a9d] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input Bar with Autocomplete Candidates */}
        <div className="relative flex-1 max-w-md">
          <div className="flex items-center gap-2 bg-[#050505] border border-[#141414] rounded p-1.5 px-3 focus-within:border-[#2979FF] transition-colors">
            <Search className="w-3.5 h-3.5 text-[#808a9d]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Add stock to "${activeWatchlist?.name || 'watchlist'}"...`}
              className="w-full bg-transparent text-xs text-white placeholder-[#808a9d] focus:outline-none font-sans"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchCandidates.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#080808] border border-[#1a1a1a] rounded-lg shadow-2xl z-30 overflow-hidden divide-y divide-[#141414]">
              {searchCandidates.map((c) => (
                <div
                  key={c.symbol}
                  onClick={() => handleAddSymbol(c.symbol)}
                  className="p-2.5 px-4 flex items-center justify-between hover:bg-[#121212] cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{c.symbol}</span>
                    <span className="text-[#808a9d] truncate max-w-xs">{c.name}</span>
                    <span className="text-[9px] px-1 rounded bg-[#101010] text-[#808a9d] border border-[#1f1f1f]">
                      {c.exchange}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white tabular-nums">
                      {c.currency === 'USD' ? '$' : '₹'}{Number(c.ltp ?? 0).toFixed(2)}
                    </span>
                    <span className="text-[#2979FF] font-semibold text-[11px] flex items-center gap-0.5">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Main Workstation Grid: Table (Left 2/3) + Spotlight (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Watchlist Table */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <TableSkeleton rows={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={loadData} />
          ) : watchlistTickers.length === 0 ? (
            <EmptyState
              title="Watchlist is empty"
              description={`There are currently no symbols in "${activeWatchlist?.name || 'this list'}". Use the search bar above to add instruments.`}
            />
          ) : (
            <WatchlistTable
              tickers={watchlistTickers}
              onRemoveSymbol={handleRemoveSymbol}
              onSelectSymbol={(sym) => setActiveSymbol(sym)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              activeSymbol={activeSymbol}
              selectedForCompare={selectedForCompare}
              onToggleCompare={handleToggleCompare}
              onOpenAlertModal={(sym) => {
                setAlertSymbol(sym);
                setShowAlertModal(true);
              }}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </div>

        {/* Right Column: Instrument Spotlight & Trading Gateway */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#808a9d]">
              <LineChart className="w-3.5 h-3.5 text-[#2979FF]" />
              <span>Instrument Spotlight</span>
            </h2>
            <span className="text-[10px] font-mono text-[#00c805] bg-[#00c805]/10 px-1.5 py-0.2 rounded border border-[#00c805]/30">
              {isLiveFeed ? 'LIVE METRICS' : 'SIMULATED'}
            </span>
          </div>

          {selectedTicker ? (
            <div className="space-y-4">
              {/* Core Stock Card */}
              <StockCard ticker={selectedTicker} />

              {/* Detailed Real-time Metrics Panel */}
              <div className="bg-[#050505] border border-[#141414] rounded-lg p-4 text-xs space-y-3">
                <div className="font-extrabold text-white pb-2 border-b border-[#141414] flex items-center justify-between">
                  <span>Microstructure Metrics</span>
                  <span className="text-[10px] text-[#808a9d] font-mono font-normal">
                    {selectedTicker.market === 'US' ? 'NASDAQ / NYSE' : 'NSE / BSE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-[#080808] p-2 rounded border border-[#141414]">
                    <span className="text-[#808a9d] block text-[10px]">DAY HIGH</span>
                    <span className="text-white font-bold tabular-nums">
                      {selectedTicker.currency === 'USD' ? '$' : '₹'}
                      {Number(selectedTicker.dayHigh ?? selectedTicker.ltp ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#080808] p-2 rounded border border-[#141414]">
                    <span className="text-[#808a9d] block text-[10px]">DAY LOW</span>
                    <span className="text-white font-bold tabular-nums">
                      {selectedTicker.currency === 'USD' ? '$' : '₹'}
                      {Number(selectedTicker.dayLow ?? selectedTicker.ltp ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#080808] p-2 rounded border border-[#141414]">
                    <span className="text-[#808a9d] block text-[10px]">VOLUME</span>
                    <span className="text-white font-bold tabular-nums">
                      {((Number(selectedTicker.volume ?? 0) / 1000) || 0).toFixed(0)}K
                    </span>
                  </div>

                  <div className="bg-[#080808] p-2 rounded border border-[#141414]">
                    <span className="text-[#808a9d] block text-[10px]">SPREAD</span>
                    <span className="text-[#2979FF] font-bold tabular-nums">
                      {selectedTicker.currency === 'USD' ? '$' : '₹'}
                      {Math.max(0, Number(selectedTicker.ask ?? selectedTicker.ltp ?? 0) - Number(selectedTicker.bid ?? selectedTicker.ltp ?? 0)).toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#080808] p-2 rounded border border-[#141414]">
                    <span className="text-[#808a9d] block text-[10px]">BID</span>
                    <span className="text-[#00c805] font-bold tabular-nums">
                      {selectedTicker.currency === 'USD' ? '$' : '₹'}
                      {Number(selectedTicker.bid ?? selectedTicker.ltp ?? 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#080808] p-2 rounded border border-[#141414]">
                    <span className="text-[#808a9d] block text-[10px]">ASK</span>
                    <span className="text-[#ff333a] font-bold tabular-nums">
                      {selectedTicker.currency === 'USD' ? '$' : '₹'}
                      {Number(selectedTicker.ask ?? selectedTicker.ltp ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Direct Action Gateway */}
                <div className="pt-2 space-y-1.5 font-sans">
                  <div className="flex gap-2">
                    <Link
                      href={`/app/paper-trading?symbol=${encodeURIComponent(selectedTicker.symbol)}`}
                      className="flex-1 py-2 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-center text-xs transition-colors shadow-md shadow-blue-500/20"
                    >
                      Place Paper Order
                    </Link>
                    <Link
                      href={`/app/charts?symbol=${encodeURIComponent(selectedTicker.symbol)}`}
                      className="flex-1 py-2 rounded bg-[#101010] hover:bg-[#181818] border border-[#1f1f1f] text-white font-semibold text-center text-xs transition-colors"
                    >
                      Interactive Chart
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <Link
                      href={`/app/research/technical?symbol=${encodeURIComponent(selectedTicker.symbol)}`}
                      className="py-1.5 px-2 rounded bg-[#080808] hover:bg-[#121212] border border-[#141414] text-[#808a9d] hover:text-white text-[10px] text-center font-semibold transition-colors"
                    >
                      Technical
                    </Link>
                    <Link
                      href={`/app/research/fundamental?symbol=${encodeURIComponent(selectedTicker.symbol)}`}
                      className="py-1.5 px-2 rounded bg-[#080808] hover:bg-[#121212] border border-[#141414] text-[#808a9d] hover:text-white text-[10px] text-center font-semibold transition-colors"
                    >
                      Fundamental
                    </Link>
                    <Link
                      href={`/app/quant/multi-agent?symbol=${encodeURIComponent(selectedTicker.symbol)}`}
                      className="py-1.5 px-2 rounded bg-[#080808] hover:bg-[#121212] border border-[#141414] text-[#D8AB5E] hover:text-amber-300 text-[10px] text-center font-semibold transition-colors"
                    >
                      Quant Lab
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#050505] border border-[#141414] rounded-lg p-6 text-center text-xs text-[#808a9d] font-mono">
              Select an instrument from the table to inspect metrics.
            </div>
          )}
        </div>
      </div>

      {/* 6. Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
          <form
            onSubmit={handleCreateWatchlist}
            className="bg-[#050505] border border-[#141414] rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-[#F0F3F6]"
          >
            <h3 className="text-base font-bold text-white font-sans">Create New Custom Basket</h3>
            <p className="text-xs text-[#808a9d]">
              Enter a descriptive name for your custom watchlist basket.
            </p>

            <input
              type="text"
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g. Swing Breakout Candidates"
              className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2979FF]"
              required
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded border border-[#1a1a1a] text-[#808a9d] hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#2979FF] hover:bg-blue-600 text-white text-xs font-bold transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Rename Watchlist Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
          <form
            onSubmit={handleRenameWatchlist}
            className="bg-[#050505] border border-[#141414] rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-[#F0F3F6]"
          >
            <h3 className="text-base font-bold text-white font-sans">Rename Watchlist</h3>
            <p className="text-xs text-[#808a9d]">
              Update the title of your custom basket.
            </p>

            <input
              type="text"
              autoFocus
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2979FF]"
              required
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="px-3 py-1.5 rounded border border-[#1a1a1a] text-[#808a9d] hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#2979FF] hover:bg-blue-600 text-white text-xs font-bold transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Price & Indicator Alerts Modal */}
      <WatchlistAlertsModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        defaultSymbol={alertSymbol}
        alerts={alerts}
        onRefreshAlerts={async () => {
          try {
            const fresh = await apiClient.getWatchlistAlerts();
            if (Array.isArray(fresh)) setAlerts(fresh);
          } catch {}
        }}
      />

      {/* 9. Comparison Matrix Modal */}
      <WatchlistCompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        symbols={selectedForCompare}
        allTickers={allTickers}
        onRemoveFromCompare={(sym) => handleToggleCompare(sym)}
      />
    </div>
  );
}
