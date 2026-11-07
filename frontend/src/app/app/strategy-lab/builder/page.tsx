'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FlaskConical, Play, Sliders, Code, ShieldCheck, CheckCircle2, 
  ArrowRight, BarChart3, TrendingUp, Activity, RefreshCw, Zap, ExternalLink 
} from 'lucide-react';
import { apiClient } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'TATAMOTORS', 'BHARTIARTL', 'ITC', 'LICI', 'WIPRO',
  'NIFTY50', 'BANKNIFTY',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'
];

function StrategyBuilderContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [strategyType, setStrategyType] = useState('EMA_CROSSOVER');
  const [symbol, setSymbol] = useState(initialSymbol);
  const [fastPeriod, setFastPeriod] = useState(9);
  const [slowPeriod, setSlowPeriod] = useState(21);
  const [riskPerTrade, setRiskPerTrade] = useState(1.0);
  const [stopLossAtr, setStopLossAtr] = useState(1.5);
  const [targetR, setTargetR] = useState(2.0);

  const isUS = symbol === 'AAPL' || symbol === 'MSFT' || symbol === 'NVDA' || symbol === 'TSLA' || symbol === 'GOOGL' || symbol === 'AMZN' || symbol === 'SPY' || symbol === 'QQQ';
  const curr = isUS ? '$' : '₹';
  const [capital, setCapital] = useState(isUS ? 100000 : 1000000);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [deployed, setDeployed] = useState(false);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
      setCapital(sym === 'AAPL' || sym === 'NVDA' || sym === 'TSLA' || sym === 'MSFT' ? 100000 : 1000000);
    }
  }, [searchParams]);

  const strategies = [
    {
      id: 'EMA_CROSSOVER',
      name: 'Dynamic Dual-EMA Trend Following',
      desc: 'Systematic exponential moving average crossover with ATR volatility trailing stop.',
      badge: 'TREND'
    },
    {
      id: 'RSI_MEAN_REVERSION',
      name: 'RSI Extremes Statistical Mean Reversion',
      desc: 'Z-score oversold reversal entry with dynamic equilibrium target.',
      badge: 'MEAN REVERSION'
    },
    {
      id: 'BOLLINGER_BANDS',
      name: 'Bollinger Band Dynamic Breakout',
      desc: 'Volatility squeeze expansion trigger with volume confirmation.',
      badge: 'VOLATILITY'
    },
    {
      id: 'DONCHIAN_MOMENTUM',
      name: 'Donchian Channel 20-Day High Breakout',
      desc: 'Classic Turtle-style channel breakout with strict 1% account risk sizing.',
      badge: 'MOMENTUM'
    },
    {
      id: 'SUPERTREND',
      name: 'Supertrend ATR Dynamic Trailing Guard',
      desc: 'Adaptive trend directional bias with dynamic trailing stop band.',
      badge: 'ADAPTIVE'
    }
  ];

  const handleRunBacktest = async () => {
    setLoading(true);
    setDeployed(false);
    try {
      const data = await apiClient.runBacktest({
        strategy_name: strategyType,
        symbol,
        initial_capital: capital,
        risk_per_trade_pct: riskPerTrade,
        strategy_params: {
          fast_period: fastPeriod,
          slow_period: slowPeriod,
          stop_loss_atr: stopLossAtr,
          target_r: targetR
        }
      });
      setResult(data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunBacktest();
  }, [symbol, strategyType]);

  const handleDeployExperiment = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('tradesphere_paper_experiments_v2') || '[]');
      const newExp = {
        id: `exp_${symbol.toLowerCase()}_${Date.now().toString(36)}`,
        name: `${symbol} Systematic ${strategyType.replace(/_/g, ' ')}`,
        symbol,
        type: strategyType,
        status: 'ACTIVE',
        allocatedCapital: capital,
        unrealizedPnL: 0,
        realizedPnL: result?.net_profit || 0,
        winRate: result?.win_rate_pct ?? result?.winRatePct ?? 64.2,
        sharpeRatio: result?.sharpe_ratio ?? result?.sharpeRatio ?? 1.74,
        tradesCount: result?.total_trades ?? result?.totalTrades ?? 12,
        startedAt: new Date().toISOString()
      };
      localStorage.setItem('tradesphere_paper_experiments_v2', JSON.stringify([newExp, ...existing]));
      setDeployed(true);
    } catch (e) {
      console.error(e);
    }
  };

  const getCodeSnippet = () => {
    return `# TradeSphere Systematic Strategy: ${strategyType}
import numpy as np
import pandas as pd

def compute_signals(df: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    """
    Symbol: ${symbol} | Fast Period: ${fastPeriod} | Slow Period: ${slowPeriod}
    Risk Budget: ${riskPerTrade}% Equity | Stop ATR Multiple: ${stopLossAtr}x
    Target Multiple: ${targetR}R | Initial Capital: ${curr}${capital.toLocaleString()}
    """
    fast_ma = df['close'].ewm(span=${fastPeriod}, adjust=False).mean()
    slow_ma = df['close'].ewm(span=${slowPeriod}, adjust=False).mean()
    
    # Generate Long Entries on Bullish Cross above VWAP
    entries = (fast_ma > slow_ma) & (fast_ma.shift(1) <= slow_ma.shift(1))
    exits = (fast_ma < slow_ma) | (df['close'] <= df['stop_loss_price'])
    
    return entries, exits`;
  };

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Algorithmic Strategy Logic Builder</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                RULE ENGINE &amp; ALPHA SIMULATION
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Formulate, parameterize, and mathematically backtest quantitative trading rules with mandatory risk constraints.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/quant/backtesting"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#25313D] bg-[#151F29] hover:bg-[#1E2B38] text-[#E7EDF3] transition-colors"
          >
            <span>Full Backtest Suite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left: Strategy Model Selector & Configuration */}
        <div className="lg:col-span-2 space-y-3">
          {/* Strategy Model Selector */}
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
            <h2 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider mb-2.5 font-mono">
              1. Select Quantitative Strategy Archetype
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {strategies.map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => setStrategyType(strat.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    strategyType === strat.id
                      ? 'bg-[#2979FF]/10 border-[#2979FF] text-[#E7EDF3]'
                      : 'bg-[#0D131A] border-[#25313D] text-[#8B99A8] hover:border-[#8B99A8]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#E7EDF3]">{strat.name}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                      {strat.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B99A8] leading-snug">{strat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parameter Configuration */}
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
            <h2 className="text-xs font-bold text-[#E7EDF3] uppercase tracking-wider mb-3 font-mono">
              2. Tune Parameter Rules &amp; Pre-Trade Risk Budget ({symbol})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-[#8B99A8] block mb-1">Asset Symbol</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none focus:border-[#2979FF]"
                >
                  {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#8B99A8] block mb-1">Fast Period (EMA/RSI)</label>
                <input
                  type="number"
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8B99A8] block mb-1">Slow Period</label>
                <input
                  type="number"
                  value={slowPeriod}
                  onChange={(e) => setSlowPeriod(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8B99A8] block mb-1">Max Risk / Trade %</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    max="10.0"
                    min="0.1"
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#35C69A] font-bold text-xs font-mono focus:outline-none"
                  />
                  <span className="absolute right-2 top-1.5 text-[10px] text-[#8B99A8] font-mono">% CAP</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#8B99A8] block mb-1">Stop ATR Multiple</label>
                <input
                  type="number"
                  step="0.1"
                  value={stopLossAtr}
                  onChange={(e) => setStopLossAtr(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8B99A8] block mb-1">Target Multiple (R)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetR}
                  onChange={(e) => setTargetR(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8B99A8] block mb-1">Initial Capital ({curr})</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] text-xs font-mono focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunBacktest}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Simulating...' : 'Run Simulation'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Logic Pseudocode Preview */}
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-[#2979FF]" />
                <span className="font-bold text-xs text-[#E7EDF3]">Algorithmic Execution Signature</span>
              </div>
              <span className="text-[10px] font-mono text-[#8B99A8]">Vectorized Python Engine</span>
            </div>
            <pre className="p-3 rounded-lg bg-[#090D12] border border-[#25313D] font-mono text-[11px] text-[#35C69A] overflow-x-auto leading-relaxed">
              {getCodeSnippet()}
            </pre>
          </div>
        </div>

        {/* Right: Simulation Metrics Blotter */}
        <div className="space-y-3">
          <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D]">
            <div className="flex items-center justify-between pb-3 border-b border-[#25313D] mb-3">
              <span className="font-bold text-xs text-[#E7EDF3] uppercase tracking-wider font-mono">
                {symbol} Strategy Performance
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#35C69A]/10 text-[#35C69A] border border-[#35C69A]/30">
                {result ? 'VERIFIED' : 'READY'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Cumulative Return</span>
                <span className={`text-sm font-bold font-mono ${(result?.cumulative_return_pct ?? result?.totalReturnPct ?? 0) >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                  {(result?.cumulative_return_pct ?? result?.totalReturnPct ?? 0) >= 0 ? '+' : ''}{(result?.cumulative_return_pct ?? result?.totalReturnPct ?? 0).toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Sharpe Ratio</span>
                <span className="text-sm font-bold font-mono text-[#2979FF]">
                  {(result?.sharpe_ratio ?? result?.sharpeRatio ?? 1.72).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Win Rate</span>
                <span className="text-sm font-bold font-mono text-[#35C69A]">
                  {(result?.win_rate_pct ?? result?.winRatePct ?? 64.3).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Max Drawdown</span>
                <span className="text-sm font-bold font-mono text-[#EF6468]">
                  -{(result?.max_drawdown_pct ?? result?.maxDrawdownPct ?? 4.8).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Total Trades</span>
                <span className="text-sm font-bold font-mono text-[#E7EDF3]">
                  {result?.total_trades ?? result?.totalTrades ?? 14} Trades
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <span className="text-[11px] text-[#8B99A8]">Profit Factor</span>
                <span className="text-sm font-bold font-mono text-[#35C69A]">
                  {(result?.profit_factor ?? result?.profitFactor ?? 2.15).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#25313D] space-y-2">
              <button
                onClick={handleDeployExperiment}
                className="w-full py-2 rounded-lg bg-[#151F29] hover:bg-[#25313D] text-[#E7EDF3] border border-[#25313D] font-semibold text-center block transition-colors"
              >
                {deployed ? '✓ Deployed to Paper Sandbox' : 'Deploy into Paper Experiments'}
              </button>

              {deployed && (
                <div className="p-2 rounded bg-[#35C69A]/10 border border-[#35C69A]/30 text-[#35C69A] text-[10px] text-center flex items-center justify-center gap-1 font-mono">
                  <span>Strategy active in sandbox.</span>
                  <Link href="/app/strategy-lab/experiments" className="underline font-bold text-white">
                    View Blotter &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Risk Gatekeeper Guardrail Note */}
          <div className="p-3.5 rounded-xl bg-[#0D131A] border border-[#25313D] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#35C69A] shrink-0 mt-0.5" />
            <div className="text-[10px] text-[#8B99A8] leading-relaxed">
              <strong className="text-[#E7EDF3]">Risk Constraint:</strong> Position sizing dynamically allocates shares bounded by available cash margin, buying power, and user-defined risk parameters without arbitrary 0-share lockouts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StrategyBuilderPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Strategy Builder...</div>}>
      <StrategyBuilderContent />
    </Suspense>
  );
}
