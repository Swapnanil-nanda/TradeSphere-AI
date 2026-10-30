import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function Watchlist({ tickers, activeSymbol, onSelectSymbol, flashes }) {
  const [filterMarket, setFilterMarket] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = tickers.filter(t => {
    if (filterMarket === 'IN' && t.market !== 'IN') return false;
    if (filterMarket === 'US' && t.market !== 'US') return false;
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase()) && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <aside className="w-64 border-r border-[#1b253b] bg-[#0c121f] flex flex-col h-full select-none">
      {/* Header & Market Switcher */}
      <div className="p-3 border-b border-[#1b253b]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-xs uppercase text-slate-300 tracking-wider">Watchlist</span>
          <div className="flex items-center gap-1 bg-[#070b14] p-0.5 rounded border border-[#1b253b] text-[10px]">
            {['ALL', 'IN', 'US'].map(m => (
              <button
                key={m}
                onClick={() => setFilterMarket(m)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  filterMarket === m ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#070b14] border border-[#1b253b] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1b253b]/40">
        {filtered.map(item => {
          const isSelected = item.symbol === activeSymbol;
          const flash = flashes[item.symbol]; // 'up' or 'down'
          const isPositive = (item.change || 0) >= 0;
          const currencySymbol = item.currency === 'USD' ? '$' : '₹';

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`p-2.5 cursor-pointer transition-all flex items-center justify-between ${
                isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-[#121b2d]'
              } ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white font-['JetBrains_Mono']">{item.symbol}</span>
                  <span className="text-[9px] font-semibold px-1 rounded bg-slate-800 text-slate-400">
                    {item.exchange}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.name}</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-xs text-white font-['JetBrains_Mono']">
                  {currencySymbol}{item.ltp?.toFixed(2)}
                </div>
                <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  <span>{isPositive ? '+' : ''}{item.changePct?.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
