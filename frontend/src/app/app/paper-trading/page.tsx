'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderForm from '../../../components/app/OrderForm';
import PortfolioSummaryCard from '../../../components/app/PortfolioSummaryCard';
import PriceChart from '../../../components/app/PriceChart';
import ErrorState from '../../../components/app/ErrorState';
import EmptyState from '../../../components/app/EmptyState';
import { CardSkeleton } from '../../../components/app/LoadingSkeleton';
import {
  apiClient,
  Ticker,
  Candle,
  PortfolioData,
  CashLedgerEntry,
  ReconciliationReport
} from '../../../lib/api-client';
import { useMarketStore } from '../../../lib/market-store';
import {
  ShieldAlert,
  Settings2,
  Scale,
  RotateCcw,
  Ban,
  CheckCircle2,
  Coins,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { generateFallback120Candles } from '../../../components/charts/TradingViewChart';
import { paperEngine } from '../../../lib/paper-engine';

const DEFAULT_TICKERS: Ticker[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', ltp: 2985.4, bid: 2985.0, ask: 2985.5, change: 24.8, changePct: 0.84, market: 'IN', exchange: 'NSE', currency: 'INR' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', ltp: 4125.6, bid: 4125.0, ask: 4126.0, change: -12.4, changePct: -0.30, market: 'IN', exchange: 'NSE', currency: 'INR' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', ltp: 1682.3, bid: 1682.0, ask: 1682.5, change: 8.5, changePct: 0.51, market: 'IN', exchange: 'NSE', currency: 'INR' },
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', ltp: 24350.25, bid: 24349.0, ask: 24351.0, change: 85.4, changePct: 0.35, market: 'IN', exchange: 'NSE', currency: 'INR' },
  { symbol: 'SENSEX', name: 'BSE Sensex 30', ltp: 80105.80, bid: 80100.0, ask: 80110.0, change: 240.2, changePct: 0.30, market: 'IN', exchange: 'BSE', currency: 'INR' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', ltp: 138.25, bid: 138.20, ask: 138.30, change: 4.10, changePct: 3.06, market: 'US', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp', ltp: 445.80, bid: 445.70, ask: 445.90, change: 2.30, changePct: 0.52, market: 'US', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'AAPL', name: 'Apple Inc', ltp: 231.40, bid: 231.35, ask: 231.45, change: -1.20, changePct: -0.51, market: 'US', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc', ltp: 252.60, bid: 252.50, ask: 252.70, change: 8.40, changePct: 3.44, market: 'US', exchange: 'NASDAQ', currency: 'USD' }
];

const getInitialPortfolio = (): PortfolioData => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('tradesphere_cached_portfolio');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.account) return parsed;
      }
    } catch {}
  }
  return paperEngine.getPortfolio(DEFAULT_TICKERS);
};

function PaperTradingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [tickers, setTickers] = useState<Ticker[]>(() => {
    if (typeof window !== 'undefined') {
      const storeTickers = useMarketStore.getState().tickers;
      if (Array.isArray(storeTickers) && storeTickers.length > 0) return storeTickers;
    }
    return DEFAULT_TICKERS;
  });
  const [candles, setCandles] = useState<Candle[]>(() => {
    return generateFallback120Candles(initialSymbol, '5m') as any as Candle[];
  });
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(getInitialPortfolio);
  const [timeframe, setTimeframe] = useState('5m');
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

  // Partial position close modal state
  const [partialCloseModal, setPartialCloseModal] = useState<{ symbol: string; maxQty: number; currentPrice: number } | null>(null);
  const [partialCloseQty, setPartialCloseQty] = useState<string>('1');

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams, symbol]);

  const loadData = () => {
    // 1. Fetch live candles in background without blocking rendering
    apiClient.getCandles(symbol, timeframe)
      .then((candleData) => {
        if (Array.isArray(candleData) && candleData.length > 0) {
          setCandles(candleData);
        }
      })
      .catch((err) => console.warn('[PaperTrading] Candle sync notice:', err?.message || err));

    // 2. Fetch authoritative portfolio in background
    apiClient.getPortfolio()
      .then((portData) => {
        if (portData && portData.account) {
          setPortfolio(portData);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('tradesphere_cached_portfolio', JSON.stringify(portData));
            } catch {}
          }
        }
      })
      .catch((err) => console.warn('[PaperTrading] Portfolio sync notice:', err?.message || err));

    // 3. Fetch tickers in background
    apiClient.getTickers()
      .then((allTickers) => {
        if (Array.isArray(allTickers) && allTickers.length > 0) {
          setTickers(allTickers);
        }
      })
      .catch((err) => console.warn('[PaperTrading] Tickers sync notice:', err?.message || err));
  };

  useEffect(() => {
    // Instantly provide fallback 120 candles on symbol/timeframe switch to prevent any blank chart interval
    setCandles(generateFallback120Candles(symbol, timeframe) as any as Candle[]);
    loadData();
  }, [symbol, timeframe]);

  // Periodic order matching, OCO evaluation & portfolio sync (safe)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await apiClient.matchOpenOrders();
        await apiClient.evaluateOcoTriggers();
        const port = await apiClient.getPortfolio();
        if (port) {
          setPortfolio(port);
        }
      } catch {
        // Silently preserve state
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = async (sym: string) => {
    if (confirm(`Market close full open position for ${sym}?`)) {
      setActionLoading(sym);
      try {
        await apiClient.closePosition(sym);
        const port = await apiClient.getPortfolio();
        if (port) setPortfolio(port);
      } catch (e: any) {
        alert(e.message || 'Failed to close position');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleExecutePartialClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partialCloseModal) return;
    const qty = parseInt(partialCloseQty, 10);
    if (isNaN(qty) || qty <= 0 || qty > partialCloseModal.maxQty) {
      alert(`Please enter a valid quantity between 1 and ${partialCloseModal.maxQty}.`);
      return;
    }

    setActionLoading(partialCloseModal.symbol);
    try {
      await apiClient.closePosition(partialCloseModal.symbol, qty);
      setPartialCloseModal(null);
      const port = await apiClient.getPortfolio();
      if (port) setPortfolio(port);
    } catch (err: any) {
      alert(err.message || 'Failed to execute partial position exit');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm(`Cancel pending order #${orderId}? Cancelled orders will never be filled.`)) {
      setActionLoading(orderId);
      try {
        await apiClient.cancelOrder(orderId);
        const port = await apiClient.getPortfolio();
        if (port) setPortfolio(port);
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
      } catch (e: any) {
        alert(e.message || 'Failed to reset account');
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
      console.warn('[PaperTrading] Reconciliation error:', e);
    }
  };

  const loadLedgerTab = async () => {
    try {
      const ledger = await apiClient.getCashLedger();
      if (Array.isArray(ledger)) {
        setLedgerEntries(ledger);
      }
    } catch (e) {
      console.warn('[PaperTrading] Ledger fetch error:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'ledger') {
      loadLedgerTab();
    }
  }, [activeTab]);

  const quotes = useMarketStore(state => state.quotes);
  const storeQuote = quotes[symbol] || quotes[symbol === 'NIFTY50' ? 'NIFTY 50' : symbol];

  const currentTicker: Ticker = (tickers.find(t => t.symbol === symbol) || tickers[0] || {
    symbol,
    name: `${symbol} Equity`,
    ltp: 2985.4,
    bid: 2985.0,
    ask: 2985.5,
    change: 24.8,
    changePct: 0.84,
    market: 'IN',
    exchange: 'NSE',
    currency: 'INR'
  }) as Ticker;

  const currentLtp = Number(storeQuote?.ltp ?? currentTicker.ltp ?? 2985.4);
  const currentBid = Number(currentTicker.bid ?? currentLtp - 0.05);
  const currentAsk = Number(currentTicker.ask ?? currentLtp + 0.05);
  const currentChangePct = Number(storeQuote?.changePct ?? currentTicker.changePct ?? 0);
  const isUp = currentChangePct >= 0;
  const currencySymbol = (storeQuote?.currency ?? currentTicker.currency) === 'USD' ? '$' : '₹';

  // Realistic 20-level simulated Depth of Market
  const domDepth = Array.from({ length: 8 }).map((_, i) => {
    const step = (i + 1) * 0.4;
    const bidPrice = Math.round((currentBid - step) * 10) / 10;
    const askPrice = Math.round((currentAsk + step) * 10) / 10;
    const bidQty = Math.floor(250 + Math.sin(i * 1.5) * 180 + 50);
    const askQty = Math.floor(220 + Math.cos(i * 1.2) * 160 + 50);
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
    <div className="space-y-4 max-w-7xl mx-auto pb-10 select-none text-[#F0F3F6]">
      {/* 1. Mandatory Paper-Trading Regulatory Disclaimer Banner */}
      <div className="p-3 bg-[#050505] border border-[#141414] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#808a9d]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#D8AB5E] shrink-0" />
          <div>
            <span className="font-extrabold tracking-wide text-white">PAPER TRADING – SIMULATED CAPITAL:</span>{' '}
            <span className="text-[#808a9d]">
              All executions, cash balances, and PnL are strictly simulated with double-entry ledger reconciliation.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#D8AB5E]/10 text-[#D8AB5E] border border-[#D8AB5E]/30 font-bold">
            AUTHORITATIVE OMS (SPRING BOOT)
          </span>
        </div>
      </div>

      {/* 2. Top Header & Account Status Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Paper Trading Terminal
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-mono">
              ACTIVE OMS
            </span>
          </div>
          <p className="text-xs text-[#808a9d] mt-0.5">
            Synchronous Pre-Trade Risk Gatekeeper (Cash Margin Buying Power & 3.0% Daily Drawdown Circuit Breaker)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#080808] border border-[#1a1a1a] hover:border-[#2979FF]/50 text-xs font-semibold text-[#808a9d] hover:text-white transition-all"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure Capital</span>
          </button>

          <button
            onClick={handleOpenReconcile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#080808] border border-[#1a1a1a] hover:border-[#00c805]/50 text-xs font-semibold text-[#808a9d] hover:text-[#00c805] transition-all"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Reconcile Ledger</span>
          </button>

          <button
            onClick={handleResetLedger}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#080808] border border-[#1a1a1a] hover:border-[#ff333a]/50 text-xs font-semibold text-[#808a9d] hover:text-[#ff333a] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Account</span>
          </button>
        </div>
      </div>

      {/* 3. Portfolio Status Summary Card */}
      {portfolio && (
        <PortfolioSummaryCard
          account={portfolio.account}
          onReset={loadData}
        />
      )}

      {/* 4. Main Console Grid: Chart & Blotters (2 Cols) + Ticket (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left (2 Cols): Interactive Chart & Tabbed Blotters */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart Section with Symbol Selector */}
          <div className="bg-[#050505] border border-[#141414] rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <select
                  value={symbol}
                  onChange={(e) => {
                    const s = e.target.value;
                    setSymbol(s);
                    router.push(`/app/paper-trading?symbol=${s}`);
                  }}
                  className="bg-[#080808] border border-[#1a1a1a] text-white font-bold text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#2979FF] font-mono"
                >
                  {tickers.map(t => {
                    const q = quotes[t.symbol];
                    const itemLtp = q?.ltp ?? t.ltp ?? 0;
                    return (
                      <option key={t.symbol} value={t.symbol}>
                        {t.symbol} — {t.currency === 'USD' ? '$' : '₹'}{Number(itemLtp).toFixed(2)}
                      </option>
                    );
                  })}
                </select>

                <div className={`text-xs font-mono font-bold tabular-nums ${isUp ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                  {isUp ? '+' : ''}{currentChangePct.toFixed(2)}%
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-bold hidden sm:inline-block">
                  SIMULATED • GBM Market Feed
                </span>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex items-center bg-[#080808] p-0.5 rounded border border-[#1a1a1a] text-xs font-mono">
                {['1m', '5m', '15m', '1h', '1D'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      timeframe === tf ? 'bg-[#2979FF] text-white' : 'text-[#808a9d] hover:text-white'
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
          <div className="bg-[#050505] border border-[#141414] rounded-lg overflow-hidden">
            {/* Tabs Header */}
            <div className="bg-[#080808] border-b border-[#141414] px-4 flex items-center justify-between text-xs overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveTab('positions')}
                  className={`py-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'positions'
                      ? 'border-[#2979FF] text-white'
                      : 'border-transparent text-[#808a9d] hover:text-white'
                  }`}
                >
                  Open Positions ({portfolio?.positions?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'orders'
                      ? 'border-[#2979FF] text-white'
                      : 'border-transparent text-[#808a9d] hover:text-white'
                  }`}
                >
                  Active Orders ({openOrdersList.length})
                </button>
                <button
                  onClick={() => setActiveTab('trades')}
                  className={`py-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'trades'
                      ? 'border-[#2979FF] text-white'
                      : 'border-transparent text-[#808a9d] hover:text-white'
                  }`}
                >
                  Trade Journal ({portfolio?.trades?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`py-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'ledger'
                      ? 'border-[#2979FF] text-white'
                      : 'border-transparent text-[#808a9d] hover:text-white'
                  }`}
                >
                  Cash Ledger
                </button>
                <button
                  onClick={() => setActiveTab('dom')}
                  className={`py-2.5 px-3 font-bold border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'dom'
                      ? 'border-[#2979FF] text-white'
                      : 'border-transparent text-[#808a9d] hover:text-white'
                  }`}
                >
                  DOM Ladder
                </button>
              </div>

              <span className="text-[10px] text-[#808a9d] font-mono hidden md:inline">
                RECONCILED AUDIT
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
                        <thead className="text-[11px] text-[#808a9d] uppercase font-sans border-b border-[#141414]">
                          <tr>
                            <th className="pb-2">Symbol</th>
                            <th className="pb-2">Side</th>
                            <th className="pb-2">Qty</th>
                            <th className="pb-2">Avg Entry</th>
                            <th className="pb-2">Current LTP</th>
                            <th className="pb-2">Unrealized PnL</th>
                            <th className="pb-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141414]">
                          {portfolio.positions.map((pos) => {
                            const entryPriceVal = Number(pos.entryPrice ?? (pos as any).avgPrice ?? 0);
                            const currentPriceVal = Number(pos.currentPrice ?? 0);
                            const pnlVal = Number(pos.unrealizedPnL ?? 0);
                            const pnlPctVal = Number(pos.unrealizedPnLPct ?? 0);
                            const isPosUp = pnlVal >= 0;

                            return (
                              <tr key={pos.symbol} className="hover:bg-[#0c0c0c] transition-colors">
                                <td className="py-2.5 font-sans font-bold text-white">{pos.symbol}</td>
                                <td className="py-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    pos.side === 'BUY'
                                      ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
                                      : 'bg-[#ff333a]/10 text-[#ff333a] border border-[#ff333a]/30'
                                  }`}>
                                    {pos.side}
                                  </span>
                                </td>
                                <td className="py-2.5 font-bold text-white tabular-nums">{pos.quantity}</td>
                                <td className="py-2.5 text-[#808a9d] tabular-nums">₹{entryPriceVal.toFixed(2)}</td>
                                <td className="py-2.5 text-white font-bold tabular-nums">₹{currentPriceVal.toFixed(2)}</td>
                                <td className="py-2.5 tabular-nums">
                                  <span className={`font-bold ${isPosUp ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                                    {isPosUp ? '+' : ''}₹{pnlVal.toFixed(2)} ({isPosUp ? '+' : ''}{pnlPctVal.toFixed(2)}%)
                                  </span>
                                </td>
                                <td className="py-2.5 text-right font-sans">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Partial Close Button */}
                                    <button
                                      onClick={() => {
                                        setPartialCloseModal({
                                          symbol: pos.symbol,
                                          maxQty: pos.quantity,
                                          currentPrice: currentPriceVal
                                        });
                                        setPartialCloseQty(Math.max(1, Math.floor(pos.quantity / 2)).toString());
                                      }}
                                      disabled={actionLoading === pos.symbol || pos.quantity <= 1}
                                      className="px-2 py-1 rounded bg-[#2979FF]/10 hover:bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/30 text-[10px] font-bold transition-all disabled:opacity-30"
                                      title="Exit a specific quantity of shares"
                                    >
                                      Partial
                                    </button>

                                    {/* Full Close Button */}
                                    <button
                                      onClick={() => handleClosePosition(pos.symbol)}
                                      disabled={actionLoading === pos.symbol}
                                      className="px-2 py-1 rounded bg-[#ff333a]/10 hover:bg-[#ff333a]/20 text-[#ff333a] border border-[#ff333a]/30 text-[10px] font-bold transition-all disabled:opacity-50"
                                      title="Close entire position at market"
                                    >
                                      {actionLoading === pos.symbol ? 'Closing...' : 'Close All'}
                                    </button>
                                  </div>
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
                        <thead className="text-[11px] text-[#808a9d] uppercase font-sans border-b border-[#141414]">
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
                        <tbody className="divide-y divide-[#141414]">
                          {openOrdersList.map((ord) => (
                            <tr key={ord.id} className="hover:bg-[#0c0c0c] transition-colors">
                              <td className="py-2.5 text-[#808a9d]">{ord.id}</td>
                              <td className="py-2.5 font-bold text-white">{ord.symbol}</td>
                              <td className="py-2.5 text-[#808a9d]">{(ord as any).orderType || ord.type}</td>
                              <td className="py-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  ord.side === 'BUY'
                                    ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
                                    : 'bg-[#ff333a]/10 text-[#ff333a] border border-[#ff333a]/30'
                                }`}>
                                  {ord.side}
                                </span>
                              </td>
                              <td className="py-2.5 font-bold text-white tabular-nums">{ord.quantity}</td>
                              <td className="py-2.5 text-white tabular-nums">
                                ₹{ord.limitPrice ? Number(ord.limitPrice).toFixed(2) : 'MARKET'}
                              </td>
                              <td className="py-2.5">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30">
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-2.5 text-right font-sans">
                                <button
                                  onClick={() => handleCancelOrder(ord.id)}
                                  disabled={actionLoading === ord.id}
                                  className="px-2.5 py-1 rounded bg-[#ff333a]/10 hover:bg-[#ff333a]/20 text-[#ff333a] border border-[#ff333a]/30 text-[10px] font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1"
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
                        <thead className="text-[11px] text-[#808a9d] uppercase font-sans border-b border-[#141414]">
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
                        <tbody className="divide-y divide-[#141414]">
                          {portfolio.trades.map((trd) => {
                            const pnlRaw = (trd as any).realizedPnL;
                            const hasPnl = pnlRaw !== undefined && pnlRaw !== null;
                            const pnlVal = Number(pnlRaw ?? 0);
                            const isPnlPositive = pnlVal >= 0;
                            const priceVal = Number(trd.price ?? (trd as any).exitPrice ?? 0);
                            const feeVal = Number((trd as any).feeAmount ?? 0);

                            return (
                              <tr key={trd.id} className="hover:bg-[#0c0c0c] transition-colors">
                                <td className="py-2.5 text-[#808a9d]">{trd.id}</td>
                                <td className="py-2.5 font-bold text-white">{trd.symbol}</td>
                                <td className="py-2.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    trd.side === 'BUY'
                                      ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
                                      : 'bg-[#ff333a]/10 text-[#ff333a] border border-[#ff333a]/30'
                                  }`}>
                                    {trd.side}
                                  </span>
                                </td>
                                <td className="py-2.5 tabular-nums text-white font-bold">{trd.quantity}</td>
                                <td className="py-2.5 text-white tabular-nums">₹{priceVal.toFixed(2)}</td>
                                <td className="py-2.5 text-[#808a9d] tabular-nums">₹{feeVal.toFixed(2)}</td>
                                <td className="py-2.5 tabular-nums">
                                  {hasPnl ? (
                                    <span className={`font-bold ${isPnlPositive ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                                      {isPnlPositive ? '+' : ''}₹{pnlVal.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-[#808a9d]">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 tabular-nums">
                                  {(trd as any).rMultiple !== undefined && (trd as any).rMultiple !== null ? (
                                    <span className={`font-bold ${Number((trd as any).rMultiple) >= 1.5 ? 'text-[#00c805]' : 'text-[#D8AB5E]'}`}>
                                      {Number((trd as any).rMultiple).toFixed(2)}R
                                    </span>
                                  ) : (
                                    <span className="text-[#808a9d]">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 text-[#808a9d] text-[11px] font-sans">
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
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#141414]">
                    <div className="text-xs text-[#808a9d]">
                      Double-entry Cash Ledger Audit Trail — Every trade debit, credit, and simulated fee is immutably logged.
                    </div>
                    <button
                      onClick={handleOpenReconcile}
                      className="px-2.5 py-1 rounded bg-[#00c805]/10 text-[#00c805] hover:bg-[#00c805]/20 border border-[#00c805]/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
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
                        <thead className="text-[11px] text-[#808a9d] uppercase font-sans border-b border-[#141414]">
                          <tr>
                            <th className="pb-2">Reference</th>
                            <th className="pb-2">Type</th>
                            <th className="pb-2">Description</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Balance After</th>
                            <th className="pb-2">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#141414]">
                          {ledgerEntries.map((ent) => {
                            const amt = Number(ent.amount ?? 0);
                            const balAfter = Number(ent.balanceAfter ?? 0);
                            const isCredit = amt > 0;

                            return (
                              <tr key={ent.id} className="hover:bg-[#0c0c0c] transition-colors">
                                <td className="py-2 text-[#808a9d]">{ent.reference}</td>
                                <td className="py-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    ent.type === 'INITIAL_DEPOSIT' || ent.type === 'ACCOUNT_RESET' || ent.type === 'ACCOUNT_CONFIG'
                                      ? 'bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30'
                                      : ent.type === 'TRADE_CREDIT'
                                      ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
                                      : ent.type === 'COMMISSION_FEE'
                                      ? 'bg-[#D8AB5E]/10 text-[#D8AB5E] border border-[#D8AB5E]/30'
                                      : 'bg-[#ff333a]/10 text-[#ff333a] border border-[#ff333a]/30'
                                  }`}>
                                    {ent.type}
                                  </span>
                                </td>
                                <td className="py-2 text-[#808a9d] font-sans">{ent.description}</td>
                                <td className={`py-2 font-bold tabular-nums ${isCredit ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                                  {isCredit ? '+' : ''}₹{Math.abs(amt).toFixed(2)}
                                </td>
                                <td className="py-2 text-white font-bold tabular-nums">₹{balAfter.toFixed(2)}</td>
                                <td className="py-2 text-[#808a9d] text-[10px] tabular-nums">
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

              {/* TAB 5: SIMULATED 20-LEVEL DOM BOOK */}
              {activeTab === 'dom' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#808a9d] pb-2 border-b border-[#141414]">
                    <span>Simulated Depth of Market Ladder for {symbol}</span>
                    <span className="font-mono text-[#2979FF]">
                      Spread: {currencySymbol}{Math.max(0, currentAsk - currentBid).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    {/* Bids Ladder (Left) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#808a9d] font-bold px-1 font-sans">
                        <span>ORDERS</span>
                        <span>BID QTY</span>
                        <span>BID PRICE</span>
                      </div>
                      {domDepth.map((row, idx) => (
                        <div
                          key={`bid-${idx}`}
                          className="flex justify-between items-center p-1 px-2 rounded bg-[#00c805]/5 hover:bg-[#00c805]/10 border border-[#00c805]/10"
                        >
                          <span className="text-[#808a9d] text-[10px]">{row.bidOrders}</span>
                          <span className="text-white font-semibold tabular-nums">{row.bidQty}</span>
                          <span className="text-[#00c805] font-bold tabular-nums">{currencySymbol}{row.bidPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Asks Ladder (Right) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#808a9d] font-bold px-1 font-sans">
                        <span>ASK PRICE</span>
                        <span>ASK QTY</span>
                        <span>ORDERS</span>
                      </div>
                      {domDepth.map((row, idx) => (
                        <div
                          key={`ask-${idx}`}
                          className="flex justify-between items-center p-1 px-2 rounded bg-[#ff333a]/5 hover:bg-[#ff333a]/10 border border-[#ff333a]/10"
                        >
                          <span className="text-[#ff333a] font-bold tabular-nums">{currencySymbol}{row.askPrice.toFixed(2)}</span>
                          <span className="text-white font-semibold tabular-nums">{row.askQty}</span>
                          <span className="text-[#808a9d] text-[10px]">{row.askOrders}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right (1 Col): Smart Order Ticket with Margin Quick Sizer */}
        <div className="space-y-4">
          <OrderForm
            symbol={symbol}
            ticker={currentTicker}
            portfolio={portfolio || undefined}
            onOrderPlaced={loadData}
          />
        </div>
      </div>

      {/* 5. CONFIGURE CAPITAL MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#050505] border border-[#141414] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-[#F0F3F6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#2979FF]" />
                <h3 className="font-bold text-white text-base font-sans">Configure Virtual Paper Capital</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[#808a9d] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyConfig} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#808a9d] font-bold mb-1">Starting Capital (₹):</label>
                <input
                  type="number"
                  step="10000"
                  min="50000"
                  value={configCapital}
                  onChange={(e) => setConfigCapital(e.target.value)}
                  className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#2979FF]"
                />
                <div className="flex gap-2 mt-2 font-mono">
                  {[500000, 1000000, 2500000, 5000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setConfigCapital(amt.toString())}
                      className="px-2 py-1 rounded bg-[#080808] border border-[#1a1a1a] text-[#808a9d] hover:text-white text-[10px]"
                    >
                      ₹{(amt / 100000).toFixed(0)}L
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#808a9d] font-bold mb-1">Simulated Slippage (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configSlippage}
                    onChange={(e) => setConfigSlippage(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#808a9d] font-bold mb-1">Commission Fee (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={configFee}
                    onChange={(e) => setConfigFee(e.target.value)}
                    className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#2979FF]/10 border border-[#2979FF]/20 rounded text-[11px] text-[#2979FF]">
                Updating virtual capital resets open positions and logs a new baseline configuration entry in the cash ledger.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded text-[#808a9d] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/20"
                >
                  Apply Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PARTIAL POSITION CLOSE MODAL */}
      {partialCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
          <form
            onSubmit={handleExecutePartialClose}
            className="bg-[#050505] border border-[#141414] rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-[#F0F3F6]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2979FF]" />
                <h3 className="font-bold text-white text-base font-sans">Partial Position Exit</h3>
              </div>
              <button
                type="button"
                onClick={() => setPartialCloseModal(null)}
                className="text-[#808a9d] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#080808] p-3 rounded border border-[#1a1a1a] flex justify-between font-mono">
                <span className="text-[#808a9d]">Instrument:</span>
                <span className="font-bold text-white">{partialCloseModal.symbol}</span>
              </div>
              <div className="bg-[#080808] p-3 rounded border border-[#1a1a1a] flex justify-between font-mono">
                <span className="text-[#808a9d]">Available Quantity:</span>
                <span className="font-bold text-white">{partialCloseModal.maxQty} shares</span>
              </div>

              <div>
                <label className="block text-[#808a9d] font-bold mb-1 font-sans">Quantity to Exit:</label>
                <input
                  type="number"
                  min="1"
                  max={partialCloseModal.maxQty}
                  value={partialCloseQty}
                  onChange={(e) => setPartialCloseQty(e.target.value)}
                  className="w-full bg-[#080808] border border-[#1a1a1a] rounded px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#2979FF]"
                  required
                />
                <span className="text-[10px] text-[#808a9d] mt-1 block">
                  Remaining position: {Math.max(0, partialCloseModal.maxQty - (parseInt(partialCloseQty, 10) || 0))} shares
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPartialCloseModal(null)}
                className="px-3 py-1.5 rounded border border-[#1a1a1a] text-[#808a9d] hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading === partialCloseModal.symbol}
                className="px-4 py-1.5 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {actionLoading === partialCloseModal.symbol ? 'Executing...' : 'Confirm Partial Exit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. RECONCILIATION MODAL */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
          <div className="bg-[#050505] border border-[#141414] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-[#F0F3F6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#141414]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#00c805]" />
                <h3 className="font-bold text-white text-base font-sans">Double-Entry Cash Ledger Reconciliation</h3>
              </div>
              <button
                onClick={() => setShowReconcileModal(false)}
                className="text-[#808a9d] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reconcileReport ? (
              <div className="space-y-4 text-xs font-mono">
                <div className={`p-3 rounded border flex items-center justify-between ${
                  reconcileReport.reconciled
                    ? 'bg-[#00c805]/10 border-[#00c805]/30 text-[#00c805]'
                    : 'bg-[#ff333a]/10 border-[#ff333a]/30 text-[#ff333a]'
                }`}>
                  <div className="flex items-center gap-2 font-bold font-sans">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00c805]" />
                    <span>STATUS: {reconcileReport.status}</span>
                  </div>
                  <span className="font-bold tabular-nums">
                    Variance: ₹{Number(reconcileReport.variance ?? 0).toFixed(2)}
                  </span>
                </div>

                <div className="bg-[#080808] border border-[#141414] rounded p-3 space-y-2 tabular-nums">
                  <div className="flex justify-between text-[#808a9d]">
                    <span>Virtual Starting Capital:</span>
                    <span className="text-white font-bold">
                      ₹{Number(reconcileReport.startingCapital ?? 1000000).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#808a9d]">
                    <span>(-) Total Trade Debits:</span>
                    <span className="text-[#ff333a] font-bold">
                      ₹{Number(reconcileReport.totalTradeDebits ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#808a9d]">
                    <span>(+) Total Trade Credits:</span>
                    <span className="text-[#00c805] font-bold">
                      ₹{Number(reconcileReport.totalTradeCredits ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#808a9d]">
                    <span>(-) Total Commission Fees:</span>
                    <span className="text-[#D8AB5E] font-bold">
                      ₹{Number(reconcileReport.totalCommissionFees ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#141414] flex justify-between text-white font-bold">
                    <span>Calculated Paper Cash:</span>
                    <span className="text-[#00c805]">
                      ₹{Number(reconcileReport.calculatedCash ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-bold">
                    <span>Actual Account Cash:</span>
                    <span>₹{Number(reconcileReport.actualCurrentCash ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#808a9d] font-sans">
                  Formula: <span className="font-mono text-white">{reconcileReport.auditFormula}</span>
                </div>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-[#D8AB5E] font-bold font-sans">
                    PAPER TRADING – STRICT CONSERVATION OF CAPITAL
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-[#808a9d] text-xs font-mono">
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
