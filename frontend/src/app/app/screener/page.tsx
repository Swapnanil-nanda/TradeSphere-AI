'use client';

import React, { useState, useEffect, useCallback } from 'react';
import EmptyState from '../../../components/app/EmptyState';
import ErrorState from '../../../components/app/ErrorState';
import { TableSkeleton } from '../../../components/app/LoadingSkeleton';
import {
  apiClient,
  ScreenerStock,
  SavedScreen,
  ScreenerPageResponse
} from '../../../lib/api-client';
import {
  Filter, Search, RotateCcw, TrendingUp, TrendingDown, ArrowUpRight,
  BarChart2, BookOpen, Download, Bookmark, BookmarkPlus, Trash2,
  ChevronLeft, ChevronRight, Sliders, ShieldCheck, Check, Clock, Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metadata from backend
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dataSource, setDataSource] = useState('GEOMETRIC_BROWNIAN_MOTION_GBM');
  const [dataProvenance, setDataProvenance] = useState('SIMULATED');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [isStale, setIsStale] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState<'ALL' | 'IN' | 'US'>('ALL');
  const [sector, setSector] = useState<string>('ALL');
  const [trend, setTrend] = useState<string>('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minMarketCapCr, setMinMarketCapCr] = useState<string>('');
  const [maxMarketCapCr, setMaxMarketCapCr] = useState<string>('');
  const [minVolume, setMinVolume] = useState<string>('');
  const [minPe, setMinPe] = useState<string>('');
  const [maxPe, setMaxPe] = useState<string>('');
  const [minRsi, setMinRsi] = useState<string>('');
  const [maxRsi, setMaxRsi] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('changePct');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Saved Screens & Presets
  const [savedScreens, setSavedScreens] = useState<SavedScreen[]>([]);
  const [activePresetId, setActivePresetId] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [savingPreset, setSavingPreset] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const router = useRouter();

  // Load Saved Screens
  const loadSavedScreens = useCallback(async () => {
    if (apiClient.isAuthenticated()) {
      try {
        const screens = await apiClient.getSavedScreens();
        setSavedScreens(screens);
      } catch (e) {
        console.warn('Failed to load saved screens:', e);
      }
    } else {
      setSavedScreens([]);
    }
  }, []);

  // Fetch paginated screener data from authoritative backend
  const fetchScreenerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ScreenerPageResponse = await apiClient.getScreenerPage({
        market,
        sector,
        trend,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        minMarketCapCr: minMarketCapCr ? parseFloat(minMarketCapCr) : undefined,
        maxMarketCapCr: maxMarketCapCr ? parseFloat(maxMarketCapCr) : undefined,
        minVolume: minVolume ? parseInt(minVolume, 10) : undefined,
        minPe: minPe ? parseFloat(minPe) : undefined,
        maxPe: maxPe ? parseFloat(maxPe) : undefined,
        minRsi: minRsi ? parseFloat(minRsi) : undefined,
        maxRsi: maxRsi ? parseFloat(maxRsi) : undefined,
        search,
        sortBy,
        sortDirection,
        page,
        pageSize
      });

      setStocks(response.items || []);
      setTotalResults(response.totalResults || 0);
      setTotalPages(response.totalPages || 1);
      setDataSource(response.dataSource || 'GEOMETRIC_BROWNIAN_MOTION_GBM');
      setDataProvenance(response.dataProvenance || 'SIMULATED');
      setLastUpdated(response.lastUpdated || new Date().toISOString());
      setIsStale(Boolean(response.isStale));
    } catch (err: any) {
      console.error(err);
      setError('Unable to retrieve screener data from server. Verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  }, [
    market, sector, trend, minPrice, maxPrice, minMarketCapCr, maxMarketCapCr,
    minVolume, minPe, maxPe, minRsi, maxRsi, search, sortBy, sortDirection, page, pageSize
  ]);

  useEffect(() => {
    fetchScreenerData();
  }, [fetchScreenerData]);

  useEffect(() => {
    loadSavedScreens();
  }, [loadSavedScreens]);

  const resetFilters = () => {
    setSearch('');
    setMarket('ALL');
    setSector('ALL');
    setTrend('ALL');
    setMinPrice('');
    setMaxPrice('');
    setMinMarketCapCr('');
    setMaxMarketCapCr('');
    setMinVolume('');
    setMinPe('');
    setMaxPe('');
    setMinRsi('');
    setMaxRsi('');
    setSortBy('changePct');
    setSortDirection('DESC');
    setPage(0);
    setActivePresetId(null);
  };

  const handleApplyPreset = (s: SavedScreen) => {
    setActivePresetId(s.id);
    if (s.market) setMarket(s.market as any);
    if (s.sector) setSector(s.sector);
    if (s.trend) setTrend(s.trend);
    if (s.minPe !== undefined && s.minPe !== null) setMinPe(String(s.minPe));
    if (s.maxPe !== undefined && s.maxPe !== null) setMaxPe(String(s.maxPe));
    if (s.minPrice !== undefined && s.minPrice !== null) setMinPrice(String(s.minPrice));
    if (s.maxPrice !== undefined && s.maxPrice !== null) setMaxPrice(String(s.maxPrice));
    if (s.minMarketCapCr !== undefined && s.minMarketCapCr !== null) setMinMarketCapCr(String(s.minMarketCapCr));
    if (s.maxMarketCapCr !== undefined && s.maxMarketCapCr !== null) setMaxMarketCapCr(String(s.maxMarketCapCr));
    if (s.minVolume !== undefined && s.minVolume !== null) setMinVolume(String(s.minVolume));
    if (s.search) setSearch(s.search);
    if (s.sortBy) setSortBy(s.sortBy);
    if (s.sortDirection) setSortDirection(s.sortDirection as any);
    setPage(0);
  };

  const handleSaveScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    if (!apiClient.isAuthenticated()) {
      setShowSaveModal(false);
      window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Save Screener Preset' } }));
      return;
    }

    try {
      setSavingPreset(true);
      const created = await apiClient.createSavedScreen({
        name: newPresetName.trim(),
        market,
        sector,
        trend,
        minPe: minPe ? parseFloat(minPe) : undefined,
        maxPe: maxPe ? parseFloat(maxPe) : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        minMarketCapCr: minMarketCapCr ? parseFloat(minMarketCapCr) : undefined,
        maxMarketCapCr: maxMarketCapCr ? parseFloat(maxMarketCapCr) : undefined,
        minVolume: minVolume ? parseInt(minVolume, 10) : undefined,
        search,
        sortBy,
        sortDirection
      });

      if (created) {
        setSavedScreens(prev => [created, ...prev]);
        setActivePresetId(created.id);
        setNewPresetName('');
        setShowSaveModal(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save screener preset');
    } finally {
      setSavingPreset(false);
    }
  };

  const handleDeleteSavedScreen = async (id: number) => {
    if (!confirm('Are you sure you want to delete this saved screener preset?')) return;
    const ok = await apiClient.deleteSavedScreen(id);
    if (ok) {
      setSavedScreens(prev => prev.filter(s => s.id !== id));
      if (activePresetId === id) setActivePresetId(null);
    }
  };

  const handleExportCsv = () => {
    const url = apiClient.getScreenerExportUrl({
      market,
      sector,
      trend,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minMarketCapCr: minMarketCapCr ? parseFloat(minMarketCapCr) : undefined,
      maxMarketCapCr: maxMarketCapCr ? parseFloat(maxMarketCapCr) : undefined,
      minVolume: minVolume ? parseInt(minVolume, 10) : undefined,
      minPe: minPe ? parseFloat(minPe) : undefined,
      maxPe: maxPe ? parseFloat(maxPe) : undefined,
      minRsi: minRsi ? parseFloat(minRsi) : undefined,
      maxRsi: maxRsi ? parseFloat(maxRsi) : undefined,
      search,
      sortBy,
      sortDirection
    });
    window.open(url, '_blank');
  };

  const sectors = [
    'ALL',
    'Energy & Retail',
    'IT Services',
    'Banking & Financials',
    'Automobile',
    'Technology',
    'Semiconductor',
    'Index ETF'
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12 select-none text-[#F0F3F6]">
      {/* Header & Data Provenance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Stock Screener
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              {dataProvenance} (GBM ENGINE)
            </span>
            {isStale && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                DATA STALE
              </span>
            )}
          </div>
          <p className="text-xs text-[#8B99A8] mt-1 leading-relaxed">
            Multi-criteria server-side screener with 20-EMA trend regimes, valuation multiples, volume bounds, and isolated saved presets.
          </p>
        </div>

        {/* Global Screener Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Saved Presets Button / Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                if (!apiClient.isAuthenticated()) {
                  window.dispatchEvent(new CustomEvent('tradesphere_auth_required', { detail: { action: 'Access Saved Screener Presets' } }));
                } else {
                  setShowSaveModal(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090D12] border border-[#25313D] hover:border-[#2979FF]/50 text-xs font-semibold text-white transition-all shadow-xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-[#2979FF]" />
              <span>Save Screen</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090D12] border border-[#25313D] hover:border-[#35C69A]/50 text-xs font-semibold text-white transition-all shadow-xs"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#35C69A]" />
            <span>Export CSV</span>
          </button>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090D12] border border-[#25313D] hover:border-slate-500 text-xs font-semibold text-[#8B99A8] hover:text-white transition-all"
            title="Reset all filters to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Saved Presets Ribbon (if available) */}
      {savedScreens.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 custom-scrollbar text-xs">
          <span className="text-[11px] font-bold text-[#8B99A8] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-[#2979FF]" />
            <span>Saved Screens:</span>
          </span>
          {savedScreens.map(s => {
            const isSelected = activePresetId === s.id;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#2979FF]/20 border-[#2979FF] text-white font-bold'
                    : 'bg-[#090D12] border-[#25313D] text-[#8B99A8] hover:text-white'
                }`}
              >
                <button
                  onClick={() => handleApplyPreset(s)}
                  className="hover:underline flex items-center gap-1"
                >
                  <span>{s.name}</span>
                </button>
                <button
                  onClick={() => handleDeleteSavedScreen(s.id)}
                  className="text-slate-500 hover:text-rose-400 p-0.5"
                  title="Delete preset"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Control Box */}
      <div className="bg-[#090D12] border border-[#25313D] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Top Search & Market Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search ticker or company name (e.g. RELIANCE, NVDA, TCS)..."
              className="w-full bg-[#000000] border border-[#25313D] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2979FF]"
            />
          </div>

          {/* Market Selector Pill */}
          <div className="flex items-center bg-[#000000] p-1 rounded-xl border border-[#25313D] text-xs shrink-0">
            <button
              onClick={() => { setMarket('ALL'); setPage(0); }}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                market === 'ALL' ? 'bg-[#2979FF] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Markets
            </button>
            <button
              onClick={() => { setMarket('IN'); setPage(0); }}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                market === 'IN' ? 'bg-[#2979FF] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              NSE / BSE 🇮🇳
            </button>
            <button
              onClick={() => { setMarket('US'); setPage(0); }}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                market === 'US' ? 'bg-[#2979FF] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              NASDAQ / NYSE 🇺🇸
            </button>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
              showAdvancedFilters
                ? 'bg-[#2979FF]/15 border-[#2979FF] text-white'
                : 'bg-[#000000] border-[#25313D] text-[#8B99A8] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#2979FF]" />
            <span>{showAdvancedFilters ? 'Hide Advanced' : 'More Filters'}</span>
          </button>
        </div>

        {/* Primary Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Sector */}
          <div>
            <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">Sector</label>
            <select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setPage(0); }}
              className="w-full bg-[#000000] border border-[#25313D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2979FF]"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 20-EMA Trend Regime */}
          <div>
            <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">20-EMA Trend</label>
            <select
              value={trend}
              onChange={(e) => { setTrend(e.target.value); setPage(0); }}
              className="w-full bg-[#000000] border border-[#25313D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2979FF]"
            >
              <option value="ALL">All Regimes</option>
              <option value="BULLISH">Bullish (Above 20-EMA)</option>
              <option value="BEARISH">Bearish (Below 20-EMA)</option>
              <option value="CONSOLIDATION">Consolidation</option>
            </select>
          </div>

          {/* Sort Column */}
          <div>
            <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              className="w-full bg-[#000000] border border-[#25313D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2979FF]"
            >
              <option value="changePct">% Daily Change</option>
              <option value="price">Current Price</option>
              <option value="rsi14">RSI(14) Momentum</option>
              <option value="peRatio">P/E Multiple</option>
              <option value="marketCapCr">Market Capitalisation</option>
              <option value="volume">Trading Volume</option>
              <option value="symbol">Ticker (A-Z)</option>
            </select>
          </div>

          {/* Sort Direction */}
          <div>
            <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">Order</label>
            <select
              value={sortDirection}
              onChange={(e) => { setSortDirection(e.target.value as any); setPage(0); }}
              className="w-full bg-[#000000] border border-[#25313D] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#2979FF]"
            >
              <option value="DESC">Descending (High to Low)</option>
              <option value="ASC">Ascending (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Expandable Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-[#25313D]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
            {/* Price Range */}
            <div>
              <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">Price Range</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(0); }}
                  className="w-1/2 bg-[#000000] border border-[#25313D] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2979FF]"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(0); }}
                  className="w-1/2 bg-[#000000] border border-[#25313D] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2979FF]"
                />
              </div>
            </div>

            {/* P/E Ratio Range */}
            <div>
              <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">Max P/E Multiple</label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={maxPe}
                onChange={(e) => { setMaxPe(e.target.value); setPage(0); }}
                className="w-full bg-[#000000] border border-[#25313D] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2979FF]"
              />
            </div>

            {/* RSI(14) Range */}
            <div>
              <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">RSI(14) Bounds</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min RSI"
                  value={minRsi}
                  onChange={(e) => { setMinRsi(e.target.value); setPage(0); }}
                  className="w-1/2 bg-[#000000] border border-[#25313D] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2979FF]"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  placeholder="Max RSI"
                  value={maxRsi}
                  onChange={(e) => { setMaxRsi(e.target.value); setPage(0); }}
                  className="w-1/2 bg-[#000000] border border-[#25313D] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2979FF]"
                />
              </div>
            </div>

            {/* Minimum Volume */}
            <div>
              <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">Min Volume</label>
              <input
                type="number"
                placeholder="e.g. 100000"
                value={minVolume}
                onChange={(e) => { setMinVolume(e.target.value); setPage(0); }}
                className="w-full bg-[#000000] border border-[#25313D] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#2979FF]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header Status Bar */}
      <div className="flex items-center justify-between text-xs text-[#8B99A8] px-1 font-mono">
        <div>
          Showing <span className="text-white font-bold">{stocks.length}</span> of{' '}
          <span className="text-[#2979FF] font-bold">{totalResults}</span> matching instruments in universe
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Last computed: {new Date(lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Screener Results Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchScreenerData} />
      ) : stocks.length === 0 ? (
        <EmptyState
          title="No stocks match these screener criteria"
          description="Try relaxing your price, RSI, P/E multiple or sector filters to see more instruments."
          action={{
            label: 'Reset All Filters',
            onClick: resetFilters
          }}
        />
      ) : (
        <div className="bg-[#090D12] border border-[#25313D] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#000000] border-b border-[#25313D] text-[11px] text-[#8B99A8] uppercase font-sans">
                <tr>
                  <th className="py-3 px-4">Symbol &amp; Name</th>
                  <th className="py-3 px-4">Market</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Change %</th>
                  <th className="py-3 px-4">P/E Ratio</th>
                  <th className="py-3 px-4">RSI(14)</th>
                  <th className="py-3 px-4">Market Cap</th>
                  <th className="py-3 px-4">Technical Setup</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25313D]/40">
                {stocks.map(s => {
                  const isUp = s.changePct >= 0;
                  const currency = s.currency === 'USD' || s.market === 'US' ? '$' : '₹';

                  return (
                    <tr key={s.symbol} className="hover:bg-[#151F29]/60 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                          <span>{s.symbol}</span>
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {s.exchange || (s.market === 'IN' ? 'NSE' : 'NASDAQ')}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8B99A8] truncate max-w-[160px]">{s.name}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.market === 'IN'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
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
                        <span className={isUp ? 'text-[#35C69A]' : 'text-[#EF6468]'}>
                          {isUp ? '+' : ''}{s.changePct.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {s.peRatio !== null && s.peRatio !== undefined ? (
                          `${s.peRatio.toFixed(1)}x`
                        ) : (
                          <span className="text-slate-500 font-semibold" title="Not Applicable for Index ETFs or non-equity instruments">
                            N/A
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          s.rsi14 >= 60 ? 'bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30' :
                          s.rsi14 <= 45 ? 'bg-[#EF6468]/15 text-[#EF6468] border border-[#EF6468]/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {s.rsi14.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        {s.marketCapCr ? (
                          s.market === 'IN' ? `₹${(s.marketCapCr / 1000).toFixed(0)}k Cr` : `$${(s.marketCapCr / 10000).toFixed(0)}B`
                        ) : 'N/A'}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <div className="text-[11px] font-semibold text-slate-200">{s.setup}</div>
                        <span className={`text-[9px] font-bold uppercase ${
                          s.trend === 'BULLISH' ? 'text-[#35C69A]' :
                          s.trend === 'BEARISH' ? 'text-[#EF6468]' : 'text-slate-400'
                        }`}>
                          ● {s.trend}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          <button
                            onClick={() => router.push(`/app/charts?symbol=${s.symbol}`)}
                            className="p-1.5 rounded-lg bg-[#000000] border border-[#25313D] hover:border-[#2979FF] text-slate-300 hover:text-white transition-colors"
                            title="Open Technical Chart"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => router.push(`/app/research/fundamental?symbol=${s.symbol}`)}
                            className="p-1.5 rounded-lg bg-[#000000] border border-[#25313D] hover:border-[#2979FF] text-slate-300 hover:text-white transition-colors"
                            title="Fundamental Research & Stats"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => router.push(`/app/paper-trading?symbol=${s.symbol}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-[10px] transition-colors shadow-xs"
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

          {/* Pagination Controls */}
          <div className="bg-[#000000] border-t border-[#25313D] px-4 py-3 flex items-center justify-between text-xs">
            <div className="text-[#8B99A8]">
              Page <span className="text-white font-bold">{page + 1}</span> of{' '}
              <span className="text-white font-bold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 0}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#090D12] border border-[#25313D] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#090D12] border border-[#25313D] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Screener Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <div className="bg-[#090D12] border border-[#25313D] w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-[#2979FF]" />
                <span>Save Screener Preset</span>
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#8B99A8] leading-relaxed">
              Persist your active filters (Market: {market}, Sector: {sector}, Trend: {trend}) to your private account profile.
            </p>

            <form onSubmit={handleSaveScreen} className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#8B99A8] font-semibold mb-1">Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nifty Bullish Continuation"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full bg-[#000000] border border-[#25313D] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 rounded-xl bg-transparent border border-[#25313D] text-[#8B99A8] hover:text-white font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPreset}
                  className="flex-1 py-2 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs"
                >
                  {savingPreset ? 'Saving...' : 'Save Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
