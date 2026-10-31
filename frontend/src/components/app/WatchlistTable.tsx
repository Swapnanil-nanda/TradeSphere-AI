'use client';

import React from 'react';
import { Trash2, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Ticker } from '../../lib/api-client';

interface WatchlistTableProps {
  tickers: Ticker[];
  onRemoveSymbol?: (symbol: string) => void;
  onSelectSymbol?: (symbol: string) => void;
  activeSymbol?: string;
}

export default function WatchlistTable({
  tickers,
  onRemoveSymbol,
  onSelectSymbol,
  activeSymbol
}: WatchlistTableProps) {
  if (tickers.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No symbols in this watchlist. Search and add symbols using the search bar above.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl overflow-hidden shadow-2xs select-none transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-[#1b253b] text-[11px] text-slate-500 font-sans">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Symbol</th>
              <th className="py-2.5 px-3 font-semibold">LTP</th>
              <th className="py-2.5 px-3 font-semibold">Change %</th>
              <th className="py-2.5 px-3 font-semibold">Day Range</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
            {tickers.map((t) => {
              const isUp = t.changePct >= 0;
              const currency = t.currency === 'USD' ? '$' : '₹';
              const isSelected = t.symbol === activeSymbol;

              return (
                <tr
                  key={t.symbol}
                  onClick={() => onSelectSymbol && onSelectSymbol(t.symbol)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-600/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{t.symbol}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{t.name}</div>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white text-xs">
                    {currency}{t.ltp.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUp ? '+' : ''}{t.changePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[10px]">
                    {currency}{t.dayLow.toFixed(1)} - {currency}{t.dayHigh.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/app/paper-trading?symbol=${t.symbol}`}
                        className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px] transition-colors"
                      >
                        Trade
                      </Link>
                      {onRemoveSymbol && (
                        <button
                          onClick={() => onRemoveSymbol(t.symbol)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
