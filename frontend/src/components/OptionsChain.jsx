import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiClient } from '../lib/api-client';

export default function OptionsChain({ symbol, spotPrice }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);

  const fetchChain = async () => {
    setLoading(true);
    try {
      const json = await apiClient.getOptionsChain(symbol, days);
      setData(json);
    } catch (e) {
      console.error('Failed to fetch options chain:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChain();
  }, [symbol, days]);

  const chain = data?.chain || [];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0b101c] text-xs font-mono select-none transition-colors">
      {/* Options Header & Expiry selector */}
      <div className="p-2.5 border-b border-slate-200 dark:border-[#1b253b] flex items-center justify-between font-sans">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">Options Chain &amp; Greeks</span>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Spot: <b className="text-slate-900 dark:text-white font-mono">₹{spotPrice?.toFixed(2)}</b>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#070b14] p-0.5 rounded border border-slate-200 dark:border-[#1b253b] text-[10px]">
            {[0, 7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  days === d 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {d === 0 ? '0-DTE' : `${d}D`}
              </button>
            ))}
          </div>

          <button
            onClick={fetchChain}
            disabled={loading}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            title="Refresh Greeks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chain Table Header */}
      <div className="grid grid-cols-11 text-[9px] uppercase font-sans font-bold text-slate-500 dark:text-slate-400 py-1.5 px-2 bg-slate-50 dark:bg-[#070b14] border-b border-slate-200 dark:border-[#1b253b] text-center">
        <span className="text-emerald-700 dark:text-emerald-400">Δ (Delta)</span>
        <span className="text-emerald-700 dark:text-emerald-400">IV%</span>
        <span className="text-emerald-700 dark:text-emerald-400">Bid</span>
        <span className="text-emerald-700 dark:text-emerald-400">Ask</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Call LTP</span>
        <span className="text-amber-700 dark:text-amber-400 font-black bg-slate-200 dark:bg-slate-800/80 rounded py-0.5">STRIKE</span>
        <span className="text-rose-700 dark:text-rose-400 font-extrabold">Put LTP</span>
        <span className="text-rose-700 dark:text-rose-400">Bid</span>
        <span className="text-rose-700 dark:text-rose-400">Ask</span>
        <span className="text-rose-700 dark:text-rose-400">IV%</span>
        <span className="text-rose-700 dark:text-rose-400">Δ (Delta)</span>
      </div>

      {/* Chain Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1b253b]/20 custom-scrollbar">
        {chain.map((row) => {
          const isATM = Math.abs(row.strike - (spotPrice || 0)) <= 25;
          const isCallITM = (spotPrice || 0) > row.strike;
          const isPutITM = (spotPrice || 0) < row.strike;

          return (
            <div
              key={row.strike}
              className={`grid grid-cols-11 text-[10px] py-1.5 px-2 text-center items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                isATM ? 'bg-amber-50 dark:bg-amber-500/10 border-y border-amber-200 dark:border-amber-500/20' : ''
              }`}
            >
              <span className={`text-[9px] ${isCallITM ? 'font-bold text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                {row.call?.delta}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{row.call?.iv}%</span>
              <span className="text-slate-500 dark:text-slate-400">{row.call?.bid?.toFixed(1)}</span>
              <span className="text-slate-500 dark:text-slate-400">{row.call?.ask?.toFixed(1)}</span>
              <span className={`font-bold ${isCallITM ? 'text-emerald-700 dark:text-emerald-300' : 'text-emerald-600 dark:text-emerald-500'}`}>
                ₹{row.call?.ltp?.toFixed(2)}
              </span>

              {/* Center Strike */}
              <span className={`font-bold font-sans py-0.5 rounded ${isATM ? 'bg-amber-500 text-white dark:text-slate-950 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                {row.strike}
              </span>

              <span className={`font-bold ${isPutITM ? 'text-rose-700 dark:text-rose-300' : 'text-rose-600 dark:text-rose-500'}`}>
                ₹{row.put?.ltp?.toFixed(2)}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{row.put?.bid?.toFixed(1)}</span>
              <span className="text-slate-500 dark:text-slate-400">{row.put?.ask?.toFixed(1)}</span>
              <span className="text-slate-500 dark:text-slate-400">{row.put?.iv}%</span>
              <span className={`text-[9px] ${isPutITM ? 'font-bold text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                {row.put?.delta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
