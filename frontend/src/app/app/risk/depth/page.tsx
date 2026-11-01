'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlignVerticalSpaceAround, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import OrderBookDOM from '../../../../components/OrderBookDOM';
import { apiClient, Ticker } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'TATAMOTORS', 'BHARTIARTL', 'ITC', 'LICI', 'WIPRO',
  'NIFTY50', 'BANKNIFTY',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN'
];

function DepthContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [ticker, setTicker] = useState<Ticker | null>(null);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchTicker = async () => {
      try {
        const list = await apiClient.getTickers();
        if (isMounted && Array.isArray(list) && list.length > 0) {
          const found = list.find(t => t.symbol === symbol) || list[0];
          if (found) setTicker(found);
        }
      } catch {}
    };

    fetchTicker();
    // Live tick refresh every 2.5 seconds for active order book ladder simulation
    const interval = setInterval(fetchTicker, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs text-[#F0F3F6]">
      {/* Header */}
      <div className="bg-[#050505] p-4 rounded-xl border border-[#141414] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <AlignVerticalSpaceAround className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white font-sans">Level 2 Depth of Market (DOM Ladder)</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-mono">
                  20-LEVEL TICK STREAM
                </span>
              </div>
              <p className="text-[#808a9d] text-[11px]">
                High-frequency order book ladder with live bid/ask queue geometry and realistic liquidity distribution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ticker && (
              <div className="flex items-center gap-2 bg-[#080808] border border-[#1a1a1a] rounded-lg px-3 py-1.5 font-mono">
                <span className="text-white font-bold">{ticker.symbol}</span>
                <span className="text-slate-400 tabular-nums">
                  {ticker.currency === 'USD' ? '$' : '₹'}{Number(ticker.ltp ?? 0).toFixed(2)}
                </span>
                <span className={`text-[10px] font-bold ${Number(ticker.changePct ?? 0) >= 0 ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                  {Number(ticker.changePct ?? 0) >= 0 ? '+' : ''}{Number(ticker.changePct ?? 0).toFixed(2)}%
                </span>
              </div>
            )}

            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-[#080808] border border-[#1a1a1a] rounded-lg px-3 py-1.5 font-mono font-bold text-white focus:outline-none focus:border-[#2979FF]"
            >
              {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* DOM Ladder View */}
      <div className="max-w-xl mx-auto bg-[#050505] rounded-xl border border-[#141414] shadow-md h-[560px] overflow-hidden">
        <OrderBookDOM ticker={ticker} />
      </div>
    </div>
  );
}

export default function MarketDepthPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#808a9d] font-mono text-xs">Loading Order Book DOM...</div>}>
      <DepthContent />
    </Suspense>
  );
}
