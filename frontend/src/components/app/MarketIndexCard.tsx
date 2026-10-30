import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketIndexCardProps {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePct: number;
  market: 'IN' | 'US';
  currency?: string;
}

export default function MarketIndexCard({
  name,
  symbol,
  value,
  change,
  changePct,
  market,
  currency = '₹'
}: MarketIndexCardProps) {
  const isUp = changePct >= 0;

  return (
    <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4 flex flex-col justify-between select-none">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-extrabold text-xs text-white uppercase tracking-wider block">{name}</span>
          <span className="text-[10px] text-slate-500 font-mono">{symbol}</span>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          SIMULATED
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <div className="text-xl font-black text-white font-mono tracking-tight">
          {currency}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold font-mono ${
          isUp ? 'text-emerald-400' : 'text-rose-400'
        }`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isUp ? '+' : ''}{changePct.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}
