import React from 'react';
import { ShieldCheck, ShieldAlert, Wallet, TrendingUp, TrendingDown, DollarSign, Lock } from 'lucide-react';
import { PortfolioAccount } from '../../lib/api-client';

interface PortfolioSummaryCardProps {
  account: PortfolioAccount;
  onReset?: () => void;
}

export default function PortfolioSummaryCard({ account, onReset }: PortfolioSummaryCardProps) {
  const isProfit = account.dailyPnL >= 0;
  const isLocked = account.tradingLocked;

  return (
    <div className="bg-white dark:bg-[#0c121f] border border-slate-200 dark:border-[#1b253b] rounded-xl p-4 shadow-2xs select-none transition-colors">
      {/* Top Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b253b] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider block">
              Paper Ledger Equity
            </span>
            <span className="text-[10px] text-slate-400 font-mono">SIMULATED VIRTUAL ACCOUNT</span>
          </div>
        </div>

        {/* Circuit Breaker Status */}
        {isLocked ? (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
            <Lock className="w-3.5 h-3.5" />
            <span>CIRCUIT BREAKER TRIGGERED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>1% RISK GUARD ACTIVE</span>
          </div>
        )}
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 font-sans">Net Liquidation:</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            ₹{account.netLiquidation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 font-sans">Daily P&amp;L:</span>
          <div className={`text-lg font-bold flex items-center gap-1 ${
            isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            <span>{isProfit ? '+' : ''}₹{account.dailyPnL.toFixed(2)}</span>
            <span className="text-xs font-semibold font-sans">({account.dailyPnLPct.toFixed(2)}%)</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 font-sans">Unrealized MTM:</span>
          <div className={`text-lg font-bold ${
            account.totalUnrealizedPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {account.totalUnrealizedPnL >= 0 ? '+' : ''}₹{account.totalUnrealizedPnL.toFixed(2)}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5 font-sans">Available Cash:</span>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
            ₹{account.currentCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
