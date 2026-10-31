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
  const isUp = (ticker.changePct ?? 0) >= 0;
  const currencySymbol = ticker.currency === 'USD' ? '$' : '₹';

  return (
    <div
      onClick={() => onSelect && onSelect(ticker.symbol)}
      className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] hover:border-blue-500/50 rounded-xl p-3.5 transition-all duration-150 group cursor-pointer flex flex-col justify-between shadow-2xs select-none"
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {ticker.symbol}
            </span>
            <span className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
              ticker.market === 'IN' ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
            }`}>
              {ticker.market === 'IN' ? 'NSE 🇮🇳' : 'US 🇺🇸'}
            </span>
          </div>
          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            SIMULATED
          </span>
        </div>

        <div className="text-[10px] text-slate-400 truncate mb-2">
          {ticker.name}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {currencySymbol}{(ticker.ltp ?? 0).toFixed(2)}
          </div>
          <div className={`flex items-center gap-0.5 text-[11px] font-semibold font-mono tabular-nums ${
            isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isUp ? '+' : ''}{(ticker.changePct ?? 0).toFixed(2)}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
          <span>H: {currencySymbol}{(ticker.dayHigh ?? ticker.ltp ?? 0).toFixed(1)}</span>
          <span>L: {currencySymbol}{(ticker.dayLow ?? ticker.ltp ?? 0).toFixed(1)}</span>
          <Link
            href={`/app/paper-trading?symbol=${encodeURIComponent(ticker.symbol)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 font-sans font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Trade</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
