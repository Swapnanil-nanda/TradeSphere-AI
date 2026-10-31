import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Lock } from 'lucide-react';
import { PortfolioAccount } from '../../lib/api-client';

interface PortfolioSummaryCardProps {
  account: PortfolioAccount;
  onReset?: () => void;
}

export default function PortfolioSummaryCard({ account, onReset }: PortfolioSummaryCardProps) {
  const safeAccount = account || {
    id: 'paper_act_01',
    name: 'Demo Paper Account',
    currency: 'INR',
    initialEquity: 1000000,
    currentCash: 1000000,
    netLiquidation: 1000000,
    totalUnrealizedPnL: 0,
    dayStartEquity: 1000000,
    dailyPnL: 0,
    dailyPnLPct: 0,
    maxRiskPerTradePct: 1.0,
    dailyDrawdownLimitPct: 3.0,
    tradingLocked: false,
    lockReason: null
  };

  const dailyPnLVal = Number(safeAccount.dailyPnL ?? 0);
  const dailyPnLPctVal = Number(safeAccount.dailyPnLPct ?? 0);
  const unrealizedVal = Number(safeAccount.totalUnrealizedPnL ?? 0);
  const netLiqVal = Number(safeAccount.netLiquidation ?? 0);
  const cashVal = Number(safeAccount.currentCash ?? 0);

  const isProfit = dailyPnLVal >= 0;
  const isLocked = safeAccount.tradingLocked ?? false;

  return (
    <div className="bg-[#050505] border border-[#141414] rounded-lg p-4 select-none text-[#F0F3F6]">
      {/* Top Status */}
      <div className="flex items-center justify-between pb-3 border-b border-[#141414] mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-white uppercase tracking-wider block">
              Paper Ledger Equity
            </span>
            <span className="text-[10px] text-[#808a9d] font-mono">AUTHORITATIVE POSTGRES PERSISTED</span>
          </div>
        </div>

        {/* Circuit Breaker Status */}
        {isLocked ? (
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#ff333a]/20 border border-[#ff333a]/40 text-[#ff333a] font-bold text-[10px]">
            <Lock className="w-3.5 h-3.5" />
            <span>CIRCUIT BREAKER TRIGGERED ({safeAccount.lockReason || '3% Daily Cap'})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#00c805]/10 border border-[#00c805]/20 text-[#00c805] font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c805] animate-pulse" />
            <span>1% RISK GUARD &bull; 3% CIRCUIT BREAKER ACTIVE</span>
          </div>
        )}
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div>
          <span className="text-[10px] text-[#808a9d] block mb-0.5 font-sans">Net Liquidation:</span>
          <div className="text-lg font-bold text-white tabular-nums">
            ₹{netLiqVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-[#808a9d] block mb-0.5 font-sans">Daily P&amp;L:</span>
          <div className={`text-lg font-bold flex items-center gap-1 tabular-nums ${
            isProfit ? 'text-[#00c805]' : 'text-[#ff333a]'
          }`}>
            <span>{isProfit ? '+' : ''}₹{dailyPnLVal.toFixed(2)}</span>
            <span className="text-xs font-semibold font-sans">({dailyPnLPctVal.toFixed(2)}%)</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-[#808a9d] block mb-0.5 font-sans">Unrealized MTM:</span>
          <div className={`text-lg font-bold tabular-nums ${
            unrealizedVal >= 0 ? 'text-[#00c805]' : 'text-[#ff333a]'
          }`}>
            {unrealizedVal >= 0 ? '+' : ''}₹{unrealizedVal.toFixed(2)}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-[#808a9d] block mb-0.5 font-sans">Available Cash:</span>
          <div className="text-lg font-bold text-[#F0F3F6] tabular-nums">
            ₹{cashVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
