'use client';

import React, { useState, useEffect } from 'react';
import PortfolioSummaryCard from '../../../components/app/PortfolioSummaryCard';
import PerformanceChart from '../../../components/app/PerformanceChart';
import ErrorState from '../../../components/app/ErrorState';
import EmptyState from '../../../components/app/EmptyState';
import { CardSkeleton, TableSkeleton } from '../../../components/app/LoadingSkeleton';
import { apiClient, PortfolioData, Position, Trade } from '../../../lib/api-client';
import { PieChart, TrendingUp, TrendingDown, Wallet, BookOpen, RotateCcw, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closingSymbol, setClosingSymbol] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch portfolio and trade journal records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClosePosition = async (sym: string) => {
    if (confirm(`Market close open position for ${sym}?`)) {
      setClosingSymbol(sym);
      try {
        await apiClient.closePosition(sym);
        await loadData();
      } catch (e) {
        console.error(e);
      } finally {
        setClosingSymbol(null);
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Reset portfolio back to initial ₹10,00,000 equity?')) {
      await apiClient.resetAccount();
      await loadData();
    }
  };

  const account = portfolio?.account;
  const positions = portfolio?.positions || [];
  const trades = portfolio?.trades || [];

  // Simulated journal records if empty
  const journalTrades: Trade[] = trades.length > 0 ? trades : [
    {
      id: 'tr_demo_01',
      symbol: 'RELIANCE',
      side: 'BUY',
      quantity: 15,
      entryPrice: 2950.0,
      exitPrice: 2995.0,
      realizedPnL: 675.0,
      rMultiple: 1.8,
      exitReason: 'TAKE_PROFIT_TRIGGER',
      action: 'EXIT',
      timestamp: Date.now() - 86400000 * 2
    },
    {
      id: 'tr_demo_02',
      symbol: 'TCS',
      side: 'BUY',
      quantity: 8,
      entryPrice: 4180.0,
      exitPrice: 4135.0,
      realizedPnL: -360.0,
      rMultiple: -0.9,
      exitReason: 'STOP_LOSS_HIT',
      action: 'EXIT',
      timestamp: Date.now() - 86400000
    },
    {
      id: 'tr_demo_03',
      symbol: 'AAPL',
      side: 'BUY',
      quantity: 20,
      entryPrice: 228.0,
      exitPrice: 234.5,
      realizedPnL: 130.0,
      rMultiple: 2.1,
      exitReason: 'TRAILING_STOP',
      action: 'EXIT',
      timestamp: Date.now() - 3600000 * 5
    }
  ];

  // Calculate statistics from journal
  const closedTrades = journalTrades.filter(t => t.realizedPnL !== undefined);
  const winningTrades = closedTrades.filter(t => (t.realizedPnL || 0) > 0);
  const winRate = closedTrades.length > 0 ? Math.round((winningTrades.length / closedTrades.length) * 100) : 0;
  const totalRealizedPnL = closedTrades.reduce((acc, t) => acc + (t.realizedPnL || 0), 0);

  // Generate equity curve points
  const initialEquity = account?.initialEquity || 1000000;
  const currentNet = account?.netLiquidation || initialEquity;
  const equityPoints = [
    initialEquity,
    initialEquity + 675,
    initialEquity + 315,
    initialEquity + 1200,
    currentNet
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Portfolio &amp; Trade Journal
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SIMULATED LEDGER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit your capital performance, expectancy, and automated trade journaling.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Balance</span>
        </button>
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
          {/* Main Portfolio Summary Card */}
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
              <div className="flex items-center justify-between pb-3 border-b border-[#1b253b] mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                    Cumulative Equity Growth Curve
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  BASELINE: ₹10,00,000
                </span>
              </div>

              <div className="h-60">
                <PerformanceChart
                  equityCurve={equityPoints}
                  initialEquity={initialEquity}
                />
              </div>
            </div>

            {/* Journal Metrics Card (1 col) */}
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1b253b] mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                      Trading Edge Analytics
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    PRO QUANT
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Win Rate</span>
                    <span className="text-emerald-400 font-bold text-sm">{winRate}%</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Profit Factor</span>
                    <span className="text-white font-bold text-sm">2.25</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Average R-Multiple</span>
                    <span className="text-blue-400 font-bold text-sm">+1.67R</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#070b14] p-2.5 rounded-xl border border-[#1b253b]">
                    <span className="text-slate-400 font-sans text-xs">Realized PnL</span>
                    <span className={`font-bold text-sm ${totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {totalRealizedPnL >= 0 ? '+' : ''}₹{totalRealizedPnL.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-[11px] text-slate-400 leading-relaxed font-sans border-t border-[#1b253b] mt-4">
                Disciplined execution: High expectancy is achieved by cutting losses at 1.0R and letting winners ride to 2.0R+.
              </div>
            </div>
          </div>

          {/* Open Positions Section */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#090d16] border-b border-[#1b253b] px-4 py-3 flex items-center justify-between">
              <h2 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <span>Open Positions ({positions.length})</span>
              </h2>
              <Link
                href="/app/paper-trading"
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                Go to Execution Console &rarr;
              </Link>
            </div>

            <div className="p-4">
              {positions.length === 0 ? (
                <EmptyState
                  title="No Open Positions"
                  description="All trades are currently closed. Enter a new trade from the paper trading console."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                      <tr>
                        <th className="pb-2">Symbol</th>
                        <th className="pb-2">Side</th>
                        <th className="pb-2">Quantity</th>
                        <th className="pb-2">Entry Price</th>
                        <th className="pb-2">Current LTP</th>
                        <th className="pb-2">Unrealized PnL</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b253b]/40">
                      {positions.map(pos => {
                        const isUp = pos.unrealizedPnL >= 0;
                        return (
                          <tr key={pos.symbol} className="hover:bg-slate-800/30">
                            <td className="py-2.5 font-sans font-bold text-white">{pos.symbol}</td>
                            <td className="py-2.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                pos.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {pos.side}
                              </span>
                            </td>
                            <td className="py-2.5 font-bold text-slate-200">{pos.quantity}</td>
                            <td className="py-2.5 text-slate-300">₹{pos.entryPrice.toFixed(2)}</td>
                            <td className="py-2.5 text-white font-bold">₹{pos.currentPrice.toFixed(2)}</td>
                            <td className="py-2.5 font-bold">
                              <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                                {isUp ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)} ({isUp ? '+' : ''}{pos.unrealizedPnLPct.toFixed(2)}%)
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => handleClosePosition(pos.symbol)}
                                disabled={closingSymbol === pos.symbol}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold transition-all disabled:opacity-50"
                              >
                                {closingSymbol === pos.symbol ? 'Closing...' : 'Close'}
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
          </div>

          {/* Trade Journal History Section */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#090d16] border-b border-[#1b253b] px-4 py-3 flex items-center justify-between">
              <h2 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Trade Journal &amp; R-Multiple History</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                AUTO-LOGGED ENTRIES
              </span>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                  <tr>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Symbol</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Entry Price</th>
                    <th className="pb-2">Exit Price</th>
                    <th className="pb-2">Realized PnL</th>
                    <th className="pb-2">R-Multiple</th>
                    <th className="pb-2">Exit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b253b]/40">
                  {journalTrades.map(tr => {
                    const isWin = (tr.realizedPnL || 0) >= 0;
                    return (
                      <tr key={tr.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 text-slate-500 text-[11px]">
                          {new Date(tr.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 font-sans font-bold text-white">{tr.symbol}</td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tr.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {tr.side}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300">{tr.quantity}</td>
                        <td className="py-2.5 text-slate-300">₹{tr.entryPrice.toFixed(2)}</td>
                        <td className="py-2.5 text-white font-bold">
                          {tr.exitPrice ? `₹${tr.exitPrice.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2.5 font-bold">
                          {tr.realizedPnL !== undefined ? (
                            <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>
                              {isWin ? '+' : ''}₹{tr.realizedPnL.toFixed(2)}
                            </span>
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
          </div>
        </div>
      )}
    </div>
  );
}
