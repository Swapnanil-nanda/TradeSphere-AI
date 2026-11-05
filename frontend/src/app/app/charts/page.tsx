'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PriceChart from '../../../components/app/PriceChart';
import ErrorState from '../../../components/app/ErrorState';
import { ChartSkeleton } from '../../../components/app/LoadingSkeleton';
import { syntheticMarketData } from '../../../lib/market-data/synthetic-provider';
import { StockDetails, CandleWithIndicators, TechnicalIndicatorsSeries, Instrument, MetadataLabel } from '../../../lib/market-data/types';
import { useMarketStore } from '../../../lib/market-store';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  Clock,
  Compass,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

function ChartsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Instrument[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [candles, setCandles] = useState<CandleWithIndicators[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicatorsSeries | null>(null);
  const [metadata, setMetadata] = useState<MetadataLabel | null>(null);

  const [timeframe, setTimeframe] = useState('5m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams, symbol]);

  const storeQuote = useMarketStore(state => state.quotes[symbol]);
  const storeLtp = storeQuote?.ltp;

  // Load Chart & Stock Data
  const loadChartData = async (targetSymbol: string, targetTf: string) => {
    try {
      setLoading(true);
      setError(null);
      setCandles([]);
      setIndicators(null);

      const [details, candleRes] = await Promise.all([
        syntheticMarketData.getStockDetails(targetSymbol),
        syntheticMarketData.getCandles(targetSymbol, targetTf, 100)
      ]);

      setStockDetails(details);
      setCandles(candleRes.candles);
      setIndicators(candleRes.indicators);
      setMetadata(candleRes.metadata);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to load technical chart data for ${targetSymbol}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData(symbol, timeframe);
  }, [symbol, timeframe]);

  // Handle Search Input
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      syntheticMarketData.searchInstruments(searchQuery).then((results) => {
        setSearchResults(results.slice(0, 6));
        setIsSearchOpen(true);
      });
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  const selectInstrument = (newSymbol: string) => {
    setSymbol(newSymbol);
    setSearchQuery('');
    setIsSearchOpen(false);
    router.push(`/app/charts?symbol=${newSymbol}`);
  };

  const currencySymbol = stockDetails?.currency === 'USD' ? '$' : '₹';
  const isUp = (stockDetails?.changePct ?? 0) >= 0;
  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;

  // Derive latest values for all 8 indicators
  const latestSMA20 = indicators?.sma20 && indicators.sma20.length > 0 ? indicators.sma20[indicators.sma20.length - 1].value : undefined;
  const latestEMA20 = indicators?.ema20 && indicators.ema20.length > 0 ? indicators.ema20[indicators.ema20.length - 1].value : undefined;
  const latestRSI14 = indicators?.rsi14 && indicators.rsi14.length > 0 ? indicators.rsi14[indicators.rsi14.length - 1].value : undefined;
  const latestMACD = indicators?.macd && indicators.macd.length > 0 ? indicators.macd[indicators.macd.length - 1] : undefined;
  const latestBB = indicators?.bollingerBands && indicators.bollingerBands.length > 0 ? indicators.bollingerBands[indicators.bollingerBands.length - 1] : undefined;
  const latestATR14 = indicators?.atr14 && indicators.atr14.length > 0 ? indicators.atr14[indicators.atr14.length - 1].value : undefined;
  const latestVWAP = indicators?.vwap && indicators.vwap.length > 0 ? indicators.vwap[indicators.vwap.length - 1].value : undefined;
  const latestSupertrend = indicators?.supertrend && indicators.supertrend.length > 0 ? indicators.supertrend[indicators.supertrend.length - 1] : undefined;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      {/* 1. Top Instrument Search & Studio Control Bar */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Selector */}
        <div className="flex flex-wrap items-center gap-4 relative">
          <div className="relative min-w-[260px]">
            <div className="flex items-center bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-1.5 focus-within:border-blue-500 transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search symbol or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                className="bg-transparent text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none w-full"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c121f] border border-[#1b253b] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#1b253b]/50">
                {searchResults.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => selectInstrument(item.symbol)}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-blue-600/10 transition-colors"
                  >
                    <div>
                      <div className="font-extrabold text-white text-xs">{item.symbol}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{item.name}</div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1b253b] text-slate-300">
                      {item.exchange}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Stock Quote Badge (Synchronized from useMarketStore) */}
          {stockDetails && (
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white font-mono">
                    {currencySymbol}{Number(storeLtp ?? stockDetails.ltp ?? 0).toFixed(2)}
                  </span>
                  <span className={`text-xs font-bold font-mono flex items-center gap-0.5 ${(storeQuote?.change ?? stockDetails.change ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(storeQuote?.change ?? stockDetails.change ?? 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {(storeQuote?.change ?? stockDetails.change ?? 0) >= 0 ? '+' : ''}{Number(storeQuote?.change ?? stockDetails.change ?? 0).toFixed(2)} ({(storeQuote?.change ?? stockDetails.change ?? 0) >= 0 ? '+' : ''}{Number(storeQuote?.changePct ?? stockDetails.changePct ?? 0).toFixed(2)}%)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium truncate max-w-[220px]">
                  {stockDetails.name} • {stockDetails.sector}
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                SIMULATED (24/7 GBM)
              </span>
            </div>
          )}
        </div>

        {/* Quick Instrument Switching Pills & Trade CTA */}
        <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-sm">
            {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'NIFTY50', 'AAPL', 'NVDA', 'TSLA'].map(s => (
              <button
                key={s}
                onClick={() => selectInstrument(s)}
                className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors ${
                  symbol === s
                    ? 'bg-[#2979FF] text-white'
                    : 'bg-[#151F29] text-[#8B99A8] hover:text-white border border-[#25313D]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Link
            href={`/app/paper-trading?symbol=${symbol}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            <span>Trade {symbol}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Main Studio Grid: Chart (Left) & Technical Research Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* TradingView Chart Container (3 Cols) */}
        <div className="lg:col-span-3">
          {loading ? (
            <ChartSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={() => loadChartData(symbol, timeframe)} />
          ) : (
            <PriceChart
              symbol={symbol}
              candles={candles}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              showIndicators={true}
              height={560}
            />
          )}
        </div>

        {/* 3. Deep Technical & Fundamentals Panel (1 Col) */}
        <div className="space-y-4">
          {/* All 8 Technical Indicators Summary */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 shadow-xl text-xs space-y-3">
            <h3 className="font-extrabold text-white uppercase tracking-wider pb-2 border-b border-[#1b253b] flex items-center justify-between">
              <span>8 Technical Indicators</span>
              <span className="text-[10px] text-blue-400 font-mono">LIVE MATRIX</span>
            </h3>

            <div className="space-y-2 font-mono text-[11px]">
              {/* 1. SMA(20) */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">1. SMA(20)</span>
                <span className="text-amber-400 font-bold">
                  {latestSMA20 ? `${currencySymbol}${latestSMA20.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* 2. EMA(20) */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">2. EMA(20)</span>
                <span className="text-blue-400 font-bold">
                  {latestEMA20 ? `${currencySymbol}${latestEMA20.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* 3. RSI(14) */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">3. RSI(14)</span>
                <span className={`font-bold ${latestRSI14 && latestRSI14 >= 70 ? 'text-rose-400' : latestRSI14 && latestRSI14 <= 30 ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {latestRSI14 ? `${latestRSI14.toFixed(1)} ${latestRSI14 >= 70 ? '(OB)' : latestRSI14 <= 30 ? '(OS)' : '(Neutral)'}` : '—'}
                </span>
              </div>

              {/* 4. MACD(12, 26, 9) */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">4. MACD Hist</span>
                <span className={`font-bold ${latestMACD && (latestMACD.histogram ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {latestMACD?.histogram ? `${latestMACD.histogram > 0 ? '+' : ''}${latestMACD.histogram.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* 5. Bollinger Bands(20, 2) */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">5. BB %b Range</span>
                <span className="text-cyan-400 font-bold">
                  {latestBB?.percentB ? `${(latestBB.percentB * 100).toFixed(1)}%` : '—'}
                </span>
              </div>

              {/* 6. ATR(14) */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">6. ATR(14) Volatility</span>
                <span className="text-amber-300 font-bold">
                  {latestATR14 ? `${currencySymbol}${latestATR14.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* 7. VWAP */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">7. Volume VWAP</span>
                <span className="text-purple-400 font-bold">
                  {latestVWAP ? `${currencySymbol}${latestVWAP.toFixed(2)}` : '—'}
                </span>
              </div>

              {/* 8. Supertrend(10, 3) */}
              <div className="flex justify-between items-center bg-[#070b14] p-2 rounded-lg border border-[#1b253b]">
                <span className="text-slate-400">8. Supertrend</span>
                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${latestSupertrend?.direction === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {latestSupertrend?.direction === 1 ? 'BULLISH' : 'BEARISH'} {latestSupertrend?.supertrend ? `(${latestSupertrend.supertrend.toFixed(1)})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Key Fundamentals & Statistics */}
          {stockDetails && (
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 shadow-xl text-xs space-y-3">
              <h3 className="font-extrabold text-white uppercase tracking-wider pb-2 border-b border-[#1b253b] flex items-center justify-between">
                <span>Stock Profile & Limits</span>
                <span className="text-[10px] text-slate-400 font-mono">{stockDetails.exchange}</span>
              </h3>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#1b253b]/40">
                  <span className="text-slate-400">52-Week Range</span>
                  <span className="text-white font-medium">
                    {currencySymbol}{Number(stockDetails.low52w ?? stockDetails.ltp ?? 0).toFixed(1)} – {currencySymbol}{Number(stockDetails.high52w ?? stockDetails.ltp ?? 0).toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#1b253b]/40">
                  <span className="text-slate-400">P/E Ratio</span>
                  <span className="text-white font-medium">{Number(stockDetails.peRatio ?? 20).toFixed(1)}x</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#1b253b]/40">
                  <span className="text-slate-400">Beta</span>
                  <span className="text-white font-medium">{Number(stockDetails.beta ?? 1).toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#1b253b]/40">
                  <span className="text-slate-400">Upper Circuit (+10%)</span>
                  <span className="text-emerald-400 font-medium">{currencySymbol}{Number(stockDetails.upperCircuit ?? (Number(stockDetails.ltp ?? 0) * 1.1)).toFixed(1)}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Lower Circuit (-10%)</span>
                  <span className="text-rose-400 font-medium">{currencySymbol}{Number(stockDetails.lowerCircuit ?? (Number(stockDetails.ltp ?? 0) * 0.9)).toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChartsPage() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartsContent />
    </Suspense>
  );
}
