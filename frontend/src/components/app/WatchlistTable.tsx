'use client';

import React from 'react';
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
  BarChart2,
  Bell,
  LineChart,
  FileSearch,
  Sparkles,
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
  // Deterministic 7-point curve based on changePct
  const points = isUp
    ? [14, 13, 11, 12, 8, 5, 2]
    : [2, 4, 7, 6, 9, 12, 14];

  const strokeColor = isUp ? '#35C69A' : '#EF6468';
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
  if (tickers.length === 0) {
    return (
      <div className="p-8 text-center text-[#8B99A8] text-xs bg-[#0D131A] border border-[#25313D] rounded-xl font-mono">
        No instruments matching the current criteria. Search and add symbols using the command bar above.
      </div>
    );
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-[#8B99A8]/50 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-[#2979FF] ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#2979FF] ml-1 inline" />
    );
  };

  return (
    <div className="bg-[#0D131A] border border-[#25313D] rounded-xl overflow-hidden shadow-2xs select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#111922] border-b border-[#25313D] text-[11px] text-[#8B99A8] font-sans">
            <tr>
              <th className="py-2.5 px-3 w-8 text-center">
                <span className="sr-only">Compare</span>
              </th>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#E7EDF3] transition-colors"
                onClick={() => onSort && onSort('symbol')}
              >
                <span>Instrument</span>
                {renderSortIndicator('symbol')}
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-[#E7EDF3] transition-colors"
                onClick={() => onSort && onSort('ltp')}
              >
                <span>LTP</span>
                {renderSortIndicator('ltp')}
              </th>
              <th
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-[#E7EDF3] transition-colors"
                onClick={() => onSort && onSort('changePct')}
              >
                <span>Change %</span>
                {renderSortIndicator('changePct')}
              </th>
              <th className="py-2.5 px-3 text-center hidden md:table-cell">Trend (7T)</th>
              <th
                className="py-2.5 px-3 font-semibold text-right hidden sm:table-cell cursor-pointer hover:text-[#E7EDF3] transition-colors"
                onClick={() => onSort && onSort('volume')}
              >
                <span>Volume</span>
                {renderSortIndicator('volume')}
              </th>
              <th className="py-2.5 px-3 text-right hidden lg:table-cell">Day Range</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#25313D]/40">
            {tickers.map((t, idx) => {
              const isUp = (t.changePct ?? 0) >= 0;
              const currency = t.currency === 'USD' ? '$' : '₹';
              const isSelected = t.symbol === activeSymbol;
              const isCompared = selectedForCompare.includes(t.symbol);

              return (
                <tr
                  key={t.symbol}
                  onClick={() => onSelectSymbol && onSelectSymbol(t.symbol)}
                  className={`hover:bg-[#151F29]/70 transition-colors cursor-pointer group ${
                    isSelected ? 'bg-[#2979FF]/10 border-l-2 border-[#2979FF]' : ''
                  }`}
                >
                  {/* Compare Selection Checkbox */}
                  <td className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleCompare && onToggleCompare(t.symbol)}
                      className="text-[#8B99A8] hover:text-[#2979FF] transition-colors"
                      title="Select to compare (up to 3)"
                    >
                      {isCompared ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#2979FF]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#8B99A8]/40" />
                      )}
                    </button>
                  </td>

                  {/* Order Controls */}
                  <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center justify-center -space-y-1">
                      <button
                        onClick={() => onMoveUp && onMoveUp(idx)}
                        disabled={idx === 0}
                        className="text-[#8B99A8]/40 hover:text-[#E7EDF3] disabled:opacity-10 transition-colors p-0.5"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onMoveDown && onMoveDown(idx)}
                        disabled={idx === tickers.length - 1}
                        className="text-[#8B99A8]/40 hover:text-[#E7EDF3] disabled:opacity-10 transition-colors p-0.5"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Instrument Symbol & Exchange */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#E7EDF3] text-xs font-mono">{t.symbol}</span>
                      <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-[#151F29] border border-[#25313D] text-[#8B99A8]">
                        {t.exchange || (t.market === 'US' ? 'NASDAQ' : 'NSE')}
                      </span>
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#35C69A]/10 text-[#35C69A] border border-[#35C69A]/30">
                        SIM
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8B99A8] truncate max-w-[130px] font-sans">
                      {t.name}
                    </div>
                  </td>

                  {/* Last Traded Price */}
                  <td className="py-2.5 px-3 text-right font-bold text-[#E7EDF3] text-xs font-mono tabular-nums">
                    {currency}{(t.ltp ?? 0).toFixed(2)}
                  </td>

                  {/* Change % and Absolute Change */}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    <div className={`inline-flex items-center justify-end gap-1 font-semibold text-[11px] ${
                      isUp ? 'text-[#35C69A]' : 'text-[#EF6468]'
                    }`}>
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isUp ? '+' : ''}{(t.changePct ?? 0).toFixed(2)}%</span>
                    </div>
                    <div className="text-[9px] text-[#8B99A8] font-sans">
                      {isUp ? '+' : ''}{currency}{(t.change ?? 0).toFixed(2)}
                    </div>
                  </td>

                  {/* Mini Sparkline */}
                  <td className="py-2.5 px-3 text-center hidden md:table-cell">
                    <div className="flex justify-center">
                      <MiniSparkline changePct={t.changePct ?? 0} isUp={isUp} />
                    </div>
                  </td>

                  {/* Volume */}
                  <td className="py-2.5 px-3 text-right text-[#8B99A8] text-[10px] hidden sm:table-cell tabular-nums">
                    {((t.volume ?? 0) >= 1000000)
                      ? `${((t.volume ?? 0) / 1000000).toFixed(2)}M`
                      : `${((t.volume ?? 0) / 1000).toFixed(0)}K`}
                  </td>

                  {/* Day High / Low */}
                  <td className="py-2.5 px-3 text-right text-[#8B99A8] text-[10px] hidden lg:table-cell tabular-nums">
                    <span>{currency}{(t.dayLow ?? t.ltp ?? 0).toFixed(1)}</span>
                    <span className="mx-1 text-[#8B99A8]/40">-</span>
                    <span>{currency}{(t.dayHigh ?? t.ltp ?? 0).toFixed(1)}</span>
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
                        className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29] transition-colors"
                        title="Interactive Chart"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                      </Link>

                      {/* Alert Button */}
                      <button
                        onClick={() => onOpenAlertModal && onOpenAlertModal(t.symbol)}
                        className="p-1 rounded text-[#8B99A8] hover:text-[#D8AB5E] hover:bg-[#151F29] transition-colors"
                        title="Set Price/Volume Alert"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      {onRemoveSymbol && (
                        <button
                          onClick={() => onRemoveSymbol(t.symbol)}
                          className="p-1 rounded text-[#8B99A8] hover:text-[#EF6468] hover:bg-[#151F29] transition-colors"
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
