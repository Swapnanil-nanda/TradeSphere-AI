'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe } from 'lucide-react';
import { useMarketStore } from '../../lib/market-store';

export default function TopMarketTicker() {
  const tickers = useMarketStore(state => state.tickers);
  const quotes = useMarketStore(state => state.quotes);
  const isLiveConnected = useMarketStore(state => state.isLiveConnected);
  const initializePolling = useMarketStore(state => state.initializePolling);

  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  // Initialize centralized store polling once (zero independent component timers)
  useEffect(() => {
    const cleanup = initializePolling();
    return cleanup;
  }, [initializePolling]);

  // Flash price changes when centralized store updates
  useEffect(() => {
    const newFlashes: Record<string, 'up' | 'down'> = {};
    tickers.forEach(item => {
      const oldPrice = prevPricesRef.current[item.symbol];
      if (oldPrice !== undefined && oldPrice !== item.ltp) {
        newFlashes[item.symbol] = item.ltp > oldPrice ? 'up' : 'down';
      }
      prevPricesRef.current[item.symbol] = item.ltp;
    });

    if (Object.keys(newFlashes).length > 0) {
      setFlashes(newFlashes);
      const timer = setTimeout(() => setFlashes({}), 1200);
      return () => clearTimeout(timer);
    }
  }, [tickers]);

  return (
    <div className="h-7 bg-[#000000] border-b border-[#141414] px-3 flex items-center overflow-hidden text-[11px] font-mono select-none">
      {/* Market Data Provenance Tag (Clear Provenance) */}
      <div
        className="flex items-center gap-1.5 pr-2.5 mr-2 border-r border-[#1a1a1a] text-[#808a9d] shrink-0 font-sans"
        title="Market feed generated 24/7 by Geometric Brownian Motion (GBM) with volatility clustering"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2979ff] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2979ff]"></span>
        </span>
        <span className="font-bold text-[#2979ff] tracking-wider text-[10px] font-mono">
          SIMULATED • GBM Market Feed
        </span>
        <span className="text-[9px] text-[#808a9d] font-mono hidden sm:inline">
          • 24/7 FEED
        </span>
      </div>

      {/* Synchronized Marquee Stream from useMarketStore */}
      <div className="flex items-center gap-5 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap">
        {tickers.slice(0, 14).map((item) => {
          // Read directly from centralized store selector
          const ltp = quotes[item.symbol]?.ltp ?? item.ltp;
          const change = quotes[item.symbol]?.change ?? item.change;
          const changePct = quotes[item.symbol]?.changePct ?? item.changePct;
          const isUp = change >= 0;
          const flash = flashes[item.symbol];

          return (
            <div
              key={item.symbol}
              className={`flex items-center gap-1.5 transition-colors duration-300 px-1.5 py-0.5 rounded ${
                flash === 'up'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : flash === 'down'
                  ? 'bg-rose-500/20 text-rose-400'
                  : ''
              }`}
            >
              <span className="font-bold text-[#f0f3f6]">{item.symbol}</span>
              <span className="text-[#808a9d]">
                {item.currency === 'USD' ? '$' : '₹'}
                {ltp.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
              <span
                className={`flex items-center text-[10px] font-semibold ${
                  isUp ? 'text-[#35c69a]' : 'text-[#ef6468]'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />
                )}
                {isUp ? '+' : ''}
                {changePct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Sync Status Badge */}
      <div className="hidden lg:flex items-center gap-2 pl-3 ml-auto border-l border-[#1a1a1a] text-[10px] text-[#808a9d] shrink-0 font-sans">
        <Activity className="w-3 h-3 text-[#35c69a]" />
        <span className="font-mono text-[#35c69a]">SYNC LOCKED</span>
      </div>
    </div>
  );
}
