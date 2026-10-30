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
    <div className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl p-3.5 flex flex-col justify-between select-none shadow-2xs transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider block">{name}</span>
          <span className="text-[10px] text-slate-400 font-mono">{symbol}</span>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          SIMULATED
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
          {currency}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold font-mono tabular-nums ${
          isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isUp ? '+' : ''}{changePct.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}
