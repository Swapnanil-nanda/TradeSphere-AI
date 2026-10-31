import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, X, Info, Activity } from 'lucide-react';

export default function Watchlist({ tickers, activeSymbol, onSelectSymbol, flashes }) {
  const [filterMarket, setFilterMarket] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = (tickers || []).filter(t => {
    if (filterMarket === 'IN' && t.market !== 'IN') return false;
    if (filterMarket === 'US' && t.market !== 'US') return false;
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase()) && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeTicker = (tickers || []).find(t => t.symbol === activeSymbol) || (tickers && tickers[0]) || {
    symbol: activeSymbol || 'RELIANCE',
    name: 'Reliance Industries Ltd',
    ltp: 2985.40,
    change: 24.30,
    changePct: 0.82,
    dayHigh: 2998.00,
    dayLow: 2962.10,
    volume: 3412500,
    vwap: 2978.20,
    currency: 'INR'
  };

  const currencySymbol = activeTicker.currency === 'USD' ? '$' : '₹';

  return (
    <aside className="w-64 border-r border-[#25313D] bg-[#0D131A] flex flex-col h-full select-none shrink-0 text-xs">
      {/* Header & Market Filter */}
      <div className="p-2 border-b border-[#25313D] space-y-1.5 bg-[#0D131A]">
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-[10px] uppercase text-[#8B99A8] tracking-wider">
            WATCHLIST
          </span>
          <div className="flex items-center gap-0.5 bg-[#111922] p-0.5 rounded border border-[#25313D] text-[10px] font-mono">
            {['ALL', 'IN', 'US'].map(m => (
              <button
                key={m}
                onClick={() => setFilterMarket(m)}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  filterMarket === m 
                    ? 'bg-[#2979FF] text-white shadow-2xs' 
                    : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                }`}
              >
                {m === 'IN' ? 'NSE' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#8B99A8]" />
          <input
            type="text"
            placeholder="Search e.g. RELIANCE, AAPL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111922] border border-[#25313D] rounded px-7 py-1 text-xs text-[#E7EDF3] placeholder-[#8B99A8] focus:outline-hidden focus:border-[#2979FF] font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1.5 text-[#8B99A8] hover:text-[#E7EDF3]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#25313D]/40 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#8B99A8]">
            No instruments match &quot;{search}&quot;
          </div>
        ) : (
          filtered.map(item => {
            const isSelected = item.symbol === activeSymbol;
            const flash = flashes ? flashes[item.symbol] : null;
            const isPositive = (item.change || 0) >= 0;
            const curr = item.currency === 'USD' ? '$' : '₹';

            return (
              <div
                key={item.symbol}
                onClick={() => onSelectSymbol(item.symbol)}
                className={`px-2.5 py-1.5 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                  isSelected 
                    ? 'bg-[#151F29] border-l-2 border-[#2979FF]' 
                    : 'hover:bg-[#111922]'
                } ${flash === 'up' ? 'bg-[#35C69A]/15' : flash === 'down' ? 'bg-[#EF6468]/15' : ''}`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-[#E7EDF3] font-mono num-tabular">
                      {item.symbol}
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#111922] text-[#8B99A8] border border-[#25313D]">
                      {item.exchange || (item.market === 'US' ? 'NASDAQ' : 'NSE')}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8B99A8] truncate max-w-[110px]">
                    {item.name}
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div className="font-semibold text-xs text-[#E7EDF3] num-tabular">
                    {curr}{item.ltp?.toFixed(2)}
                  </div>
                  <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 num-tabular ${
                    isPositive ? 'text-[#35C69A]' : 'text-[#EF6468]'
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

      {/* Selected Instrument Microstructure Summary */}
      <div className="border-t border-[#25313D] bg-[#0D131A] p-2 space-y-1.5 shrink-0 text-[11px] font-mono">
        <div className="flex items-center justify-between text-[#8B99A8] border-b border-[#25313D] pb-1">
          <span className="text-[10px] uppercase font-bold text-[#E7EDF3] flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#2979FF]" />
            {activeTicker.symbol} DETAILS
          </span>
          <span className="text-[10px] text-[#35C69A]">NSE SIM</span>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <div>
            <span className="text-[#8B99A8]">Day High: </span>
            <span className="text-[#E7EDF3] font-semibold num-tabular">
              {currencySymbol}{activeTicker.dayHigh ? activeTicker.dayHigh.toFixed(2) : (activeTicker.ltp * 1.01).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[#8B99A8]">Day Low: </span>
            <span className="text-[#E7EDF3] font-semibold num-tabular">
              {currencySymbol}{activeTicker.dayLow ? activeTicker.dayLow.toFixed(2) : (activeTicker.ltp * 0.99).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[#8B99A8]">VWAP: </span>
            <span className="text-[#D8AB5E] font-semibold num-tabular">
              {currencySymbol}{activeTicker.vwap ? activeTicker.vwap.toFixed(2) : activeTicker.ltp.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[#8B99A8]">Vol: </span>
            <span className="text-[#E7EDF3] num-tabular">
              {activeTicker.volume ? (activeTicker.volume > 1000000 ? `${(activeTicker.volume / 1000000).toFixed(1)}M` : `${(activeTicker.volume / 1000).toFixed(0)}K`) : '2.4M'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="px-2.5 py-1 border-t border-[#25313D] bg-[#090D12] flex items-center justify-between text-[10px] font-mono text-[#8B99A8]">
        <span>{filtered.length} instruments</span>
        <span className="text-[#35C69A] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#35C69A] animate-pulse" />
          STREAMING
        </span>
      </div>
    </aside>
  );
}
