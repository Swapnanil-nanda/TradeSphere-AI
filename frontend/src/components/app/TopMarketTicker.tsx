'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe } from 'lucide-react';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  currency: string;
  isLive?: boolean;
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', price: 23053.10, change: 116.30, changePct: 0.51, currency: 'INR', isLive: true },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: 74459.53, change: 308.53, changePct: 0.42, currency: 'INR', isLive: true },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank', price: 49820.40, change: 184.20, changePct: 0.37, currency: 'INR', isLive: true },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 1164.90, change: -2.50, changePct: -0.21, currency: 'INR', isLive: true },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 2502.60, change: 24.60, changePct: 0.99, currency: 'INR', isLive: true },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 692.80, change: 9.50, changePct: 1.39, currency: 'INR', isLive: true },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1185.00, change: 38.50, changePct: 3.36, currency: 'INR', isLive: true },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 344.63, change: -4.28, changePct: -1.23, currency: 'USD', isLive: true },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 204.64, change: -9.02, changePct: -4.22, currency: 'USD', isLive: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 399.81, change: -3.49, changePct: -0.87, currency: 'USD', isLive: true }
];

export default function TopMarketTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Poll real live market quotes from Next.js server proxy
  useEffect(() => {
    let isMounted = true;

    const fetchLive = async () => {
      try {
        const res = await fetch('/api/market/live-quotes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setIsLiveConnected(true);
            setTickers((prev) => {
              const newFlashes: Record<string, 'up' | 'down'> = {};
              data.forEach((item: any) => {
                const old = prev.find((p) => p.symbol === item.symbol || p.symbol === item.name);
                if (old && old.price !== item.ltp) {
                  newFlashes[item.symbol] = item.ltp > old.price ? 'up' : 'down';
                }
              });
              if (Object.keys(newFlashes).length > 0) {
                setFlashes(newFlashes);
                setTimeout(() => setFlashes({}), 1200);
              }

              return data.slice(0, 12).map((item: any) => ({
                symbol: item.symbol === 'NIFTY50' ? 'NIFTY 50' : item.symbol,
                name: item.name,
                price: Number(item.ltp ?? 100),
                change: Number(item.change ?? 0),
                changePct: Number(item.changePct ?? 0),
                currency: item.currency ?? 'INR',
                isLive: true
              }));
            });
          }
        }
      } catch {
        if (isMounted) setIsLiveConnected(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-7 bg-[#000000] border-b border-[#141414] px-3 flex items-center overflow-hidden text-[11px] font-mono select-none">
      {/* Live Feed Status Tag */}
      <div className="flex items-center gap-1.5 pr-2.5 mr-2 border-r border-[#1a1a1a] text-[#808a9d] shrink-0 font-sans">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLiveConnected ? 'bg-[#00c805]' : 'bg-[#2979ff]'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? 'bg-[#00c805]' : 'bg-[#2979ff]'}`}></span>
        </span>
        <span className="font-semibold text-white tracking-wider text-[10px]">
          {isLiveConnected ? 'LIVE FEED' : 'SIMULATED'}
        </span>
      </div>

      {/* Ticker Streamer */}
      <div className="flex items-center gap-5 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
        {tickers.map((t) => {
          const isUp = t.change >= 0;
          const currency = t.currency === 'USD' ? '$' : '₹';
          const flash = flashes[t.symbol];

          return (
            <div
              key={t.symbol}
              className={`flex items-center gap-1.5 px-1 py-0.5 rounded transition-colors duration-300 ${
                flash === 'up'
                  ? 'bg-emerald-950/80 text-[#00c805]'
                  : flash === 'down'
                  ? 'bg-rose-950/80 text-[#ff333a]'
                  : ''
              }`}
            >
              <span className="font-bold text-white text-[11px] tracking-tight">{t.symbol}</span>
              <span className="text-slate-200 tabular-nums">
                {currency}{Number(t.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center text-[10px] tabular-nums font-semibold ${isUp ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                {isUp ? '+' : ''}{Number(t.change ?? 0).toFixed(2)} ({isUp ? '+' : ''}{Number(t.changePct ?? 0).toFixed(2)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
