'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Ticker } from '../../lib/api-client';

interface StockCardProps {
  ticker: Ticker;
  onSelect?: (symbol: string) => void;
}

export default function StockCard({ ticker, onSelect }: StockCardProps) {
  if (!ticker) return null;

  const isUp = Number(ticker.changePct ?? 0) >= 0;
  const currencySymbol = ticker.currency === 'USD' ? '$' : '₹';
  const ltpVal = Number(ticker.ltp ?? 0);
  const changePctVal = Number(ticker.changePct ?? 0);
  const dayHighVal = Number(ticker.dayHigh ?? ltpVal);
  const dayLowVal = Number(ticker.dayLow ?? ltpVal);
  const isLive = ticker.isLive ?? !ticker.isSimulated;

  return (
    <div
      onClick={() => onSelect && onSelect(ticker.symbol)}
      className="bg-[#050505] border border-[#141414] hover:border-[#2979FF]/50 rounded-lg p-3.5 transition-all duration-150 group cursor-pointer flex flex-col justify-between select-none text-[#F0F3F6]"
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-white group-hover:text-[#2979FF] transition-colors font-mono">
              {ticker.symbol}
            </span>
            <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-[#101010] text-[#808a9d] border border-[#1f1f1f] font-mono">
              {ticker.exchange || (ticker.market === 'IN' ? 'NSE' : 'NASDAQ')}
            </span>
          </div>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
            isLive
              ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
              : 'bg-[#2979ff]/10 text-[#2979ff] border border-[#2979ff]/30'
          }`}>
            {isLive ? 'LIVE' : 'SIMULATED'}
          </span>
        </div>

        <div className="text-[11px] text-[#808a9d] truncate mb-2">
          {ticker.name || `${ticker.symbol} Equity`}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="text-base font-bold text-white font-mono tabular-nums">
            {currencySymbol}{ltpVal.toFixed(2)}
          </div>
          <div className={`flex items-center gap-0.5 text-xs font-semibold font-mono tabular-nums ${
            isUp ? 'text-[#00c805]' : 'text-[#ff333a]'
          }`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isUp ? '+' : ''}{changePctVal.toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#141414] text-[10px] text-[#808a9d] font-mono">
          <span>H: {currencySymbol}{dayHighVal.toFixed(1)}</span>
          <span>L: {currencySymbol}{dayLowVal.toFixed(1)}</span>
          <Link
            href={`/app/paper-trading?symbol=${encodeURIComponent(ticker.symbol)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[#2979FF] hover:underline flex items-center gap-0.5 font-sans font-semibold"
          >
            <span>Trade</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
