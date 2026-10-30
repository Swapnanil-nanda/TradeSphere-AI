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
  const isUp = ticker.changePct >= 0;
  const currencySymbol = ticker.currency === 'USD' ? '$' : '₹';

  return (
    <div
      onClick={() => onSelect && onSelect(ticker.symbol)}
      className="bg-[#0c121f] border border-[#1b253b] hover:border-blue-500/40 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/5 group cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors">
              {ticker.symbol}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              ticker.market === 'IN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {ticker.market === 'IN' ? 'NSE 🇮🇳' : 'US 🇺🇸'}
            </span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            SIMULATED
          </span>
        </div>

        <div className="text-[11px] text-slate-400 truncate mb-3">
          {ticker.name}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-base font-extrabold text-white font-mono">
            {currencySymbol}{ticker.ltp.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold font-mono ${
            isUp ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isUp ? '+' : ''}{ticker.changePct.toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#1b253b]/60 text-[10px] text-slate-500">
          <span>H: {currencySymbol}{ticker.dayHigh.toFixed(1)}</span>
          <span>L: {currencySymbol}{ticker.dayLow.toFixed(1)}</span>
          <Link
            href={`/app/paper-trading?symbol=${ticker.symbol}`}
            className="text-blue-400 hover:text-white font-bold flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Trade</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
