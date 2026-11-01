'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FlaskRound, Play, Pause, Square, Plus, ShieldCheck, 
  CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight, Clock,
  Activity, BarChart3, RefreshCw, Trash2
} from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  symbol: string;
  type: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  allocatedCapital: number;
  unrealizedPnL: number;
  realizedPnL: number;
  winRate: number;
  sharpeRatio: number;
  tradesCount: number;
  startedAt: string;
}

const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp_01',
    name: 'Dynamic 9/21 EMA Trend Continuation',
    symbol: 'RELIANCE',
    type: 'TREND_FOLLOWING',
    status: 'ACTIVE',
    allocatedCapital: 250000,
    unrealizedPnL: 3840.0,
    realizedPnL: 14250.0,
    winRate: 68.4,
    sharpeRatio: 1.82,
    tradesCount: 19,
    startedAt: '2026-10-15T09:15:00Z'
  },
  {
    id: 'exp_02',
    name: 'Z-Score Mean Reversion & 20-EMA Target',
    symbol: 'TCS',
    type: 'MEAN_REVERSION',
    status: 'ACTIVE',
    allocatedCapital: 200000,
    unrealizedPnL: -850.0,
    realizedPnL: 6800.0,
    winRate: 60.0,
    sharpeRatio: 1.54,
    tradesCount: 15,
    startedAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'exp_03',
    name: 'Donchian 20-Day High Volatility Breakout',
    symbol: 'NVDA',
    type: 'BREAKOUT',
    status: 'ACTIVE',
    allocatedCapital: 50000,
    unrealizedPnL: 1820.0,
    realizedPnL: 4200.0,
    winRate: 72.2,
    sharpeRatio: 2.14,
    tradesCount: 22,
    startedAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'exp_04',
    name: 'Pairs Cointegration Spread Arbitrage',
    symbol: 'HDFCBANK',
    type: 'STAT_ARB',
    status: 'PAUSED',
    allocatedCapital: 150000,
    unrealizedPnL: 0.0,
    realizedPnL: 4120.0,
    winRate: 57.1,
    sharpeRatio: 1.38,
    tradesCount: 14,
    startedAt: '2026-10-20T11:00:00Z'
  }
];

export default function PaperExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>(DEFAULT_EXPERIMENTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tradesphere_paper_experiments_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExperiments(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveExperiments = (updated: Experiment[]) => {
    setExperiments(updated);
    try {
      localStorage.setItem('tradesphere_paper_experiments_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = experiments.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: (e.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE') as Experiment['status']
        };
      }
      return e;
    });
    saveExperiments(updated);
  };

  const deleteExperiment = (id: string) => {
    const updated = experiments.filter(e => e.id !== id);
    saveExperiments(updated);
  };

  const totalCapital = experiments.reduce((acc, e) => acc + e.allocatedCapital, 0);
  const totalPnL = experiments.reduce((acc, e) => acc + e.realizedPnL + e.unrealizedPnL, 0);

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <FlaskRound className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Paper Strategy Forward-Testing Sandbox</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                SIMULATED PAPER EXECUTION
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Live out-of-sample forward tracking of systematic algorithmic strategies in paper markets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/strategy-lab/builder"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Strategy Experiment</span>
          </Link>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-mono">Active Experiments</div>
          <div className="text-base font-bold font-mono text-[#E7EDF3]">
            {experiments.filter(e => e.status === 'ACTIVE').length} <span className="text-xs text-[#8B99A8] font-normal">/ {experiments.length}</span>
          </div>
          <div className="text-[10px] text-[#35C69A] mt-1 font-mono">Running Real-Time Signals</div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-mono">Total Paper Capital</div>
          <div className="text-base font-bold font-mono text-[#E7EDF3]">
            ₹{totalCapital.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-mono">Allocated across {experiments.length} models</div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-mono">Cumulative Paper Alpha</div>
          <div className={`text-base font-bold font-mono ${totalPnL >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-mono">
            Return: +{totalCapital > 0 ? ((totalPnL / totalCapital) * 100).toFixed(2) : '0.00'}%
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D]">
          <div className="text-[11px] text-[#8B99A8] mb-1 font-mono">Weighted Sharpe Ratio</div>
          <div className="text-base font-bold font-mono text-[#2979FF]">
            1.78
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-mono">Zero Overlap Invariant</div>
        </div>
      </div>

      {/* Experiment Cards Grid */}
      <div className="space-y-3">
        {experiments.length === 0 ? (
          <div className="p-10 text-center bg-[#111922] rounded-xl border border-[#25313D] text-[#8B99A8]">
            No paper experiments deployed yet. Click "New Strategy Experiment" to deploy your first strategy.
          </div>
        ) : (
          experiments.map((exp) => {
            const totalExpPnL = exp.realizedPnL + exp.unrealizedPnL;
            const isProfitable = totalExpPnL >= 0;
            const isUS = exp.symbol === 'AAPL' || exp.symbol === 'MSFT' || exp.symbol === 'NVDA' || exp.symbol === 'TSLA' || exp.symbol === 'GOOGL' || exp.symbol === 'AMZN' || exp.symbol === 'SPY' || exp.symbol === 'QQQ';
            const curr = isUS ? '$' : '₹';

            return (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-[#111922] border border-[#25313D] hover:border-[#2979FF]/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#25313D]">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2 py-1 rounded bg-[#151F29] border border-[#25313D] font-mono font-bold text-xs text-[#E7EDF3]">
                      {exp.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#E7EDF3]">{exp.name}</h3>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          exp.status === 'ACTIVE'
                            ? 'bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {exp.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8B99A8] font-mono mt-0.5">
                        Type: {exp.type} • Started: {new Date(exp.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(exp.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#E7EDF3] font-semibold transition-colors"
                    >
                      {exp.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3 h-3 text-amber-400" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-[#35C69A] fill-current" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/app/quant/backtesting?symbol=${exp.symbol}`}
                      className="p-1.5 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#8B99A8] hover:text-[#E7EDF3] transition-colors"
                      title="Audit Strategy Backtest"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => deleteExperiment(exp.id)}
                      className="p-1.5 rounded-lg bg-[#151F29] hover:bg-[#1E2B38] border border-[#25313D] text-[#8B99A8] hover:text-[#EF6468] transition-colors"
                      title="Delete Experiment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 font-mono">
                  <div>
                    <span className="text-[10px] text-[#8B99A8] block">Allocated Capital</span>
                    <span className="text-xs font-bold text-[#E7EDF3]">{curr}{exp.allocatedCapital.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B99A8] block">Cumulative PnL</span>
                    <span className={`text-xs font-bold ${isProfitable ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                      {isProfitable ? '+' : ''}{curr}{totalExpPnL.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B99A8] block">Win Rate</span>
                    <span className="text-xs font-bold text-[#E7EDF3]">{exp.winRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B99A8] block">Sharpe Ratio</span>
                    <span className="text-xs font-bold text-[#35C69A]">{exp.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B99A8] block">Executed Trades</span>
                    <span className="text-xs font-bold text-[#E7EDF3]">{exp.tradesCount} Orders</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Safety Invariant Notice */}
      <div className="p-3.5 rounded-xl bg-[#0D131A] border border-[#25313D] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#35C69A] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#8B99A8] leading-relaxed">
          <strong className="text-[#E7EDF3]">Paper Trading Safety Invariant:</strong> Experiments run strictly in virtual simulated accounts. Real brokerage accounts are never connected to automated signals without authenticated human-in-the-loop pre-trade approval.
        </div>
      </div>
    </div>
  );
}
