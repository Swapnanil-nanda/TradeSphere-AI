'use client';

import React from 'react';
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Bell,
  LineChart,
  ArrowUpDown,
  CheckSquare,
  Square
} from 'lucide-react';
import Link from 'next/link';
import { Ticker } from '../../lib/api-client';

export type SortField = 'symbol' | 'ltp' | 'changePct' | 'volume';
export type SortDirection = 'asc' | 'desc';

interface WatchlistTableProps {
  tickers: Ticker[];
  onRemoveSymbol?: (symbol: string) => void;
  onSelectSymbol?: (symbol: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  activeSymbol?: string;
  selectedForCompare?: string[];
  onToggleCompare?: (symbol: string) => void;
  onOpenAlertModal?: (symbol: string) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

// Mini SVG Sparkline generator
function MiniSparkline({ changePct, isUp }: { changePct: number; isUp: boolean }) {
  const points = isUp
    ? [14, 13, 11, 12, 8, 5, 2]
    : [2, 4, 7, 6, 9, 12, 14];

  const strokeColor = isUp ? '#00c805' : '#ff333a';
  const polylineCoords = points
    .map((y, i) => `${i * 7 + 2},${y}`)
    .join(' ');

  return (
    <svg className="w-14 h-4 overflow-visible shrink-0" viewBox="0 0 46 16">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylineCoords}
      />
    </svg>
  );
}

export default function WatchlistTable({
  tickers,
  onRemoveSymbol,
  onSelectSymbol,
  onMoveUp,
  onMoveDown,
  activeSymbol,
  selectedForCompare = [],
  onToggleCompare,
  onOpenAlertModal,
  sortField,
  sortDirection,
  onSort
}: WatchlistTableProps) {
  if (!tickers || tickers.length === 0) {
    return (
      <div className="p-8 text-center text-[#808a9d] text-xs bg-[#050505] border border-[#141414] rounded-lg font-mono">
        No instruments matching the current criteria. Search and add symbols using the command bar above.
      </div>
    );
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#808a9d]/50 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-[#2979FF] ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#2979FF] ml-1 inline" />
    );
  };

  return (
    <div className="bg-[#050505] border border-[#141414] rounded-lg overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#080808] border-b border-[#141414] text-[11px] text-[#808a9d] font-sans">
            <tr>
              <th className="py-2.5 px-3 w-8 text-center">
                <span className="sr-only">Compare</span>
              </th>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort && onSort('symbol')}
              >
                <span>Instrument</span>
                {renderSortIndicator('symbol')}
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort && onSort('ltp')}
              >
                <span>LTP</span>
                {renderSortIndicator('ltp')}
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort && onSort('changePct')}
              >
                <span>Change %</span>
                {renderSortIndicator('changePct')}
              </th>
              <th className="py-2.5 px-3 text-center hidden md:table-cell">Trend (7T)</th>
              <th
                className="py-2.5 px-3 font-semibold text-right hidden sm:table-cell cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort && onSort('volume')}
              >
                <span>Volume</span>
                {renderSortIndicator('volume')}
              </th>
              <th className="py-2.5 px-3 text-right hidden lg:table-cell">Day Range</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {tickers.map((t, idx) => {
              if (!t) return null;
              const ltpVal = Number(t.ltp ?? 0);
              const changePctVal = Number(t.changePct ?? 0);
              const changeVal = Number(t.change ?? 0);
              const volumeVal = Number(t.volume ?? 0);
              const dayLowVal = Number(t.dayLow ?? ltpVal);
              const dayHighVal = Number(t.dayHigh ?? ltpVal);

              const isUp = changePctVal >= 0;
              const currency = t.currency === 'USD' ? '$' : '₹';
              const isSelected = t.symbol === activeSymbol;
              const isCompared = selectedForCompare.includes(t.symbol);
              const isLive = t.isLive ?? !t.isSimulated;

              return (
                <tr
                  key={t.symbol}
                  onClick={() => onSelectSymbol && onSelectSymbol(t.symbol)}
                  className={`hover:bg-[#0c0c0c] transition-colors cursor-pointer group ${
                    isSelected ? 'bg-[#2979FF]/10 border-l-2 border-[#2979FF]' : ''
                  }`}
                >
                  {/* Compare Selection Checkbox */}
                  <td className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleCompare && onToggleCompare(t.symbol)}
                      className="text-[#808a9d] hover:text-[#2979FF] transition-colors"
                      title="Select to compare (up to 3)"
                    >
                      {isCompared ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#2979FF]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#808a9d]/40" />
                      )}
                    </button>
                  </td>

                  {/* Order Controls */}
                  <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center justify-center -space-y-1">
                      <button
                        onClick={() => onMoveUp && onMoveUp(idx)}
                        disabled={idx === 0}
                        className="text-[#808a9d]/40 hover:text-white disabled:opacity-10 transition-colors p-0.5"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMoveDown && onMoveDown(idx)}
                        disabled={idx === tickers.length - 1}
                        className="text-[#808a9d]/40 hover:text-white disabled:opacity-10 transition-colors p-0.5"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Instrument Symbol & Exchange */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs font-mono">{t.symbol}</span>
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-[#101010] border border-[#1f1f1f] text-[#808a9d]">
                        {t.exchange || (t.market === 'US' ? 'NASDAQ' : 'NSE')}
                      </span>
                      <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                        isLive
                          ? 'bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30'
                          : 'bg-[#2979ff]/10 text-[#2979ff] border border-[#2979ff]/30'
                      }`}>
                        {isLive ? 'LIVE' : 'SIM'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#808a9d] truncate max-w-[140px] font-sans">
                      {t.name || `${t.symbol} Equity`}
                    </div>
                  </td>

                  {/* Last Traded Price */}
                  <td className="py-2.5 px-3 text-right font-bold text-white text-xs font-mono tabular-nums">
                    {currency}{ltpVal.toFixed(2)}
                  </td>

                  {/* Change % and Absolute Change */}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <div className={`inline-flex items-center justify-end gap-1 font-semibold text-[11px] ${
                      isUp ? 'text-[#00c805]' : 'text-[#ff333a]'
                    }`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isUp ? '+' : ''}{changePctVal.toFixed(2)}%</span>
                    </div>
                    <div className="text-[9px] text-[#808a9d] font-sans">
                      {isUp ? '+' : ''}{currency}{changeVal.toFixed(2)}
                    </div>
                  </td>

                  {/* Mini Sparkline */}
                  <td className="py-2.5 px-3 text-center hidden md:table-cell">
                    <div className="flex justify-center">
                      <MiniSparkline changePct={changePctVal} isUp={isUp} />
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="py-2.5 px-3 text-right text-[#808a9d] text-[10px] hidden sm:table-cell tabular-nums">
                    {volumeVal >= 1000000
                      ? `${(volumeVal / 1000000).toFixed(2)}M`
                      : `${(volumeVal / 1000).toFixed(0)}K`}
                  </td>

                  {/* Day High / Low */}
                  <td className="py-2.5 px-3 text-right text-[#808a9d] text-[10px] hidden lg:table-cell tabular-nums">
                    <span>{currency}{dayLowVal.toFixed(1)}</span>
                    <span className="mx-1 text-[#808a9d]/40">-</span>
                    <span>{currency}{dayHighVal.toFixed(1)}</span>
                  </td>

                  {/* Quick Action Navigation Buttons */}
                  <td className="py-2.5 px-3 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {/* Trade Button */}
                      <Link
                        href={`/app/paper-trading?symbol=${encodeURIComponent(t.symbol)}`}
                        className="px-2 py-0.5 rounded bg-[#2979FF]/15 hover:bg-[#2979FF]/30 text-[#2979FF] border border-[#2979FF]/30 font-semibold text-[10px] transition-colors"
                        title="Place Paper Order"
                      >
                        Trade
                      </Link>

                      {/* Chart Button */}
                      <Link
                        href={`/app/charts?symbol=${encodeURIComponent(t.symbol)}`}
                        className="p-1 rounded text-[#808a9d] hover:text-white hover:bg-[#121212] transition-colors"
                        title="Interactive Chart"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </Link>

                      {/* Alert Button */}
                      <button
                        onClick={() => onOpenAlertModal && onOpenAlertModal(t.symbol)}
                        className="p-1 rounded text-[#808a9d] hover:text-[#D8AB5E] hover:bg-[#121212] transition-colors"
                        title="Set Price/Volume Alert"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      {onRemoveSymbol && (
                        <button
                          onClick={() => onRemoveSymbol(t.symbol)}
                          className="p-1 rounded text-[#808a9d] hover:text-[#ff333a] hover:bg-[#121212] transition-colors"
                          title="Remove from Watchlist"
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
