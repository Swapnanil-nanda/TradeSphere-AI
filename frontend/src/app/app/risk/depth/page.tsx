'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlignVerticalSpaceAround, ShieldCheck, Activity, RefreshCw,
  TrendingUp, TrendingDown, ArrowRight, Zap
} from 'lucide-react';
import Link from 'next/link';
import OrderBookDOM from '../../../../components/OrderBookDOM';
import { apiClient, Ticker } from '../../../../lib/api-client';
import {
  ALL_RISK_SYMBOLS,
  RISK_UNIVERSE_ASSETS,
  generate20LevelDOM
} from '../../../../lib/options-risk-engine';

function DepthContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [tickCounter, setTickCounter] = useState(0);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol && RISK_UNIVERSE_ASSETS[sym]) {
      setSymbol(sym);
    }
  }, [searchParams]);

  const meta = RISK_UNIVERSE_ASSETS[symbol] || RISK_UNIVERSE_ASSETS['RELIANCE'];

  useEffect(() => {
    let isMounted = true;
    const fetchTicker = async () => {
      try {
        const list = await apiClient.getTickers();
        if (isMounted && Array.isArray(list) && list.length > 0) {
          const found = list.find(t => t.symbol === symbol) || list[0];
          if (found) {
            setTicker(found);
            setTickCounter(c => c + 1);
          }
        }
      } catch (err) {
        console.error('Error fetching DOM ticker:', err);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const ltp = Number(ticker?.ltp || meta.basePrice);
  const isUS = meta.market === 'US';
  const currSym = isUS ? '$' : '₹';

  // Microstructure analytics from DOM
  const domSnapshot = useMemo(() => {
    return generate20LevelDOM(symbol, ltp);
  }, [symbol, ltp, tickCounter]);

  const changePct = Number(ticker?.changePct ?? 0.65);
  const isPositive = changePct >= 0;

  return (
    <div className="space-y-4 select-none pb-10 text-xs text-[#E7EDF3] max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-4 rounded-xl border border-[#25313D] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <AlignVerticalSpaceAround className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white font-sans">
                  20-Level Depth of Market (DOM Ladder)
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                  SIMULATED 20-LEVEL QUEUE STREAM
                </span>
              </div>
              <p className="text-[#8B99A8] text-xs">
                Microsecond order book microstructure, bid/ask depth queue geometry, and liquidity wall detection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono text-xs">
              <span className="text-white font-bold">{symbol}</span>
              <span className="text-[#8B99A8] tabular-nums">
                {currSym}{ltp.toFixed(2)}
              </span>
              <span className={`text-[10px] font-bold ${isPositive ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                {isPositive ? '+' : ''}{changePct.toFixed(2)}%
              </span>
            </div>

            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs focus:outline-none focus:border-[#2979FF]"
            >
              <optgroup label="Indian Equities &amp; Indices (NSE)">
                {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'IN').map(s => (
                  <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
                ))}
              </optgroup>
              <optgroup label="US Equities &amp; ETFs (NASDAQ/NYSE)">
                {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'US').map(s => (
                  <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Microstructure Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">Spread / Basis Points</div>
          <div className="text-sm font-bold text-[#D8AB5E] mt-0.5 tabular-nums">
            {currSym}{domSnapshot.spread.toFixed(2)} ({domSnapshot.spreadBps} bps)
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">Tick Size: {currSym}{domSnapshot.tickSize}</div>
        </div>

        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">Theoretical Micro-Price (VWAP)</div>
          <div className="text-sm font-bold text-white mt-0.5 tabular-nums">
            {currSym}{domSnapshot.microPrice.toFixed(2)}
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">Volume-weighted order mid</div>
        </div>

        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">Order Book Imbalance</div>
          <div className={`text-sm font-bold mt-0.5 tabular-nums ${domSnapshot.imbalancePct >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
            {domSnapshot.imbalancePct >= 0 ? '+' : ''}{domSnapshot.imbalancePct}% {domSnapshot.imbalancePct >= 0 ? 'Bid-Dominant' : 'Ask-Dominant'}
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">Ratio: {(domSnapshot.totalBidQty / Math.max(1, domSnapshot.totalAskQty)).toFixed(2)}x</div>
        </div>

        <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">Total 20-Depth Liquidity</div>
          <div className="text-sm font-bold text-[#2979FF] mt-0.5 tabular-nums">
            {(domSnapshot.totalBidQty + domSnapshot.totalAskQty).toLocaleString()} units
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">
            Bids: {domSnapshot.totalBidQty.toLocaleString()} | Asks: {domSnapshot.totalAskQty.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main DOM Ladder Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* DOM Ladder (Left 2 cols) */}
        <div className="lg:col-span-2 bg-[#0D131A] rounded-xl border border-[#25313D] shadow-md h-[600px] overflow-hidden flex flex-col">
          <OrderBookDOM
            ticker={ticker || ({
              symbol,
              ltp,
              currency: meta.currency,
              bids: domSnapshot.bids.map(b => [b.price, b.quantity]),
              asks: domSnapshot.asks.map(a => [a.price, a.quantity])
            } as any)}
            onQuickFill={() => {}}
          />
        </div>

        {/* DOM Insights & Quick Execution (Right 1 col) */}
        <div className="space-y-4">
          <div className="bg-[#111922] border border-[#25313D] rounded-xl p-4 space-y-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D8AB5E]" />
              <span>Microstructure Liquidity Walls</span>
            </h3>

            <p className="text-xs text-[#8B99A8] leading-relaxed">
              Automated algorithmic wall detection pinpoints large block limit orders clustering across the 20-depth book.
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#35C69A] font-bold">Bid Support Wall</span>
                  <span className="text-white font-bold">{currSym}{domSnapshot.bids[4]?.price.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-[#8B99A8] mt-0.5">
                  Depth Level 5: {domSnapshot.bids[4]?.quantity.toLocaleString()} units ({domSnapshot.bids[4]?.orders} orders)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#EF6468] font-bold">Ask Resistance Wall</span>
                  <span className="text-white font-bold">{currSym}{domSnapshot.asks[4]?.price.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-[#8B99A8] mt-0.5">
                  Depth Level 5: {domSnapshot.asks[4]?.quantity.toLocaleString()} units ({domSnapshot.asks[4]?.orders} orders)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111922] border border-[#25313D] rounded-xl p-4 space-y-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#35C69A]" />
              <span>Order Flow Execution</span>
            </h3>

            <p className="text-xs text-[#8B99A8] leading-relaxed">
              Click any level on the ladder or submit bracket orders directly into the Paper Trading Execution engine.
            </p>

            <div className="pt-2">
              <Link
                href={`/app/paper-trading?symbol=${symbol}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-colors"
              >
                <span>Trade {symbol} on Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketDepthPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Order Book DOM...</div>}>
      <DepthContent />
    </Suspense>
  );
}
