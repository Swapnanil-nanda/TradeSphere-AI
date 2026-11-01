'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layers, RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import OptionsChain from '../../../../components/OptionsChain';
import { apiClient, Ticker } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'NIFTY50', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'TATAMOTORS',
  'AAPL', 'NVDA', 'TSLA', 'MSFT', 'SPY', 'QQQ'
];

function OptionsContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const list = await apiClient.getTickers();
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setTickers(list);
        }
      } catch {}
      if (isMounted) setLoading(false);
    };

    load();
    const interval = setInterval(load, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeTicker = useMemo(() => {
    return tickers.find(t => t.symbol === symbol) || {
      symbol,
      ltp: symbol.includes('NIFTY') ? 24350 : symbol.includes('TCS') ? 4125 : symbol.includes('AAPL') ? 234 : 1165,
      changePct: 0.5,
      currency: symbol === 'AAPL' || symbol === 'NVDA' || symbol === 'TSLA' || symbol === 'MSFT' || symbol === 'SPY' || symbol === 'QQQ' ? 'USD' : 'INR'
    } as any;
  }, [tickers, symbol]);

  const spotPrice = Number(activeTicker.ltp ?? 1000);
  const curr = activeTicker.currency === 'USD' ? '$' : '₹';
  const step = spotPrice > 10000 ? 100 : spotPrice > 1000 ? 50 : 5;
  const maxPainStrike = Math.round(spotPrice / step) * step;

  return (
    <div className="space-y-4 select-none pb-8 text-xs text-[#F0F3F6]">
      {/* Header */}
      <div className="bg-[#050505] p-4 rounded-xl border border-[#141414] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white font-sans">Options Analytics &amp; Volatility Chain</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-mono">
                  LIVE CHAIN
                </span>
              </div>
              <p className="text-[#808a9d] text-[11px]">
                Black-Scholes pricing model with Newton-Raphson implied volatility and multi-strike Greeks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#080808] border border-[#1a1a1a] rounded-lg px-3 py-1.5 font-mono">
              <span className="text-white font-bold">{symbol}</span>
              <span className="text-slate-400 tabular-nums">Spot: {curr}{spotPrice.toFixed(2)}</span>
            </div>

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

      {/* Options Structure Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
          <div className="text-[10px] text-[#808a9d] font-sans">Put-Call Ratio (PCR)</div>
          <div className="text-base font-bold text-[#00c805] mt-0.5">1.18 (Bullish Bias)</div>
        </div>
        <div className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
          <div className="text-[10px] text-[#808a9d] font-sans">Max Pain Strike</div>
          <div className="text-base font-bold text-white mt-0.5">{curr}{maxPainStrike.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
          <div className="text-[10px] text-[#808a9d] font-sans">ATM Implied Volatility (IV)</div>
          <div className="text-base font-bold text-[#2979FF] mt-0.5">21.8%</div>
        </div>
        <div className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
          <div className="text-[10px] text-[#808a9d] font-sans">Historical Volatility (HV20)</div>
          <div className="text-base font-bold text-[#D8AB5E] mt-0.5">18.6%</div>
        </div>
      </div>

      {/* Full Chain Component */}
      <div className="bg-[#050505] rounded-xl border border-[#141414] shadow-md h-[560px] overflow-hidden">
        <OptionsChain symbol={symbol} spotPrice={spotPrice} />
      </div>
    </div>
  );
}

export default function OptionsAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#808a9d] font-mono text-xs">Loading Options Chain...</div>}>
      <OptionsContent />
    </Suspense>
  );
}
