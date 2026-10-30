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
import { ShieldCheck, Sparkles, RefreshCw, BarChart2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [timeframe, setTimeframe] = useState<string>('5m');
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [coachAdvice, setCoachAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [allTickers, portfolioData] = await Promise.all([
        apiClient.getTickers(),
        apiClient.getPortfolio()
      ]);
      setTickers(allTickers);
      setPortfolio(portfolioData);

      // Default to first ticker if selectedSymbol not in list
      const sym = selectedSymbol || (allTickers.length > 0 ? allTickers[0].symbol : 'RELIANCE');
      setSelectedSymbol(sym);

      const [candleData, coach] = await Promise.all([
        apiClient.getCandles(sym, timeframe),
        apiClient.getCoachFeedback()
      ]);
      setCandles(candleData);
      setCoachAdvice(coach);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to connect to market simulation engine. Please verify the backend service is running.');
    } finally {
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

  // Update candles when selected symbol changes
  const handleSelectSymbol = async (sym: string) => {
    setSelectedSymbol(sym);
    try {
      const c = await apiClient.getCandles(sym, timeframe);
      setCandles(c);
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Trading Dashboard
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SIMULATED MARKET
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time simulated execution with synchronous 1.0% risk gatekeeper.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            title="Refresh Quotes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/app/paper-trading"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
          >
            <span>Full Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Market Indices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Summary Card */}
          {portfolio && (
            <PortfolioSummaryCard
              account={portfolio.account}
              onReset={loadData}
            />
          )}

          {/* Interactive Candlestick Chart */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <h2 className="font-extrabold text-sm text-white">
                  Technical Price Action — <span className="text-blue-400 font-mono">{selectedSymbol}</span>
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
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
              <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Active Market Watch</span>
                <span className="text-[10px] font-normal text-slate-400">
                  (Click any row to load into chart &amp; order form)
                </span>
              </h2>
              <Link
                href="/app/markets"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>View All Markets</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <QuoteTable
              tickers={tickers.slice(0, 7)}
              onSelectSymbol={handleSelectSymbol}
              flashes={flashes}
            />
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Quick Order Ticket */}
          <OrderForm
            symbol={selectedSymbol}
            ticker={selectedTicker}
            portfolio={portfolio || undefined}
            onOrderPlaced={handleOrderPlaced}
          />

          {/* AI Risk Coach Widget */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b253b] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                  AI Risk Coach
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-[#090d16] p-3 rounded-xl border border-[#1b253b] text-xs text-slate-300 leading-relaxed">
                {coachAdvice?.advice ||
                  'Keep position sizes below ₹10,000 maximum single-trade risk. Hard Stop-Loss is mandatory on every order before execution.'}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-[#090d16] p-2 rounded-lg border border-[#1b253b]">
                  <span className="text-slate-500 block text-[10px]">RISK STATUS</span>
                  <span className="text-emerald-400 font-bold">NORMAL</span>
                </div>
                <div className="bg-[#090d16] p-2 rounded-lg border border-[#1b253b]">
                  <span className="text-slate-500 block text-[10px]">MAX RISK / TRADE</span>
                  <span className="text-blue-400 font-bold">1.0% (₹10,000)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Positions Blotter Summary */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b253b] mb-3">
              <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                Open Positions ({portfolio?.positions.length || 0})
              </span>
              <Link href="/app/portfolio" className="text-[11px] text-blue-400 hover:underline">
                Manage
              </Link>
            </div>

            {portfolio?.positions && portfolio.positions.length > 0 ? (
              <div className="space-y-2">
                {portfolio.positions.slice(0, 3).map(pos => {
                  const isPosUp = pos.unrealizedPnL >= 0;
                  return (
                    <div
                      key={pos.symbol}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#090d16] border border-[#1b253b] text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{pos.symbol}</div>
                        <div className="text-[10px] text-slate-500">
                          {pos.quantity} Qty @ ₹{pos.entryPrice.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className={`font-bold ${isPosUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPosUp ? '+' : ''}₹{pos.unrealizedPnL.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${isPosUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isPosUp ? '+' : ''}{pos.unrealizedPnLPct.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500">
                No open positions. Use the order form to enter a simulated trade.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
