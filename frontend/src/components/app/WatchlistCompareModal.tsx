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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#0D131A] border border-[#25313D] rounded-2xl max-w-4xl w-full p-6 shadow-2xl text-[#E7EDF3] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 flex items-center justify-center text-[#2979FF]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instrument Comparison Matrix</h3>
              <p className="text-[11px] text-[#8B99A8]">
                Side-by-side microstructure, pricing, and liquidity geometry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {compareTickers.length === 0 ? (
          <div className="p-8 text-center text-[#8B99A8] text-xs font-mono">
            No instruments selected. Click the checkbox next to any stock on the watchlist table to compare.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#25313D] text-[11px] text-[#8B99A8] font-sans">
                  <th className="py-2.5 px-3 bg-[#111922] w-40">Metric</th>
                  {compareTickers.map((t) => (
                    <th key={t.symbol} className="py-2.5 px-3 bg-[#151F29] border-l border-[#25313D]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm font-mono">{t.symbol}</span>
                        <button
                          onClick={() => onRemoveFromCompare(t.symbol)}
                          className="text-[#8B99A8] hover:text-[#EF6468] p-0.5"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-[#8B99A8] block truncate max-w-[160px] font-sans">
                        {t.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25313D]/40">
                {/* Exchange & Market */}
                <tr>
                  <td className="py-2 px-3 text-[#8B99A8] bg-[#111922]/50 font-sans">Exchange & Market</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-2 px-3 border-l border-[#25313D]">
                      <span className="px-1.5 py-0.5 rounded bg-[#111922] border border-[#25313D] text-[10px] text-[#E7EDF3]">
                        {t.exchange || (t.market === 'US' ? 'NASDAQ' : 'NSE')} ({t.market})
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Last Traded Price */}
                <tr>
                  <td className="py-2 px-3 text-[#8B99A8] bg-[#111922]/50 font-sans">Last Price (LTP)</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-2 px-3 border-l border-[#25313D] font-bold text-white text-sm">
                      {t.currency === 'USD' ? '$' : '₹'}{(t.ltp ?? 0).toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Daily Change % */}
                <tr>
                  <td className="py-2 px-3 text-[#8B99A8] bg-[#111922]/50 font-sans">Daily Change</td>
                  {compareTickers.map((t) => {
                    const isUp = (t.changePct ?? 0) >= 0;
                    return (
                      <td key={t.symbol} className="py-2 px-3 border-l border-[#25313D] font-bold">
                        <span className={`inline-flex items-center gap-1 ${isUp ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isUp ? '+' : ''}{(t.changePct ?? 0).toFixed(2)}% ({t.currency === 'USD' ? '$' : '₹'}{(t.change ?? 0).toFixed(2)})
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Day Range (High / Low) */}
                <tr>
                  <td className="py-2 px-3 text-[#8B99A8] bg-[#111922]/50 font-sans">Day Range</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-2 px-3 border-l border-[#25313D] text-[#8B99A8]">
                      L: {t.currency === 'USD' ? '$' : '₹'}{(t.dayLow ?? t.ltp ?? 0).toFixed(2)} — H: {t.currency === 'USD' ? '$' : '₹'}{(t.dayHigh ?? t.ltp ?? 0).toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Volume */}
                <tr>
                  <td className="py-2 px-3 text-[#8B99A8] bg-[#111922]/50 font-sans">Trading Volume</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-2 px-3 border-l border-[#25313D] text-[#E7EDF3]">
                      {(t.volume ?? 0).toLocaleString()}
                    </td>
                  ))}
                </tr>

                {/* Spread */}
                <tr>
                  <td className="py-2 px-3 text-[#8B99A8] bg-[#111922]/50 font-sans">Microstructure Spread</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-2 px-3 border-l border-[#25313D] text-[#2979FF] font-bold">
                      {t.currency === 'USD' ? '$' : '₹'}{Math.max(0, (t.ask ?? t.ltp ?? 0) - (t.bid ?? t.ltp ?? 0)).toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Direct Actions */}
                <tr>
                  <td className="py-3 px-3 text-[#8B99A8] bg-[#111922]/50 font-sans">Actions</td>
                  {compareTickers.map((t) => (
                    <td key={t.symbol} className="py-3 px-3 border-l border-[#25313D] font-sans">
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/app/paper-trading?symbol=${encodeURIComponent(t.symbol)}`}
                          className="px-2.5 py-1 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-bold text-[10px] transition-colors"
                        >
                          Trade
                        </Link>
                        <Link
                          href={`/app/charts?symbol=${encodeURIComponent(t.symbol)}`}
                          className="px-2 py-1 rounded bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#E7EDF3] font-semibold text-[10px] transition-colors flex items-center gap-1"
                        >
                          <LineChart className="w-3 h-3" />
                          <span>Chart</span>
                        </Link>
                        <Link
                          href={`/app/quant/multi-agent?symbol=${encodeURIComponent(t.symbol)}`}
                          className="px-2 py-1 rounded bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#D8AB5E] font-semibold text-[10px] transition-colors flex items-center gap-1"
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
