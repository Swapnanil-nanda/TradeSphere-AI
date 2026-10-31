'use client';

import React from 'react';
import { X, Scale, ArrowUpRight, TrendingUp, TrendingDown, LineChart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Ticker } from '../../lib/api-client';

interface WatchlistCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: string[];
  allTickers: Ticker[];
  onRemoveFromCompare: (symbol: string) => void;
}

export default function WatchlistCompareModal({
  isOpen,
  onClose,
  symbols,
  allTickers,
  onRemoveFromCompare
}: WatchlistCompareModalProps) {
  if (!isOpen) return null;

  const compareTickers = symbols
    .map((sym) => allTickers.find((t) => t.symbol === sym))
    .filter((t): t is Ticker => t !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="bg-[#050505] border border-[#141414] rounded-xl max-w-4xl w-full p-6 shadow-2xl text-[#F0F3F6] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#141414]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 flex items-center justify-center text-[#2979FF]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">Instrument Comparison Matrix</h3>
              <p className="text-[11px] text-[#808a9d]">
                Side-by-side microstructure, pricing, and liquidity geometry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#808a9d] hover:text-white hover:bg-[#121212] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {compareTickers.length === 0 ? (
          <div className="p-8 text-center text-[#808a9d] text-xs font-mono">
            No instruments selected. Click the checkbox next to any stock on the watchlist table to compare.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#141414] text-[11px] text-[#808a9d] font-sans">
                  <th className="py-2.5 px-3 bg-[#080808] w-40">Metric</th>
                  {compareTickers.map((t) => (
                    <th key={t.symbol} className="py-2.5 px-3 bg-[#0c0c0c] border-l border-[#141414]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm font-mono">{t.symbol}</span>
                        <button
                          onClick={() => onRemoveFromCompare(t.symbol)}
                          className="text-[#808a9d] hover:text-[#ff333a] p-0.5"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-[#808a9d] block truncate max-w-[160px] font-sans">
                        {t.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {/* Exchange & Market */}
                <tr>
                  <td className="py-2 px-3 text-[#808a9d] bg-[#080808]/50 font-sans">Exchange & Market</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-2 px-3 border-l border-[#141414]">
                      <span className="px-1.5 py-0.5 rounded bg-[#101010] border border-[#1f1f1f] text-[10px] text-white">
                        {t.exchange || (t.market === 'US' ? 'NASDAQ' : 'NSE')} ({t.market})
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Last Traded Price */}
                <tr>
                  <td className="py-2 px-3 text-[#808a9d] bg-[#080808]/50 font-sans">Last Price (LTP)</td>
                  {compareTickers.map((t) => {
                    const ltp = Number(t.ltp ?? 0);
                    return (
                      <td key={t.symbol} className="py-2 px-3 border-l border-[#141414] font-bold text-white text-sm tabular-nums">
                        {t.currency === 'USD' ? '$' : '₹'}{ltp.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>

                {/* Daily Change % */}
                <tr>
                  <td className="py-2 px-3 text-[#808a9d] bg-[#080808]/50 font-sans">Daily Change</td>
                  {compareTickers.map((t) => {
                    const change = Number(t.change ?? 0);
                    const changePct = Number(t.changePct ?? 0);
                    const isUp = changePct >= 0;
                    return (
                      <td key={t.symbol} className="py-2 px-3 border-l border-[#141414] font-bold tabular-nums">
                        <span className={`inline-flex items-center gap-1 ${isUp ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isUp ? '+' : ''}{changePct.toFixed(2)}% ({t.currency === 'USD' ? '$' : '₹'}{change.toFixed(2)})
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Day Range (High / Low) */}
                <tr>
                  <td className="py-2 px-3 text-[#808a9d] bg-[#080808]/50 font-sans">Day Range</td>
                  {compareTickers.map((t) => {
                    const ltp = Number(t.ltp ?? 0);
                    const low = Number(t.dayLow ?? ltp);
                    const high = Number(t.dayHigh ?? ltp);
                    return (
                      <td key={t.symbol} className="py-2 px-3 border-l border-[#141414] text-[#808a9d] tabular-nums">
                        L: {t.currency === 'USD' ? '$' : '₹'}{low.toFixed(2)} — H: {t.currency === 'USD' ? '$' : '₹'}{high.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>

                {/* Volume */}
                <tr>
                  <td className="py-2 px-3 text-[#808a9d] bg-[#080808]/50 font-sans">Trading Volume</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-2 px-3 border-l border-[#141414] text-white tabular-nums">
                      {Number(t.volume ?? 0).toLocaleString()}
                    </td>
                  ))}
                </tr>

                {/* Spread */}
                <tr>
                  <td className="py-2 px-3 text-[#808a9d] bg-[#080808]/50 font-sans">Spread</td>
                  {compareTickers.map((t) => {
                    const ltp = Number(t.ltp ?? 0);
                    const bid = Number(t.bid ?? ltp);
                    const ask = Number(t.ask ?? ltp);
                    const spread = Math.max(0, ask - bid);
                    return (
                      <td key={t.symbol} className="py-2 px-3 border-l border-[#141414] text-[#2979FF] font-bold tabular-nums">
                        {t.currency === 'USD' ? '$' : '₹'}{spread.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>

                {/* Direct Actions */}
                <tr>
                  <td className="py-3 px-3 text-[#808a9d] bg-[#080808]/50 font-sans">Actions</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-3 px-3 border-l border-[#141414] font-sans">
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/app/paper-trading?symbol=${encodeURIComponent(t.symbol)}`}
                          className="px-2.5 py-1 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-[10px] transition-colors"
                        >
                          Trade
                        </Link>
                        <Link
                          href={`/app/charts?symbol=${encodeURIComponent(t.symbol)}`}
                          className="px-2 py-1 rounded bg-[#101010] hover:bg-[#181818] border border-[#1f1f1f] text-[#F0F3F6] font-semibold text-[10px] transition-colors flex items-center gap-1"
                        >
                          <LineChart className="w-3 h-3" />
                          <span>Chart</span>
                        </Link>
                        <Link
                          href={`/app/quant/multi-agent?symbol=${encodeURIComponent(t.symbol)}`}
                          className="px-2 py-1 rounded bg-[#101010] hover:bg-[#181818] border border-[#1f1f1f] text-[#D8AB5E] font-semibold text-[10px] transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Quant</span>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
