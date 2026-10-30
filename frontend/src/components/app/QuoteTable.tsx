'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Ticker } from '../../lib/api-client';

interface QuoteTableProps {
  tickers: Ticker[];
  onSelectSymbol?: (symbol: string) => void;
  flashes?: Record<string, 'up' | 'down'>;
}

export default function QuoteTable({
  tickers,
  onSelectSymbol,
  flashes = {}
}: QuoteTableProps) {
  return (
    <div className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl overflow-hidden shadow-2xs select-none transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-[#1b253b] text-[11px] text-slate-500 font-sans">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Symbol</th>
              <th className="py-2.5 px-3 font-semibold">Market</th>
              <th className="py-2.5 px-3 font-semibold">LTP</th>
              <th className="py-2.5 px-3 font-semibold">Change</th>
              <th className="py-2.5 px-3 font-semibold">Change %</th>
              <th className="py-2.5 px-3 font-semibold">Bid / Ask</th>
              <th className="py-2.5 px-3 font-semibold">Simulated Vol</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
            {tickers.map((t) => {
              const isUp = t.changePct >= 0;
              const currency = t.currency === 'USD' ? '$' : '₹';
              const flash = flashes[t.symbol];

              return (
                <tr
                  key={t.symbol}
                  onClick={() => onSelectSymbol && onSelectSymbol(t.symbol)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    flash === 'up' ? 'bg-emerald-50 dark:bg-emerald-500/10' : flash === 'down' ? 'bg-rose-50 dark:bg-rose-500/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white text-xs hover:text-blue-600 transition-colors">
                      {t.symbol}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{t.name}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      t.market === 'IN' ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                    }`}>
                      {t.market === 'IN' ? 'NSE 🇮🇳' : 'US 🇺🇸'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white text-xs">
                    {currency}{t.ltp.toFixed(2)}
                  </td>
                  <td className={`py-2.5 px-3 font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isUp ? '+' : ''}{t.change.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                      isUp ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUp ? '+' : ''}{t.changePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[10px]">
                    <span className="text-emerald-700 dark:text-emerald-400">{currency}{t.bid.toFixed(2)}</span>
                    <span className="mx-1 text-slate-400">/</span>
                    <span className="text-rose-700 dark:text-rose-400">{currency}{t.ask.toFixed(2)}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {t.volume.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/terminal`}
                        className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px] transition-colors flex items-center gap-0.5"
                      >
                        <span>Trade</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
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
