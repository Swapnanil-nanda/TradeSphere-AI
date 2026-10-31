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
    <div className="h-full flex flex-col bg-[#111922] text-xs font-mono select-none">
      {/* Options Header & Expiry selector */}
      <div className="p-2 border-b border-[#25313D] bg-[#0D131A] flex items-center justify-between font-sans">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#E7EDF3] uppercase tracking-wider text-[10px] font-mono">
            OPTIONS CHAIN &amp; GREEKS
          </span>
          <span className="text-[10px] text-[#8B99A8] bg-[#151F29] px-2 py-0.5 rounded border border-[#25313D] font-mono">
            Spot: <b className="text-[#E7EDF3]">₹{spotPrice?.toFixed(2)}</b>
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <div className="flex items-center gap-0.5 bg-[#151F29] p-0.5 rounded border border-[#25313D] text-[10px]">
            {[0, 7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  days === d 
                    ? 'bg-[#2979FF] text-white shadow-2xs' 
                    : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                }`}
              >
                {d === 0 ? '0-DTE' : `${d}D`}
              </button>
            ))}
          </div>

          <button
            onClick={fetchChain}
            disabled={loading}
            className="p-1 rounded hover:bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3]"
            title="Refresh Greeks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chain Table Header */}
      <div className="grid grid-cols-11 text-[9px] uppercase font-mono font-bold text-[#8B99A8] py-1 px-2 bg-[#0D131A] border-b border-[#25313D] text-center">
        <span className="text-[#35C69A]">Δ Delta</span>
        <span className="text-[#35C69A]">IV%</span>
        <span className="text-[#35C69A]">Bid</span>
        <span className="text-[#35C69A]">Ask</span>
        <span className="text-[#35C69A] font-extrabold">Call LTP</span>
        <span className="text-[#D8AB5E] font-black bg-[#151F29] rounded py-0.5">STRIKE</span>
        <span className="text-[#EF6468] font-extrabold">Put LTP</span>
        <span className="text-[#EF6468]">Bid</span>
        <span className="text-[#EF6468]">Ask</span>
        <span className="text-[#EF6468]">IV%</span>
        <span className="text-[#EF6468]">Δ Delta</span>
      </div>

      {/* Chain Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#25313D]/25 custom-scrollbar bg-[#111922]">
        {chain.map((row) => {
          const isATM = Math.abs(row.strike - (spotPrice || 0)) <= 25;
          const isCallITM = (spotPrice || 0) > row.strike;
          const isPutITM = (spotPrice || 0) < row.strike;

          return (
            <div
              key={row.strike}
              className={`grid grid-cols-11 text-[10px] py-1 px-2 text-center items-center hover:bg-[#151F29] transition-colors num-tabular ${
                isATM ? 'bg-[#D8AB5E]/10 border-y border-[#D8AB5E]/30' : ''
              }`}
            >
              <span className={`text-[9px] ${isCallITM ? 'font-bold text-[#E7EDF3]' : 'text-[#8B99A8]'}`}>
                {row.call?.delta}
              </span>
              <span className="text-[#8B99A8]">{row.call?.iv}%</span>
              <span className="text-[#8B99A8]">{row.call?.bid?.toFixed(1)}</span>
              <span className="text-[#8B99A8]">{row.call?.ask?.toFixed(1)}</span>
              <span className={`font-bold ${isCallITM ? 'text-[#35C69A]' : 'text-[#35C69A]/80'}`}>
                ₹{row.call?.ltp?.toFixed(2)}
              </span>

              {/* Center Strike */}
              <span className={`font-bold font-mono py-0.5 rounded ${isATM ? 'bg-[#D8AB5E] text-[#090D12] font-black' : 'text-[#E7EDF3]'}`}>
                {row.strike}
              </span>

              <span className={`font-bold ${isPutITM ? 'text-[#EF6468]' : 'text-[#EF6468]/80'}`}>
                ₹{row.put?.ltp?.toFixed(2)}
              </span>
              <span className="text-[#8B99A8]">{row.put?.bid?.toFixed(1)}</span>
              <span className="text-[#8B99A8]">{row.put?.ask?.toFixed(1)}</span>
              <span className="text-[#8B99A8]">{row.put?.iv}%</span>
              <span className={`text-[9px] ${isPutITM ? 'font-bold text-[#E7EDF3]' : 'text-[#8B99A8]'}`}>
                {row.put?.delta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
