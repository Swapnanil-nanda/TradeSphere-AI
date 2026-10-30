'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderForm from '../../../components/app/OrderForm';
import PortfolioSummaryCard from '../../../components/app/PortfolioSummaryCard';
import PriceChart from '../../../components/app/PriceChart';
import ErrorState from '../../../components/app/ErrorState';
import EmptyState from '../../../components/app/EmptyState';
import { CardSkeleton, TableSkeleton } from '../../../components/app/LoadingSkeleton';
import {
  apiClient,
  Ticker,
  Candle,
  PortfolioData,
  Position,
  Order,
  Trade,
  CashLedgerEntry,
  ReconciliationReport
} from '../../../lib/api-client';
import {
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  X,
  Settings2,
  CheckCircle2,
  FileText,
  Ban,
  Scale,
  ShieldAlert,
  Coins
} from 'lucide-react';

function PaperTradingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [timeframe, setTimeframe] = useState('5m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'trades' | 'ledger' | 'dom'>('positions');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Configuration modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configCapital, setConfigCapital] = useState('1000000');
  const [configSlippage, setConfigSlippage] = useState('0.05');
  const [configFee, setConfigFee] = useState('0.03');

  // Reconciliation state
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileReport, setReconcileReport] = useState<ReconciliationReport | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<CashLedgerEntry[]>([]);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams, symbol]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allTickers, portData, candleData] = await Promise.all([
        apiClient.getTickers(),
        apiClient.getPortfolio(),
        apiClient.getCandles(symbol, timeframe)
      ]);
      setTickers(allTickers);
      setPortfolio(portData);
      setCandles(candleData);
    } catch (err: any) {
      console.error(err);
      setError('Failed to connect to the paper trading execution engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [symbol, timeframe]);

  // Periodic portfolio & ledger sync
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const port = await apiClient.getPortfolio();
        setPortfolio(port);
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = async (sym: string) => {
    if (confirm(`Market close open position for ${sym}?`)) {
      setActionLoading(sym);
      try {
        await apiClient.closePosition(sym);
        const port = await apiClient.getPortfolio();
        setPortfolio(port);
      } catch (e) {
        console.error(e);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm(`Cancel pending order #${orderId}? Cancelled orders will never be filled.`)) {
      setActionLoading(orderId);
      try {
        await apiClient.cancelOrder(orderId);
        const port = await apiClient.getPortfolio();
        setPortfolio(port);
      } catch (e: any) {
        alert(e.message || 'Failed to cancel order');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleResetLedger = async () => {
    if (confirm('Reset virtual paper balance back to initial equity? All open positions will be closed.')) {
      try {
        await apiClient.resetAccount();
        loadData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleApplyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.configureAccount({
        startingCapital: parseFloat(configCapital),
        slippageRate: parseFloat(configSlippage) / 100,
        feeRate: parseFloat(configFee) / 100
      });
      setShowConfigModal(false);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update configuration');
    }
  };

  const handleOpenReconcile = async () => {
    try {
      setShowReconcileModal(true);
      const [report, ledger] = await Promise.all([
        apiClient.reconcileAccount(),
        apiClient.getCashLedger()
      ]);
      setReconcileReport(report);
      setLedgerEntries(ledger);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLedgerTab = async () => {
    try {
      const ledger = await apiClient.getCashLedger();
      setLedgerEntries(ledger);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'ledger') {
      loadLedgerTab();
    }
  }, [activeTab]);

  const currentTicker = tickers.find(t => t.symbol === symbol) || tickers[0] || {
    symbol,
    ltp: 2985.4,
    bid: 2985.0,
    ask: 2985.5,
    change: 24.8,
    changePct: 0.84,
    market: 'IN',
    currency: 'INR'
  } as Ticker;

  const isUp = currentTicker.changePct >= 0;
  const currencySymbol = currentTicker.currency === 'USD' ? '$' : '₹';

  // Realistic 20-level simulated Depth of Market
  const domDepth = Array.from({ length: 8 }).map((_, i) => {
    const step = (i + 1) * 0.4;
    const bidPrice = Math.round((currentTicker.bid - step) * 10) / 10;
    const askPrice = Math.round((currentTicker.ask + step) * 10) / 10;
    const bidQty = Math.floor(250 + Math.sin(i * 1.5) * 180 + Math.random() * 80);
    const askQty = Math.floor(220 + Math.cos(i * 1.2) * 160 + Math.random() * 80);
    return {
      bidPrice,
      bidQty,
      askPrice,
      askQty,
      bidOrders: Math.floor(bidQty / 40) + 1,
      askOrders: Math.floor(askQty / 35) + 1
    };
  });

  const openOrdersList = portfolio?.openOrders || portfolio?.orders?.filter(o => o.status === 'OPEN') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Prominent Mandatory Paper-Trading Disclaimer Banner */}
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300 font-semibold shadow-lg">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-extrabold tracking-wide text-white">PAPER TRADING – NO REAL MONEY:</span>{' '}
            <span className="text-amber-200/90">
              All executions, cash balances, orders, and PnL are strictly simulated with mathematical ledger reconciliation.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-black tracking-wider">
            Deterministic Engine
          </span>
        </div>
      </div>

      {/* Top Header & Account Status Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Paper Trading Terminal
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SIMULATED EXECUTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rule A Synchronous Pre-Trade Risk Gatekeeper (1% Cap & 3% Circuit Breaker)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-blue-400 transition-all"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure Capital</span>
          </button>

          <button
            onClick={handleOpenReconcile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-all"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Reconcile Ledger</span>
          </button>

          <button
            onClick={handleResetLedger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-rose-500/40 text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Account</span>
          </button>
        </div>
      </div>

      {/* Portfolio Status Summary Card */}
      {portfolio && (
        <PortfolioSummaryCard
          account={portfolio.account}
          onReset={loadData}
        />
      )}

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Interactive Chart & Tabbed Blotters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section with Symbol Selector */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <select
                  value={symbol}
                  onChange={(e) => {
                    const s = e.target.value;
                    setSymbol(s);
                    router.push(`/app/paper-trading?symbol=${s}`);
                  }}
                  className="bg-[#070b14] border border-[#1b253b] text-white font-extrabold text-sm rounded-xl px-2.5 py-1 focus:outline-none"
                >
                  {tickers.map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} — {t.currency === 'USD' ? '$' : '₹'}{t.ltp.toFixed(2)}
                    </option>
                  ))}
                </select>

                <div className={`text-xs font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{currentTicker.changePct.toFixed(2)}%
                </div>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-[#1b253b] text-xs">
                {['1m', '5m', '15m', '1h', '1D'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                      timeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <PriceChart
              symbol={symbol}
              ticker={currentTicker}
              candles={candles}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              showIndicators={true}
            />
          </div>

          {/* Blotter Tabs (Positions / Open Orders / Trade History / Cash Ledger / DOM) */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden shadow-xl">
            {/* Tabs Header */}
            <div className="bg-[#090d16] border-b border-[#1b253b] px-4 flex items-center justify-between text-xs overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveTab('positions')}
                  className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'positions'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Open Positions ({portfolio?.positions?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'orders'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Active Orders ({openOrdersList.length})
                </button>
                <button
                  onClick={() => setActiveTab('trades')}
                  className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'trades'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Trade Journal ({portfolio?.trades?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'ledger'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Cash Ledger
                </button>
                <button
                  onClick={() => setActiveTab('dom')}
                  className={`py-3 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'dom'
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  DOM Ladder
                </button>
              </div>

              <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                RECONCILED LEDGER
              </span>
            </div>

            {/* Tab Contents */}
            <div className="p-4">
              {/* TAB 1: OPEN POSITIONS */}
              {activeTab === 'positions' && (
                <div>
                  {!portfolio?.positions || portfolio.positions.length === 0 ? (
                    <EmptyState
                      title="No Open Positions"
                      description="You currently have no open positions. Submit a BUY or SELL order using the ticket on the right."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                          <tr>
                            <th className="pb-2">Symbol</th>
                            <th className="pb-2">Side</th>
                            <th className="pb-2">Qty</th>
                            <th className="pb-2">Avg Entry</th>
                            <th className="pb-2">Current LTP</th>
                            <th className="pb-2">Unrealized PnL</th>
                            <th className="pb-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253b]/40">
                          {portfolio.positions.map((pos) => {
                            const isPosUp = pos.unrealizedPnL >= 0;
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
                                <td className="py-2.5 text-slate-300">₹{pos.entryPrice?.toFixed(2) || (pos as any).avgPrice?.toFixed(2)}</td>
                                <td className="py-2.5 text-white font-bold">₹{pos.currentPrice?.toFixed(2)}</td>
                                <td className="py-2.5">
                                  <span className={`font-bold ${isPosUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {isPosUp ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)} ({isPosUp ? '+' : ''}{pos.unrealizedPnLPct.toFixed(2)}%)
                                  </span>
                                </td>
                                <td className="py-2.5 text-right">
                                  <button
                                    onClick={() => handleClosePosition(pos.symbol)}
                                    disabled={actionLoading === pos.symbol}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold transition-all disabled:opacity-50"
                                  >
                                    {actionLoading === pos.symbol ? 'Closing...' : 'Close'}
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

              {/* TAB 2: ACTIVE ORDERS (WITH CANCEL BUTTON) */}
              {activeTab === 'orders' && (
                <div>
                  {openOrdersList.length === 0 ? (
                    <EmptyState
                      title="No Active Orders"
                      description="No pending limit or bracket orders currently in the simulated order book."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                          <tr>
                            <th className="pb-2">Order ID</th>
                            <th className="pb-2">Symbol</th>
                            <th className="pb-2">Type</th>
                            <th className="pb-2">Side</th>
                            <th className="pb-2">Qty</th>
                            <th className="pb-2">Limit Price</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253b]/40">
                          {openOrdersList.map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 text-slate-500">{ord.id}</td>
                              <td className="py-2.5 font-bold text-white">{ord.symbol}</td>
                              <td className="py-2.5 text-slate-300">{(ord as any).orderType || ord.type}</td>
                              <td className="py-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  ord.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                  {ord.side}
                                </span>
                              </td>
                              <td className="py-2.5 font-bold text-slate-200">{ord.quantity}</td>
                              <td className="py-2.5 text-white">₹{ord.limitPrice ? ord.limitPrice.toFixed(2) : 'MARKET'}</td>
                              <td className="py-2.5">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-right">
                                <button
                                  onClick={() => handleCancelOrder(ord.id)}
                                  disabled={actionLoading === ord.id}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>{actionLoading === ord.id ? 'Cancelling...' : 'Cancel'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TRADE JOURNAL BLOTTER */}
              {activeTab === 'trades' && (
                <div>
                  {!portfolio?.trades || portfolio.trades.length === 0 ? (
                    <EmptyState
                      title="No Executed Trades"
                      description="Your simulated trade journal is currently empty. Executed orders will appear here with realized PnL."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                          <tr>
                            <th className="pb-2">Trade ID</th>
                            <th className="pb-2">Symbol</th>
                            <th className="pb-2">Side</th>
                            <th className="pb-2">Qty</th>
                            <th className="pb-2">Price</th>
                            <th className="pb-2">Fee</th>
                            <th className="pb-2">Realized PnL</th>
                            <th className="pb-2">R-Multiple</th>
                            <th className="pb-2">Exit Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253b]/40">
                          {portfolio.trades.map((trd) => {
                            const pnl = (trd as any).realizedPnL;
                            const isPnlPositive = pnl !== undefined && pnl >= 0;
                            return (
                              <tr key={trd.id} className="hover:bg-slate-800/30">
                                <td className="py-2.5 text-slate-500">{trd.id}</td>
                                <td className="py-2.5 font-bold text-white">{trd.symbol}</td>
                                <td className="py-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    trd.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                    {trd.side}
                                  </span>
                                </td>
                                <td className="py-2.5">{trd.quantity}</td>
                                <td className="py-2.5 text-white">₹{trd.price?.toFixed(2) || (trd as any).exitPrice?.toFixed(2)}</td>
                                <td className="py-2.5 text-slate-400">₹{(trd as any).feeAmount?.toFixed(2) || '0.00'}</td>
                                <td className="py-2.5">
                                  {pnl !== undefined ? (
                                    <span className={`font-bold ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {isPnlPositive ? '+' : ''}₹{pnl.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                                <td className="py-2.5">
                                  {(trd as any).rMultiple !== undefined && (trd as any).rMultiple !== null ? (
                                    <span className={`font-bold ${(trd as any).rMultiple >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                      {(trd as any).rMultiple}R
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 text-slate-400 text-[11px]">
                                  {(trd as any).exitReason || (trd as any).action || 'ENTRY'}
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

              {/* TAB 4: DOUBLE-ENTRY CASH LEDGER */}
              {activeTab === 'ledger' && (
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1b253b]">
                    <div className="text-xs text-slate-400">
                      Double-entry Cash Ledger Audit Trail — Every trade debit, credit, and simulated fee is immutably logged.
                    </div>
                    <button
                      onClick={handleOpenReconcile}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reconcile Balance</span>
                    </button>
                  </div>

                  {ledgerEntries.length === 0 ? (
                    <EmptyState
                      title="No Cash Ledger Entries"
                      description="Cash transactions will appear here once orders are executed."
                    />
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="text-[11px] text-slate-400 uppercase font-sans border-b border-[#1b253b]">
                          <tr>
                            <th className="pb-2">Reference</th>
                            <th className="pb-2">Type</th>
                            <th className="pb-2">Description</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Balance After</th>
                            <th className="pb-2">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1b253b]/40">
                          {ledgerEntries.map((ent) => {
                            const isCredit = ent.amount > 0;
                            return (
                              <tr key={ent.id} className="hover:bg-slate-800/30">
                                <td className="py-2 text-slate-500">{ent.reference}</td>
                                <td className="py-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    ent.type === 'INITIAL_DEPOSIT' || ent.type === 'ACCOUNT_RESET' || ent.type === 'ACCOUNT_CONFIG'
                                      ? 'bg-blue-500/10 text-blue-400'
                                      : ent.type === 'TRADE_CREDIT'
                                      ? 'bg-emerald-500/10 text-emerald-400'
                                      : ent.type === 'COMMISSION_FEE'
                                      ? 'bg-amber-500/10 text-amber-400'
                                      : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                    {ent.type}
                                  </span>
                                </td>
                                <td className="py-2 text-slate-300 font-sans">{ent.description}</td>
                                <td className={`py-2 font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {isCredit ? '+' : ''}₹{Math.abs(ent.amount).toFixed(2)}
                                </td>
                                <td className="py-2 text-white font-bold">₹{ent.balanceAfter.toFixed(2)}</td>
                                <td className="py-2 text-slate-500 text-[10px]">
                                  {new Date(ent.timestamp).toLocaleTimeString()}
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

              {/* TAB 5: LEVEL 2 DOM BOOK */}
              {activeTab === 'dom' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-[#1b253b]">
                    <span>Simulated Depth of Market Ladder for {symbol}</span>
                    <span className="font-mono text-blue-400">
                      Spread: {currencySymbol}{(currentTicker.ask - currentTicker.bid).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    {/* Bids Ladder (Left) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
                        <span>ORDERS</span>
                        <span>BID QTY</span>
                        <span>BID PRICE</span>
                      </div>
                      {domDepth.map((row, idx) => (
                        <div
                          key={`bid-${idx}`}
                          className="flex justify-between items-center p-1 px-2 rounded bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10"
                        >
                          <span className="text-slate-500 text-[10px]">{row.bidOrders}</span>
                          <span className="text-slate-300 font-semibold">{row.bidQty}</span>
                          <span className="text-emerald-400 font-bold">{currencySymbol}{row.bidPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Asks Ladder (Right) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
                        <span>ASK PRICE</span>
                        <span>ASK QTY</span>
                        <span>ORDERS</span>
                      </div>
                      {domDepth.map((row, idx) => (
                        <div
                          key={`ask-${idx}`}
                          className="flex justify-between items-center p-1 px-2 rounded bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10"
                        >
                          <span className="text-rose-400 font-bold">{currencySymbol}{row.askPrice.toFixed(2)}</span>
                          <span className="text-slate-300 font-semibold">{row.askQty}</span>
                          <span className="text-slate-500 text-[10px]">{row.askOrders}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right (1 Col): Smart Order Ticket with 1% Auto Sizer */}
        <div className="space-y-6">
          <OrderForm
            symbol={symbol}
            ticker={currentTicker}
            portfolio={portfolio || undefined}
            onOrderPlaced={loadData}
          />
        </div>
      </div>

      {/* CONFIGURE CAPITAL MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Configure Virtual Paper Capital</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Starting Capital (₹):</label>
                <input
                  type="number"
                  step="10000"
                  min="50000"
                  value={configCapital}
                  onChange={(e) => setConfigCapital(e.target.value)}
                  className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  {[500000, 1000000, 2500000, 5000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setConfigCapital(amt.toString())}
                      className="px-2 py-1 rounded bg-[#070b14] border border-[#1b253b] text-slate-400 hover:text-white text-[10px]"
                    >
                      ₹{(amt / 100000).toFixed(0)}L
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Simulated Slippage (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configSlippage}
                    onChange={(e) => setConfigSlippage(e.target.value)}
                    className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Commission Fee (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configFee}
                    onChange={(e) => setConfigFee(e.target.value)}
                    className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300">
                Updating virtual capital resets open positions and logs a new baseline configuration entry in the cash ledger.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  Apply Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECONCILIATION MODAL */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Double-Entry Cash Ledger Reconciliation</h3>
              </div>
              <button
                onClick={() => setShowReconcileModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reconcileReport ? (
              <div className="space-y-4 text-xs font-mono">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  reconcileReport.reconciled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold font-sans">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>STATUS: {reconcileReport.status}</span>
                  </div>
                  <span className="font-bold">Variance: ₹{reconcileReport.variance.toFixed(2)}</span>
                </div>

                <div className="bg-[#070b14] border border-[#1b253b] rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Virtual Starting Capital:</span>
                    <span className="text-white font-bold">₹{reconcileReport.startingCapital?.toLocaleString('en-IN') || '10,00,000'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>(-) Total Trade Debits:</span>
                    <span className="text-rose-400 font-bold">₹{reconcileReport.totalTradeDebits?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>(+) Total Trade Credits:</span>
                    <span className="text-emerald-400 font-bold">₹{reconcileReport.totalTradeCredits?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>(-) Total Commission Fees:</span>
                    <span className="text-amber-400 font-bold">₹{reconcileReport.totalCommissionFees?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="pt-2 border-t border-[#1b253b] flex justify-between text-white font-bold">
                    <span>Calculated Paper Cash:</span>
                    <span className="text-emerald-400">₹{reconcileReport.calculatedCash?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold">
                    <span>Actual Account Cash:</span>
                    <span>₹{reconcileReport.actualCurrentCash?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-sans">
                  Formula: <span className="font-mono text-slate-400">{reconcileReport.auditFormula}</span>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-amber-400 font-bold">
                    PAPER TRADING – NO REAL MONEY
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Computing mathematical ledger reconciliation...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaperTradingPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <PaperTradingContent />
    </Suspense>
  );
}
