'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { appConfig } from '../../lib/config';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  currency: string;
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', price: 24350.25, change: 112.40, changePct: 0.46, currency: 'INR' },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank', price: 51240.10, change: 164.80, changePct: 0.32, currency: 'INR' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2985.40, change: 24.30, changePct: 0.82, currency: 'INR' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.50, change: -10.20, changePct: -0.25, currency: 'INR' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1845.00, change: 21.00, changePct: 1.15, currency: 'INR' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1680.75, change: 3.10, changePct: 0.18, currency: 'INR' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 232.50, change: 1.50, changePct: 0.65, currency: 'USD' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 141.20, change: 2.90, changePct: 2.10, currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 265.40, change: -3.20, changePct: -1.20, currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 428.15, change: 1.85, changePct: 0.43, currency: 'USD' },
];

export default function TopMarketTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        ws = new WebSocket(appConfig.marketWsUrl);
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'tick' || msg.type === 'TICK') {
              const tick = msg.data || msg;
              if (tick && tick.symbol) {
                setTickers(prev => prev.map(t => {
                  if (t.symbol === tick.symbol) {
                    return {
                      ...t,
                      price: tick.ltp || t.price,
                      change: tick.change !== undefined ? tick.change : t.change,
                      changePct: tick.changePct !== undefined ? tick.changePct : t.changePct,
                    };
                  }
                  return t;
                }));
              }
            }
          } catch {
            // ignore non-json messages
          }
        };
        ws.onerror = () => ws?.close();
        ws.onclose = () => {
          reconnectTimer = setTimeout(connect, 4000);
        };
      } catch {
        reconnectTimer = setTimeout(connect, 4000);
      }
    };

    connect();

    // Gentle micro-simulation update fallback if WebSocket is offline
    const fallbackTimer = setInterval(() => {
      setTickers(prev => prev.map(t => {
        const drift = (Math.random() - 0.49) * 0.001;
        const newPrice = Number((t.price * (1 + drift)).toFixed(2));
        const newChange = Number((t.change + (newPrice - t.price)).toFixed(2));
        const newChangePct = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        return {
          ...t,
          price: newPrice,
          change: newChange,
          changePct: newChangePct
        };
      }));
    }, 2500);

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(fallbackTimer);
    };
  }, []);

  return (
    <div className="h-7 bg-[#0D131A] border-b border-[#25313D] px-3 flex items-center overflow-hidden text-[11px] font-mono select-none">
      <div className="flex items-center gap-1.5 pr-3 mr-2 border-r border-[#25313D] text-[#8B99A8] shrink-0 font-sans">
        <Activity className="w-3 h-3 text-[#35C69A] animate-pulse" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B99A8]">MARKETS</span>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 text-[#E7EDF3]">
        {tickers.map((t) => {
          const isUp = t.change >= 0;
          return (
            <div key={t.symbol} className="flex items-center gap-1.5 shrink-0 hover:bg-[#151F29] px-1.5 py-0.5 rounded transition-colors cursor-pointer">
              <span className="font-semibold text-[11px] text-[#E7EDF3]">{t.symbol}</span>
              <span className="text-[11px] text-[#E7EDF3] num-tabular">
                {t.currency === 'INR' ? '₹' : '$'}{t.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] flex items-center gap-0.5 font-medium num-tabular ${isUp ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {isUp ? '+' : ''}{t.changePct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="pl-3 ml-2 border-l border-[#25313D] text-[10px] text-[#8B99A8] shrink-0 flex items-center gap-1.5 font-sans">
        <span className="w-1.5 h-1.5 rounded-full bg-[#35C69A]" />
        <span className="hidden lg:inline text-[#8B99A8]">SIMULATED FEED</span>
      </div>
    </div>
  );
}
