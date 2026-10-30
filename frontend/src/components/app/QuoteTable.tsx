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
    <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl overflow-hidden shadow-xl select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090d16] border-b border-[#1b253b] text-[11px] text-slate-400 uppercase font-sans">
            <tr>
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4">Market</th>
              <th className="py-3 px-4">LTP</th>
              <th className="py-3 px-4">Change</th>
              <th className="py-3 px-4">Change %</th>
              <th className="py-3 px-4">Bid / Ask</th>
              <th className="py-3 px-4">Simulated Vol</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1b253b]/40">
            {tickers.map((t) => {
              const isUp = t.changePct >= 0;
              const currency = t.currency === 'USD' ? '$' : '₹';
              const flash = flashes[t.symbol];

              return (
                <tr
                  key={t.symbol}
                  onClick={() => onSelectSymbol && onSelectSymbol(t.symbol)}
                  className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    flash === 'up' ? 'bg-emerald-500/10' : flash === 'down' ? 'bg-rose-500/10' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-sans">
                    <div className="font-extrabold text-white text-sm hover:text-blue-400 transition-colors">
                      {t.symbol}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{t.name}</div>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.market === 'IN' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {t.market === 'IN' ? 'NSE 🇮🇳' : 'US 🇺🇸'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white text-sm">
                    {currency}{t.ltp.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '+' : ''}{t.change.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                      isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUp ? '+' : ''}{t.changePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    <span className="text-emerald-400">{currency}{t.bid.toFixed(2)}</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span className="text-rose-400">{currency}{t.ask.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {t.volume.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/app/charts?symbol=${t.symbol}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all"
                      >
                        Chart
                      </Link>
                      <Link
                        href={`/app/paper-trading?symbol=${t.symbol}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] transition-all flex items-center gap-0.5"
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
