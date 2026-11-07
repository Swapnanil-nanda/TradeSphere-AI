import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../lib/api-client';
import { generateOptionsChainEngine } from '../lib/options-risk-engine';

export default function OptionsChain({ symbol, spotPrice }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(7);
  const [selectedStrike, setSelectedStrike] = useState(null);

  const isUS = symbol === 'AAPL' || symbol === 'NVDA' || symbol === 'TSLA' || symbol === 'MSFT' || symbol === 'GOOGL' || symbol === 'AMZN' || symbol === 'SPY' || symbol === 'QQQ';
  const currSym = isUS ? '$' : '₹';

  const fetchChain = async () => {
    setLoading(true);
    try {
      const json = await apiClient.getOptionsChain(symbol, days);
      if (json && Array.isArray(json.chain) && json.chain.length > 0) {
        setData(json);
      } else {
        setData(generateOptionsChainEngine(symbol, spotPrice, days));
      }
    } catch (e) {
      setData(generateOptionsChainEngine(symbol, spotPrice, days));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChain();
  }, [symbol, days, spotPrice]);

  const chain = data?.chain || [];
  const maxOI = Math.max(1, ...chain.map(r => Math.max(r.call?.oi || 0, r.put?.oi || 0)));
  const pcr = data?.pcr || (data?.totalCallOI > 0 ? (data.totalPutOI / data.totalCallOI).toFixed(2) : 1.0);
  const pcrNum = parseFloat(pcr);
  const isPcrBullish = pcrNum > 1.0;

  return (
    <div className="h-full flex flex-col bg-[#070b14] border border-[#1b253b] rounded-2xl overflow-hidden text-xs font-mono select-none">
      {/* Options Header & Expiry selector */}
      <div className="p-3 border-b border-[#1b253b] bg-[#0c121f] flex flex-wrap items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white uppercase tracking-wider text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00c805] animate-pulse" />
            <span>Options Chain &amp; Greeks</span>
          </span>
          <span className="text-xs text-slate-300 bg-[#070b14] px-2.5 py-0.5 rounded-lg border border-[#1b253b] font-mono">
            Spot: <b className="text-white">{currSym}{spotPrice?.toFixed(2)}</b>
          </span>
        </div>

        {/* Sensibull-grade Summary Metrics (PCR, Max Pain, Total OI) */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1 bg-[#070b14] px-2 py-0.5 rounded border border-[#1b253b]">
            <span className="text-slate-400">PCR:</span>
            <span className={`font-bold ${isPcrBullish ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
              {pcr} ({isPcrBullish ? 'Bullish' : 'Bearish'})
            </span>
          </div>

          {data?.maxPain && (
            <div className="hidden sm:flex items-center gap-1 bg-[#070b14] px-2 py-0.5 rounded border border-[#1b253b]">
              <span className="text-slate-400">Max Pain:</span>
              <span className="text-[#D8AB5E] font-bold">{data.maxPain}</span>
            </div>
          )}

          {/* DTE Selector */}
          <div className="flex items-center gap-0.5 bg-[#070b14] p-0.5 rounded-lg border border-[#1b253b] text-[10px]">
            {[0, 7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2 py-0.5 rounded font-semibold transition-all ${
                  days === d 
                    ? 'bg-[#2979FF] text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d === 0 ? '0-DTE' : `${d}D`}
              </button>
            ))}
          </div>

          <button
            onClick={fetchChain}
            disabled={loading}
            className="p-1 rounded hover:bg-[#151F29] text-slate-400 hover:text-white transition-colors"
            title="Refresh Greeks &amp; Open Interest"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chain Table Header */}
      <div className="grid grid-cols-12 text-[9px] uppercase font-mono font-bold text-slate-400 py-1.5 px-3 bg-[#0a0f1d] border-b border-[#1b253b] text-center">
        <span className="text-emerald-400 text-left col-span-2">Call OI (Contracts)</span>
        <span className="text-emerald-400">Chg OI</span>
        <span className="text-emerald-400">Δ Delta</span>
        <span className="text-emerald-400">IV%</span>
        <span className="text-emerald-400 font-extrabold">Call LTP</span>
        <span className="text-[#D8AB5E] font-black bg-[#151F29] rounded py-0.5">STRIKE</span>
        <span className="text-rose-400 font-extrabold">Put LTP</span>
        <span className="text-rose-400">IV%</span>
        <span className="text-rose-400">Δ Delta</span>
        <span className="text-rose-400">Chg OI</span>
        <span className="text-rose-400 text-right col-span-2">Put OI (Contracts)</span>
      </div>

      {/* Chain Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1b253b]/30 custom-scrollbar bg-[#070b14]">
        {chain.map((row) => {
          const isATM = Math.abs(row.strike - (spotPrice || 0)) <= (isUS ? 2.5 : 25);
          const isCallITM = (spotPrice || 0) > row.strike;
          const isPutITM = (spotPrice || 0) < row.strike;

          const callOiPct = maxOI > 0 ? ((row.call?.oi || 0) / maxOI) * 100 : 0;
          const putOiPct = maxOI > 0 ? ((row.put?.oi || 0) / maxOI) * 100 : 0;

          return (
            <div
              key={row.strike}
              className={`grid grid-cols-12 text-[10px] py-1 px-3 text-center items-center hover:bg-[#101726] transition-colors num-tabular relative ${
                isATM ? 'bg-[#D8AB5E]/10 border-y border-[#D8AB5E]/30' : ''
              }`}
            >
              {/* Call OI Bar & Number */}
              <div className="col-span-2 text-left relative flex items-center pr-2">
                <div
                  className="absolute inset-y-0 left-0 bg-[#00c805]/15 rounded-r"
                  style={{ width: `${callOiPct}%` }}
                />
                <span className="relative z-10 font-bold text-slate-300 text-[10px]">
                  {(row.call?.oi || 0).toLocaleString()}
                </span>
              </div>

              {/* Call Chg OI */}
              <span className={`text-[9px] ${(row.call?.oiChange || 0) >= 0 ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                {(row.call?.oiChange || 0) >= 0 ? '+' : ''}{((row.call?.oiChange || 0) / 1000).toFixed(1)}k
              </span>

              {/* Call Delta */}
              <span className={`text-[9px] ${isCallITM ? 'font-bold text-white' : 'text-slate-400'}`}>
                {row.call?.delta}
              </span>

              {/* Call IV */}
              <span className="text-slate-400">{row.call?.iv}%</span>

              {/* Call LTP Clickable */}
              <Link
                href={`/app/paper-trading?symbol=${symbol}&side=BUY&price=${row.call?.ltp}&orderType=LIMIT`}
                className={`font-bold hover:underline cursor-pointer py-0.5 rounded ${isCallITM ? 'text-[#00c805] bg-emerald-950/20' : 'text-[#00c805]/80'}`}
                title={`Place BUY Call order at ${currSym}${row.call?.ltp?.toFixed(2)}`}
              >
                {currSym}{row.call?.ltp?.toFixed(2)}
              </Link>

              {/* Center Strike */}
              <Link
                href={`/app/risk/payoff?symbol=${symbol}&strike1=${row.strike}`}
                className={`font-bold font-mono py-0.5 rounded transition-transform hover:scale-105 block ${
                  isATM ? 'bg-[#D8AB5E] text-[#090D12] font-black' : 'text-white bg-[#0c121f] border border-[#1b253b]'
                }`}
                title="Model Payoff at this Strike"
              >
                {row.strike}
              </Link>

              {/* Put LTP Clickable */}
              <Link
                href={`/app/paper-trading?symbol=${symbol}&side=BUY&price=${row.put?.ltp}&orderType=LIMIT`}
                className={`font-bold hover:underline cursor-pointer py-0.5 rounded ${isPutITM ? 'text-[#ff333a] bg-rose-950/20' : 'text-[#ff333a]/80'}`}
                title={`Place BUY Put order at ${currSym}${row.put?.ltp?.toFixed(2)}`}
              >
                {currSym}{row.put?.ltp?.toFixed(2)}
              </Link>

              {/* Put IV */}
              <span className="text-slate-400">{row.put?.iv}%</span>

              {/* Put Delta */}
              <span className={`text-[9px] ${isPutITM ? 'font-bold text-white' : 'text-slate-400'}`}>
                {row.put?.delta}
              </span>

              {/* Put Chg OI */}
              <span className={`text-[9px] ${(row.put?.oiChange || 0) >= 0 ? 'text-[#00c805]' : 'text-[#ff333a]'}`}>
                {(row.put?.oiChange || 0) >= 0 ? '+' : ''}{((row.put?.oiChange || 0) / 1000).toFixed(1)}k
              </span>

              {/* Put OI Bar & Number */}
              <div className="col-span-2 text-right relative flex items-center justify-end pl-2">
                <div
                  className="absolute inset-y-0 right-0 bg-[#ff333a]/15 rounded-l"
                  style={{ width: `${putOiPct}%` }}
                />
                <span className="relative z-10 font-bold text-slate-300 text-[10px]">
                  {(row.put?.oi || 0).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
