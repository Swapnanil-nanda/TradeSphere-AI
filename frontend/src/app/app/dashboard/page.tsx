'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MarketIndexCard from '../../../components/app/MarketIndexCard';
import PortfolioSummaryCard from '../../../components/app/PortfolioSummaryCard';
import PriceChart from '../../../components/app/PriceChart';
import QuoteTable from '../../../components/app/QuoteTable';
import OrderForm from '../../../components/app/OrderForm';
import ErrorState from '../../../components/app/ErrorState';
import { CardSkeleton, TableSkeleton } from '../../../components/app/LoadingSkeleton';
import { apiClient, Ticker, Candle, PortfolioData } from '../../../lib/api-client';
import { ShieldCheck, Sparkles, RefreshCw, BarChart2, ArrowRight, Terminal } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_DASHBOARD_TICKERS: Ticker[] = [
  { symbol: 'NIFTY 50', name: 'NIFTY 50 Index', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 24350.25, bid: 24349.50, ask: 24351.00, change: 142.50, changePct: 0.59, volume: 45000000, dayHigh: 24420.00, dayLow: 24210.00, timestamp: Date.now(), isSimulated: true },
  { symbol: 'SENSEX', name: 'BSE SENSEX Index', market: 'IN', exchange: 'BSE', currency: 'INR', ltp: 80105.80, bid: 80100.00, ask: 80110.00, change: 395.20, changePct: 0.50, volume: 22000000, dayHigh: 80350.00, dayLow: 79800.00, timestamp: Date.now(), isSimulated: true },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 2985.40, bid: 2985.00, ask: 2985.80, change: 24.80, changePct: 0.84, volume: 1824900, dayHigh: 3010.00, dayLow: 2940.00, timestamp: Date.now(), isSimulated: true },
  { symbol: 'TCS', name: 'Tata Consultancy Services', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 4125.60, bid: 4125.00, ask: 4126.20, change: 48.20, changePct: 1.18, volume: 920400, dayHigh: 4160.00, dayLow: 4090.00, timestamp: Date.now(), isSimulated: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', market: 'IN', exchange: 'NSE', currency: 'INR', ltp: 1682.30, bid: 1682.00, ask: 1682.60, change: -12.40, changePct: -0.73, volume: 3410200, dayHigh: 1705.00, dayLow: 1675.00, timestamp: Date.now(), isSimulated: true },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 138.25, bid: 138.20, ask: 138.30, change: 4.60, changePct: 3.44, volume: 45200000, dayHigh: 140.50, dayLow: 135.80, timestamp: Date.now(), isSimulated: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 445.80, bid: 445.60, ask: 446.00, change: 5.30, changePct: 1.20, volume: 18400000, dayHigh: 448.20, dayLow: 442.10, timestamp: Date.now(), isSimulated: true },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 231.40, bid: 231.30, ask: 231.50, change: 1.80, changePct: 0.78, volume: 32100000, dayHigh: 233.00, dayLow: 229.50, timestamp: Date.now(), isSimulated: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US', exchange: 'NASDAQ', currency: 'USD', ltp: 252.60, bid: 252.40, ask: 252.80, change: -6.20, changePct: -2.39, volume: 28900000, dayHigh: 261.00, dayLow: 249.20, timestamp: Date.now(), isSimulated: true }
];

const DEFAULT_PORTFOLIO: PortfolioData = {
  account: {
    startingCapital: 1000000,
    currentCash: 1000000,
    portfolioValue: 1000000,
    totalPnL: 0,
    totalPnLPct: 0,
    dailyDrawdownPct: 0,
    isCircuitBreakerTripped: false,
    currency: 'INR'
  },
  positions: [],
  openOrders: [],
  executedTrades: []
};

export default function DashboardPage() {
  const [tickers, setTickers] = useState<Ticker[]>(DEFAULT_DASHBOARD_TICKERS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState<string>('5m');
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(DEFAULT_PORTFOLIO);
  const [coachAdvice, setCoachAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});

  const loadData = useCallback(async () => {
    // 300ms hydration fallback to prevent stuck skeletons
    const hydrationTimer = setTimeout(() => {
      setLoading(false);
    }, 300);

    try {
      setError(null);
      const [allTickers, portfolioData] = await Promise.all([
        apiClient.getTickers(),
        apiClient.getPortfolio()
      ]);
      if (Array.isArray(allTickers) && allTickers.length > 0) {
        setTickers(allTickers);
      }
      if (portfolioData) {
        setPortfolio(portfolioData);
      }

      const sym = selectedSymbol || (allTickers && allTickers.length > 0 ? allTickers[0].symbol : 'RELIANCE');
      setSelectedSymbol(sym);

      const [candleData, coach] = await Promise.all([
        apiClient.getCandles(sym, timeframe),
        apiClient.getCoachFeedback(sym)
      ]);
      if (Array.isArray(candleData) && candleData.length > 0) {
        setCandles(candleData);
      }
      if (coach) {
        setCoachAdvice(coach);
      }
    } catch (err: any) {
      console.warn('Dashboard background sync notice:', err);
      // Suppress hard crash - hydrated defaults remain visible
    } finally {
      clearTimeout(hydrationTimer);
      setLoading(false);
    }
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic tick updater for dashboard
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fresh = await apiClient.getTickers();
        setTickers(prev => {
          const newFlashes: Record<string, 'up' | 'down'> = {};
          fresh.forEach(t => {
            const old = prev.find(p => p.symbol === t.symbol);
            if (old && old.ltp !== t.ltp) {
              newFlashes[t.symbol] = t.ltp > old.ltp ? 'up' : 'down';
            }
          });
          setFlashes(newFlashes);
          return fresh;
        });
      } catch {
        // quiet fallback
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSymbol = async (sym: string) => {
    setSelectedSymbol(sym);
    try {
      const [c, coach] = await Promise.all([
        apiClient.getCandles(sym, timeframe),
        apiClient.getCoachFeedback(sym)
      ]);
      setCandles(c);
      setCoachAdvice(coach);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOrderPlaced = () => {
    apiClient.getPortfolio().then(setPortfolio);
  };

  const selectedTicker = tickers.find(t => t.symbol === selectedSymbol) || tickers[0];

  // Market indices
  const nifty = tickers.find(t => t.symbol === 'NIFTY50') || {
    symbol: 'NIFTY 50',
    name: 'NSE Nifty 50 Index',
    ltp: 24350.25,
    change: 142.50,
    changePct: 0.59,
    market: 'IN',
    currency: 'INR'
  };
  const bankNifty = tickers.find(t => t.symbol === 'BANKNIFTY') || {
    symbol: 'BANKNIFTY',
    name: 'NSE Nifty Bank',
    ltp: 51240.80,
    change: -110.20,
    changePct: -0.21,
    market: 'IN',
    currency: 'INR'
  };
  const spx = tickers.find(t => t.symbol === 'SPY') || {
    symbol: 'S&P 500 (SPY)',
    name: 'SPDR S&P 500 ETF',
    ltp: 582.40,
    change: 4.85,
    changePct: 0.84,
    market: 'US',
    currency: 'USD'
  };
  const qqq = tickers.find(t => t.symbol === 'QQQ') || {
    symbol: 'NASDAQ (QQQ)',
    name: 'Invesco QQQ Trust',
    ltp: 494.10,
    change: 6.20,
    changePct: 1.27,
    market: 'US',
    currency: 'USD'
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <CardSkeleton />
            <TableSkeleton rows={6} />
          </div>
          <div><CardSkeleton /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8 select-none text-xs">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Trading Dashboard
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              SIMULATED MARKET
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time simulated execution with synchronous 1.0% risk gatekeeper.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] hover:border-blue-500/50 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
            title="Refresh Quotes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/app/paper-trading"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Launch Terminal</span>
          </Link>
        </div>
      </div>

      {/* Market Indices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MarketIndexCard
          name="NIFTY 50"
          symbol="NSE:NIFTY50"
          value={nifty.ltp}
          change={nifty.change}
          changePct={nifty.changePct}
          market="IN"
          currency="₹"
        />
        <MarketIndexCard
          name="BANK NIFTY"
          symbol="NSE:BANKNIFTY"
          value={bankNifty.ltp}
          change={bankNifty.change}
          changePct={bankNifty.changePct}
          market="IN"
          currency="₹"
        />
        <MarketIndexCard
          name="S&P 500 ETF"
          symbol="NASDAQ:SPY"
          value={spx.ltp}
          change={spx.change}
          changePct={spx.changePct}
          market="US"
          currency="$"
        />
        <MarketIndexCard
          name="NASDAQ 100"
          symbol="NASDAQ:QQQ"
          value={qqq.ltp}
          change={qqq.change}
          changePct={qqq.changePct}
          market="US"
          currency="$"
        />
      </div>

      {/* Main Grid: Portfolio & Charts (Left) vs Order Ticket & AI Coach (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Portfolio Summary Card */}
          {portfolio && (
            <PortfolioSummaryCard
              account={portfolio.account}
              onReset={loadData}
            />
          )}

          {/* Interactive Candlestick Chart */}
          <div className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl p-3.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="font-bold text-xs text-slate-900 dark:text-white">
                  Technical Price Action — <span className="text-blue-600 dark:text-blue-400 font-mono">{selectedSymbol}</span>
                </h2>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                  {selectedTicker?.market === 'IN' ? 'NSE 🇮🇳' : 'US 🇺🇸'}
                </span>
              </div>
            </div>

            <PriceChart
              symbol={selectedSymbol}
              ticker={selectedTicker}
              candles={candles}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              showIndicators={true}
            />
          </div>

          {/* Live Dual-Market Quotes Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Market Watch</span>
                <span className="text-[10px] font-normal text-slate-400">
                  (Click row to view in chart)
                </span>
              </h2>
              <Link
                href="/app/markets"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>All Markets</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <QuoteTable
              tickers={tickers.slice(0, 15)}
              onSelectSymbol={handleSelectSymbol}
              flashes={flashes}
            />
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-4">
          {/* Quick Order Ticket */}
          <OrderForm
            symbol={selectedSymbol}
            ticker={selectedTicker}
            portfolio={portfolio || undefined}
            onOrderPlaced={handleOrderPlaced}
          />

          {/* AI Risk Coach Widget */}
          <div className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1b253b] mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Risk Coach
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="bg-slate-50 dark:bg-[#090d16] p-2.5 rounded-lg border border-slate-200 dark:border-[#1b253b] text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {coachAdvice?.advice ||
                  'Keep position sizes below ₹10,000 maximum single-trade risk. Hard Stop-Loss is mandatory on every order before execution.'}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-50 dark:bg-[#090d16] p-2 rounded-lg border border-slate-200 dark:border-[#1b253b]">
                  <span className="text-slate-500 block text-[9px] font-sans">RISK STATUS</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">NORMAL</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#090d16] p-2 rounded-lg border border-slate-200 dark:border-[#1b253b]">
                  <span className="text-slate-500 block text-[9px] font-sans">MAX RISK / TRADE</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">1.0% (₹10,000)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
