'use client';

import React, { useState, useEffect } from 'react';
import PortfolioSummaryCard from '../../../components/app/PortfolioSummaryCard';
import PerformanceChart, { EquityHistoryPoint } from '../../../components/app/PerformanceChart';
import ErrorState from '../../../components/app/ErrorState';
import EmptyState from '../../../components/app/EmptyState';
import { CardSkeleton, TableSkeleton } from '../../../components/app/LoadingSkeleton';
import {
  apiClient,
  PortfolioData,
  Position,
  Trade,
  USD_TO_INR_RATE,
  getInstrumentCurrency,
  formatMoney
} from '../../../lib/api-client';
import { paperEngine } from '../../../lib/paper-engine';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Wallet,
  BookOpen,
  RotateCcw,
  ShieldCheck,
  ArrowUpRight,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  Globe,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [equityHistory, setEquityHistory] = useState<EquityHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closingSymbol, setClosingSymbol] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'holdings' | 'positions' | 'journal'>('holdings');
  const [hasSampleHoldings, setHasSampleHoldings] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState<'1W' | '1M' | '3M' | '1Y'>('1M');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPortfolio();
      setPortfolio(data);

      // Load timestamped equity history
      const history = await apiClient.getEquityHistory(historyPeriod);
      if (history && Array.isArray(history.points)) {
        setEquityHistory(history.points);
      }

      // Check if sample holdings are active
      const hasSamples = data.positions.some(p => ['RELIANCE', 'TCS', 'HDFCBANK'].includes(p.symbol) && p.productType === 'CNC');
      setHasSampleHoldings(hasSamples);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch portfolio and trade journal records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [historyPeriod]);

  const handleClosePosition = async (sym: string) => {
    if (confirm(`Market close open position for ${sym}?`)) {
      setClosingSymbol(sym);
      try {
        await apiClient.closePosition(sym);
        await loadData();
      } catch (e: any) {
        alert(e.message || 'Failed to close position.');
      } finally {
        setClosingSymbol(null);
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Reset portfolio back to initial ₹10,00,000 equity? All positions and open orders will be cleared.')) {
      await apiClient.resetAccount();
      await loadData();
    }
  };

  const handleToggleSampleHoldings = () => {
    if (hasSampleHoldings) {
      paperEngine.clearSampleHoldings();
    } else {
      paperEngine.loadSampleHoldings();
    }
    loadData();
  };

  const account = portfolio?.account;
  const allPositions = portfolio?.positions || [];
  const trades = portfolio?.trades || [];

  // Filter positions into Zerodha Kite Holdings (CNC) and Positions (MIS)
  const holdingsCnc = allPositions.filter(p => (p.productType || 'CNC') === 'CNC');
  const positionsMis = allPositions.filter(p => p.productType === 'MIS');

  // Trade Journal: Strictly use real recorded trades without fabricated sample data
  const journalTrades: Trade[] = trades;
  const closedTrades = journalTrades.filter(t => t.realizedPnL !== undefined);
  const winningTrades = closedTrades.filter(t => (t.realizedPnL || 0) > 0);
  const losingTrades = closedTrades.filter(t => (t.realizedPnL || 0) < 0);
  const winRate = closedTrades.length > 0 ? Math.round((winningTrades.length / closedTrades.length) * 100) : null;

  // Real Multi-Currency Realized PnL Calculation in INR
  const totalRealizedPnLInr = closedTrades.reduce((acc, t) => {
    const isUs = t.currency === 'USD' || getInstrumentCurrency(t.symbol) === 'USD';
    const fx = isUs ? USD_TO_INR_RATE : 1.0;
    return acc + (t.realizedPnLInr ?? ((t.realizedPnL ?? 0) * fx));
  }, 0);

  // Dynamic Profit Factor calculation
  const grossProfitInr = closedTrades
    .filter(t => (t.realizedPnL ?? 0) > 0)
    .reduce((sum, t) => {
      const isUs = t.currency === 'USD' || getInstrumentCurrency(t.symbol) === 'USD';
      return sum + (t.realizedPnLInr ?? ((t.realizedPnL ?? 0) * (isUs ? USD_TO_INR_RATE : 1.0)));
    }, 0);

  const grossLossInr = Math.abs(
    closedTrades
      .filter(t => (t.realizedPnL ?? 0) < 0)
      .reduce((sum, t) => {
        const isUs = t.currency === 'USD' || getInstrumentCurrency(t.symbol) === 'USD';
        return sum + (t.realizedPnLInr ?? ((t.realizedPnL ?? 0) * (isUs ? USD_TO_INR_RATE : 1.0)));
      }, 0)
  );

  const profitFactor = grossLossInr > 0
    ? (grossProfitInr / grossLossInr).toFixed(2)
    : grossProfitInr > 0
      ? '∞ (0 Losses)'
      : 'N/A';

  // Dynamic Average R-Multiple calculation
  const validR = closedTrades
    .map(t => t.rMultiple)
    .filter((r): r is number => typeof r === 'number' && Number.isFinite(r));

  const averageR = validR.length > 0
    ? `${(validR.reduce((sum, r) => sum + r, 0) / validR.length).toFixed(2)}R`
    : 'N/A';

  // Capital & Sector Allocation Calculation
  const initialEquity = account?.initialEquity || 1000000;
  const currentNetLiquidation = account?.netLiquidation || initialEquity;
  const availableCash = account?.currentCash || initialEquity;

  const indianEquityValue = allPositions
    .filter(p => getInstrumentCurrency(p.symbol) === 'INR')
    .reduce((acc, p) => acc + (p.marketValueInr || p.marketValue), 0);

  const usEquityValue = allPositions
    .filter(p => getInstrumentCurrency(p.symbol) === 'USD')
    .reduce((acc, p) => acc + (p.marketValueInr || (p.marketValue * USD_TO_INR_RATE)), 0);

  const cashPct = Math.max(0, Math.min(100, (availableCash / currentNetLiquidation) * 100));
  const indianPct = Math.max(0, Math.min(100, (indianEquityValue / currentNetLiquidation) * 100));
  const usPct = Math.max(0, Math.min(100, (usEquityValue / currentNetLiquidation) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 text-[#F0F3F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Portfolio &amp; Trade Journal
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              RECONCILED MULTI-CURRENCY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit equity growth, Zerodha Kite delivery holdings vs intraday positions, and multi-currency trade history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Load Sample Demo Holdings Toggle */}
          <button
            onClick={handleToggleSampleHoldings}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold font-mono transition-all ${
              hasSampleHoldings
                ? 'bg-[#35C69A]/15 border-[#35C69A]/40 text-[#35C69A]'
                : 'bg-[#0c121f] border-[#1b253b] hover:border-blue-500/40 text-slate-300'
            }`}
            title="Toggle realistic Zerodha Kite sample equity holdings (RELIANCE, TCS, HDFCBANK)"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#35C69A]" />
            <span>{hasSampleHoldings ? 'Clear Sample Holdings' : 'Load Sample Holdings (Demo)'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Ledger (₹10L)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <TableSkeleton rows={5} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="space-y-6">
          {/* Main Portfolio Summary Card with Invariant Reconciled Cash and Equity */}
          {account && (
            <PortfolioSummaryCard
              account={account}
              onReset={loadData}
            />
          )}

          {/* Equity Curve & Performance Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Equity Curve Chart (2 cols) */}
            <div className="lg:col-span-2 bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1b253b] mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                    Cumulative Equity Growth vs NIFTY 50 Benchmark
                  </span>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-1 bg-[#070b14] p-0.5 rounded-lg border border-[#1b253b] text-[10px] font-mono">
                  {(['1W', '1M', '3M', '1Y'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setHistoryPeriod(p)}
                      className={`px-2 py-0.5 rounded transition-all ${
                        historyPeriod === p
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-60">
                <PerformanceChart
                  equityCurve={equityHistory}
                  initialEquity={initialEquity}
                  benchmarkName="NIFTY 50"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-[#1b253b] mt-3 font-mono">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 rounded bg-[#10b981]" />
                    <span>Portfolio Equity (INR)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 rounded bg-[#3b82f6] border border-dashed border-[#3b82f6]" />
                    <span>NIFTY 50 Benchmark</span>
                  </div>
                </div>
                <div>
                  FX Rate: <strong className="text-white">1 USD = ₹84.00 INR</strong>
                </div>
              </div>
            </div>

            {/* Trading Edge Analytics Card (1 col) */}
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1b253b] mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                      Trading Edge Analytics
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    PRO QUANT
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Win Rate</span>
                    <span className={`font-bold text-sm ${winRate !== null && winRate >= 50 ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {winRate !== null ? `${winRate}%` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Profit Factor</span>
                    <span className={`font-bold text-sm ${profitFactor !== 'N/A' && parseFloat(profitFactor) >= 1.5 ? 'text-emerald-400' : 'text-white'}`}>
                      {profitFactor}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Average R-Multiple</span>
                    <span className={`font-bold text-sm ${averageR !== 'N/A' && parseFloat(averageR) > 0 ? 'text-blue-400' : 'text-slate-300'}`}>
                      {averageR}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Master Realized PnL (INR)</span>
                    <span className={`font-bold text-sm ${totalRealizedPnLInr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalRealizedPnLInr >= 0 ? '+' : ''}₹{totalRealizedPnLInr.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capital & Sector Allocation Card */}
              <div className="pt-4 border-t border-[#1b253b] mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white uppercase text-[11px] font-sans flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-[#35C69A]" />
                    <span>Capital &amp; Sector Allocation</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">₹{currentNetLiquidation.toLocaleString()}</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-[#070b14] rounded-full overflow-hidden flex border border-[#1b253b]">
                  <div style={{ width: `${cashPct}%` }} className="bg-[#2979FF] h-full" title={`Available Cash: ${cashPct.toFixed(1)}%`} />
                  <div style={{ width: `${indianPct}%` }} className="bg-[#35C69A] h-full" title={`Indian NSE Equity: ${indianPct.toFixed(1)}%`} />
                  <div style={{ width: `${usPct}%` }} className="bg-[#D8AB5E] h-full" title={`US Tech Equity: ${usPct.toFixed(1)}%`} />
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1 text-slate-300">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#2979FF]" />
                    <span>Cash {cashPct.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#35C69A]" />
                    <span>NSE {indianPct.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D8AB5E]" />
                    <span>US {usPct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zerodha Kite Style Tab Switcher: Holdings (CNC) vs Open Positions (MIS) vs Trade Journal */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#090d16] border-b border-[#1b253b] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('holdings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all font-sans ${
                    activeTab === 'holdings'
                      ? 'bg-[#2979FF] text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Holdings (CNC)</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                    {holdingsCnc.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('positions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all font-sans ${
                    activeTab === 'positions'
                      ? 'bg-[#2979FF] text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Positions (MIS)</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                    {positionsMis.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('journal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all font-sans ${
                    activeTab === 'journal'
                      ? 'bg-[#2979FF] text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Trade Journal</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                    {closedTrades.length}
                  </span>
                </button>
              </div>

              <Link
                href="/app/paper-trading"
                className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Terminal Order Console</span> &rarr;
              </Link>
            </div>

            <div className="p-4">
              {/* TAB 1: ZERODHA KITE HOLDINGS (CNC) */}
              {activeTab === 'holdings' && (
                <div>
                  {holdingsCnc.length === 0 ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#070b14] border border-[#1b253b] flex items-center justify-center mx-auto text-slate-500">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">No Equity Delivery Holdings (CNC)</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          You do not currently hold any delivery equity positions in your portfolio. Place a CNC order or preview realistic sample holdings.
                        </p>
                      </div>
                      <button
                        onClick={handleToggleSampleHoldings}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 font-mono"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Load Sample Delivery Holdings (Demo)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                          <tr>
                            <th className="pb-2.5">Instrument</th>
                            <th className="pb-2.5">Product</th>
                            <th className="pb-2.5">Qty</th>
                            <th className="pb-2.5">Avg. Cost</th>
                            <th className="pb-2.5">LTP</th>
                            <th className="pb-2.5">Current Value</th>
                            <th className="pb-2.5">Unrealized P&amp;L</th>
                            <th className="pb-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253b]/40">
                          {holdingsCnc.map((pos) => {
                            const isUs = pos.currency === 'USD' || getInstrumentCurrency(pos.symbol) === 'USD';
                            const currency = isUs ? 'USD' : 'INR';
                            const isUp = (pos.unrealizedPnL || 0) >= 0;
                            const avg = pos.avgPrice ?? (pos as any).entryPrice ?? 0;
                            const ltp = pos.currentPrice ?? avg;
                            const val = pos.marketValue || ltp * pos.quantity;
                            const pnl = pos.unrealizedPnL || 0;
                            const pnlPct = pos.unrealizedPnLPct || 0;

                            return (
                              <tr key={pos.symbol} className="hover:bg-slate-800/30">
                                <td className="py-3 font-sans">
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{pos.symbol}</span>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                      {isUs ? 'NASDAQ' : 'NSE'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                                    CNC
                                  </span>
                                </td>
                                <td className="py-3 font-bold text-slate-200">{pos.quantity}</td>
                                <td className="py-3 text-slate-300">
                                  {formatMoney(avg, currency)}
                                </td>
                                <td className="py-3 text-white font-bold">
                                  {formatMoney(ltp, currency)}
                                </td>
                                <td className="py-3 text-slate-200 font-bold">
                                  <div>{formatMoney(val, currency)}</div>
                                  {isUs && (
                                    <div className="text-[10px] text-slate-400 font-sans">
                                      ≈ ₹{(val * USD_TO_INR_RATE).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 font-bold">
                                  <div className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                                    {isUp ? '+' : ''}{formatMoney(pnl, currency)} ({isUp ? '+' : ''}{pnlPct.toFixed(2)}%)
                                  </div>
                                  {isUs && (
                                    <div className="text-[10px] text-slate-400 font-sans">
                                      ≈ {isUp ? '+' : ''}₹{(pnl * USD_TO_INR_RATE).toFixed(2)}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => handleClosePosition(pos.symbol)}
                                    disabled={closingSymbol === pos.symbol}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold transition-all disabled:opacity-50"
                                  >
                                    {closingSymbol === pos.symbol ? 'Closing...' : 'Exit Holding'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ZERODHA KITE POSITIONS (MIS) */}
              {activeTab === 'positions' && (
                <div>
                  {positionsMis.length === 0 ? (
                    <EmptyState
                      title="No Open Intraday Positions (MIS)"
                      description="You have zero active intraday or derivative positions. Enter an intraday trade from the terminal."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                          <tr>
                            <th className="pb-2.5">Instrument</th>
                            <th className="pb-2.5">Product</th>
                            <th className="pb-2.5">Side</th>
                            <th className="pb-2.5">Qty</th>
                            <th className="pb-2.5">Avg Price</th>
                            <th className="pb-2.5">LTP</th>
                            <th className="pb-2.5">Unrealized MTM</th>
                            <th className="pb-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253b]/40">
                          {positionsMis.map((pos) => {
                            const isUs = pos.currency === 'USD' || getInstrumentCurrency(pos.symbol) === 'USD';
                            const currency = isUs ? 'USD' : 'INR';
                            const isUp = (pos.unrealizedPnL || 0) >= 0;

                            return (
                              <tr key={pos.symbol} className="hover:bg-slate-800/30">
                                <td className="py-3 font-sans font-bold text-white">{pos.symbol}</td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                                    MIS
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    pos.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                    {pos.side}
                                  </span>
                                </td>
                                <td className="py-3 font-bold text-slate-200">{pos.quantity}</td>
                                <td className="py-3 text-slate-300">{formatMoney(pos.avgPrice, currency)}</td>
                                <td className="py-3 text-white font-bold">{formatMoney(pos.currentPrice, currency)}</td>
                                <td className="py-3 font-bold">
                                  <div className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                                    {isUp ? '+' : ''}{formatMoney(pos.unrealizedPnL, currency)} ({isUp ? '+' : ''}{pos.unrealizedPnLPct.toFixed(2)}%)
                                  </div>
                                  {isUs && (
                                    <div className="text-[10px] text-slate-400 font-sans">
                                      ≈ {isUp ? '+' : ''}₹{(pos.unrealizedPnL * USD_TO_INR_RATE).toFixed(2)}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => handleClosePosition(pos.symbol)}
                                    disabled={closingSymbol === pos.symbol}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold transition-all disabled:opacity-50"
                                  >
                                    {closingSymbol === pos.symbol ? 'Closing...' : 'Close MIS'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TRADE JOURNAL & EXPECTANCY AUDIT */}
              {activeTab === 'journal' && (
                <div>
                  {closedTrades.length === 0 ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#070b14] border border-[#1b253b] flex items-center justify-center mx-auto text-slate-500">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">No Completed Trades Yet</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          Place your first paper trade to start tracking performance, R-multiples, and win rates without fabricated entries.
                        </p>
                      </div>
                      <Link
                        href="/app/paper-trading"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
                      >
                        <span>Go to Paper Terminal</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                          <tr>
                            <th className="pb-2.5">Date</th>
                            <th className="pb-2.5">Symbol</th>
                            <th className="pb-2.5">Side</th>
                            <th className="pb-2.5">Qty</th>
                            <th className="pb-2.5">Entry Price</th>
                            <th className="pb-2.5">Exit Price</th>
                            <th className="pb-2.5">Realized P&amp;L (Native &amp; INR)</th>
                            <th className="pb-2.5">R-Multiple</th>
                            <th className="pb-2.5">Exit Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253b]/40">
                          {closedTrades.map((tr) => {
                            const isUs = tr.currency === 'USD' || getInstrumentCurrency(tr.symbol) === 'USD';
                            const currency = isUs ? 'USD' : 'INR';
                            const isWin = (tr.realizedPnL || 0) >= 0;
                            const realizedInr = tr.realizedPnLInr ?? ((tr.realizedPnL ?? 0) * (isUs ? USD_TO_INR_RATE : 1.0));

                            return (
                              <tr key={tr.id} className="hover:bg-slate-800/30">
                                <td className="py-2.5 text-slate-500 text-[11px]">
                                  {new Date(tr.timestamp).toLocaleDateString()}
                                </td>
                                <td className="py-2.5 font-sans font-bold text-white flex items-center gap-1">
                                  <span>{tr.symbol}</span>
                                  {isUs && <span className="text-[9px] text-[#D8AB5E] font-mono">($)</span>}
                                </td>
                                <td className="py-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    tr.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                    {tr.side}
                                  </span>
                                </td>
                                <td className="py-2.5 text-slate-300">{tr.quantity}</td>
                                <td className="py-2.5 text-slate-300">
                                  {formatMoney(tr.entryPrice ?? (tr as any).price ?? 0, currency)}
                                </td>
                                <td className="py-2.5 text-white font-bold">
                                  {tr.exitPrice ? formatMoney(tr.exitPrice, currency) : '—'}
                                </td>
                                <td className="py-2.5 font-bold">
                                  {tr.realizedPnL !== undefined ? (
                                    <div>
                                      <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>
                                        {isWin ? '+' : ''}{formatMoney(tr.realizedPnL, currency)}
                                      </span>
                                      {isUs && (
                                        <div className="text-[10px] text-slate-400 font-sans">
                                          ≈ {isWin ? '+' : ''}₹{realizedInr.toFixed(2)} (@ ₹84/$)
                                        </div>
                                      )}
                                    </div>
                                  ) : '—'}
                                </td>
                                <td className="py-2.5 font-bold">
                                  {tr.rMultiple !== undefined ? (
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                      tr.rMultiple >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                      {tr.rMultiple >= 0 ? '+' : ''}{tr.rMultiple.toFixed(1)}R
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className="py-2.5 text-slate-400 font-sans text-[11px]">
                                  {tr.exitReason || 'MANUAL_EXIT'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
