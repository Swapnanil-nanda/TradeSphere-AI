import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react';

export default function Watchlist({ tickers, activeSymbol, onSelectSymbol, flashes }) {
  const [filterMarket, setFilterMarket] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = (tickers || []).filter(t => {
    if (filterMarket === 'IN' && t.market !== 'IN') return false;
    if (filterMarket === 'US' && t.market !== 'US') return false;
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase()) && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-[#1b253b] bg-white dark:bg-[#0c121f] flex flex-col h-full select-none transition-colors shrink-0">
      {/* Header & Market Switcher */}
      <div className="p-2.5 border-b border-slate-200 dark:border-[#1b253b] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] uppercase text-slate-500 dark:text-slate-400 tracking-wider">Watchlist</span>
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#070b14] p-0.5 rounded border border-slate-200 dark:border-[#1b253b] text-[10px]">
            {['ALL', 'IN', 'US'].map(m => (
              <button
                key={m}
                onClick={() => setFilterMarket(m)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  filterMarket === m 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m === 'IN' ? 'NSE' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search e.g. RELIANCE, AAPL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-md pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1b253b]/40 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No instruments match &quot;{search}&quot;
          </div>
        ) : (
          filtered.map(item => {
            const isSelected = item.symbol === activeSymbol;
            const flash = flashes[item.symbol]; // 'up' or 'down'
            const isPositive = (item.change || 0) >= 0;
            const currencySymbol = item.currency === 'USD' ? '$' : '₹';

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected 
                    ? 'bg-blue-50/70 dark:bg-blue-600/15 border-l-3 border-blue-600' 
                    : 'hover:bg-slate-50 dark:hover:bg-[#121b2d]'
                } ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white font-mono tabular-nums">
                      {item.symbol}
                    </span>
                    <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {item.exchange || (item.market === 'US' ? 'NASDAQ' : 'NSE')}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                    {item.name}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white font-mono tabular-nums">
                    {currencySymbol}{item.ltp?.toFixed(2)}
                  </div>
                  <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 font-mono tabular-nums ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    <span>{isPositive ? '+' : ''}{item.changePct?.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Count */}
      <div className="px-3 py-1.5 border-t border-slate-200 dark:border-[#1b253b] bg-slate-50 dark:bg-[#070b14] flex items-center justify-between text-[10px] text-slate-400">
        <span>{filtered.length} instruments</span>
        <span className="font-mono text-emerald-600 dark:text-emerald-400">● LIVE</span>
      </div>
    </aside>
  );
}
