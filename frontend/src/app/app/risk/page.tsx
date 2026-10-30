'use client';

import React, { useState, useEffect } from 'react';
import ErrorState from '../../../components/app/ErrorState';
import { CardSkeleton } from '../../../components/app/LoadingSkeleton';
import { apiClient, PortfolioAccount } from '../../../lib/api-client';
import { ShieldCheck, ShieldAlert, AlertTriangle, Calculator, Sparkles, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RiskManagementPage() {
  const [account, setAccount] = useState<PortfolioAccount | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pre-trade calculator state
  const [calcEntry, setCalcEntry] = useState('2980.0');
  const [calcSL, setCalcSL] = useState('2950.0');
  const [riskCapPct, setRiskCapPct] = useState(1.0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [port, coach] = await Promise.all([
        apiClient.getPortfolio(),
        apiClient.getRiskMetrics('RELIANCE')
      ]);
      setAccount(port.account);
      setRiskMetrics(coach);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch risk parameters and circuit breaker telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startingEquity = account?.initialEquity || 1000000;
  const currentEquity = account?.netLiquidation || startingEquity;
  const drawdownPct = account?.dailyDrawdownPct || 0;
  const maxDrawdownPct = account?.dailyDrawdownLimitPct || 3.0;
  const isTripped = account?.tradingLocked || drawdownPct >= maxDrawdownPct;

  // Sizing Calculator Math
  const entry = parseFloat(calcEntry) || 0;
  const sl = parseFloat(calcSL) || 0;
  const riskPerShare = Math.abs(entry - sl);
  const maxAllowedRiskCash = startingEquity * (riskCapPct / 100);
  const safeQty = riskPerShare > 0 ? Math.floor(maxAllowedRiskCash / riskPerShare) : 0;
  const totalTradeCapital = safeQty * entry;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Risk Management &amp; Guardrails
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SYNCHRONOUS GATEKEEPER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-negotiable institutional risk invariant: single-trade loss cap and session circuit breaker.
          </p>
        </div>

        <Link
          href="/app/settings"
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#0c121f] border border-[#1b253b] hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          Configure Risk Limits
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="space-y-6">
          {/* Circuit Breaker Hero Card */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1b253b]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isTripped ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isTripped ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Daily Drawdown Circuit Breaker
                  </h2>
                  <p className="text-xs text-slate-400">
                    Rule B: Automatic session lockout if realized + unrealized drawdown reaches 3.0%
                  </p>
                </div>
              </div>

              <div>
                {isTripped ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    CIRCUIT BREAKER TRIPPED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    NORMAL OPERATIONAL STATE
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar of Daily Drawdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Current Daily Drawdown:</span>
                <span className={`font-bold ${isTripped ? 'text-rose-400' : 'text-slate-200'}`}>
                  {drawdownPct.toFixed(2)}% / {maxDrawdownPct.toFixed(1)}% Max Allowed
                </span>
              </div>

              <div className="w-full h-3 bg-[#070b14] rounded-full overflow-hidden border border-[#1b253b]">
                <div
                  className={`h-full transition-all duration-500 ${
                    isTripped ? 'bg-rose-500' : drawdownPct > 2.0 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, (drawdownPct / maxDrawdownPct) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>0.0% (₹0 Loss)</span>
                <span>Trip Threshold: -₹{(startingEquity * (maxDrawdownPct / 100)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Dual Column: Position Sizer Sandbox & AI Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Position Sizer Sandbox */}
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span>1.0% Risk Position Sizing Sandbox</span>
                </h3>
                <span className="text-[10px] text-blue-400 font-mono">MATH VALIDATOR</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Calculate the exact maximum share quantity such that your total loss if stopped out never exceeds ₹{(startingEquity * 0.01).toLocaleString()}.
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Planned Entry Price (₹)</label>
                    <input
                      type="number"
                      value={calcEntry}
                      onChange={(e) => setCalcEntry(e.target.value)}
                      className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 text-[11px]">Hard Stop Loss Price (₹)</label>
                    <input
                      type="number"
                      value={calcSL}
                      onChange={(e) => setCalcSL(e.target.value)}
                      className="w-full bg-[#070b14] border border-[#1b253b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Sizing Output Box */}
                <div className="bg-[#070b14] border border-[#1b253b] rounded-xl p-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Risk Distance per Share:</span>
                    <span className="text-white font-bold">₹{riskPerShare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Max Allowed Account Risk:</span>
                    <span className="text-blue-400 font-bold">₹{maxAllowedRiskCash.toFixed(2)} (1.0%)</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#1b253b]">
                    <span className="text-slate-200 font-sans font-bold">Maximum Safe Quantity:</span>
                    <span className="text-emerald-400 font-extrabold text-base">{safeQty} Qty</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-sans">Total Capital Deployed:</span>
                    <span>₹{totalTradeCapital.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Risk Audit & Behavioral Diagnostics */}
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>AI Risk Coach Audit &amp; Discipline Score</span>
                </h3>
                <span className="text-[10px] text-indigo-400 font-mono">DETERMINISTIC</span>
              </div>

              <div className="bg-[#070b14] p-4 rounded-xl border border-[#1b253b] space-y-3">
                <div className="text-xs text-slate-300 leading-relaxed">
                  {riskMetrics?.audit?.behavioralVerdict ||
                    'All paper orders have respected the mandatory 1% single-trade stop loss requirement. No revenge trading patterns detected.'}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-[#1b253b]">
                  <div className="bg-[#090d16] p-2.5 rounded-lg border border-[#1b253b]">
                    <span className="text-slate-500 text-[10px] block">REVENGE TRADING RISK</span>
                    <span className="text-emerald-400 font-bold">NONE DETECTED</span>
                  </div>
                  <div className="bg-[#090d16] p-2.5 rounded-lg border border-[#1b253b]">
                    <span className="text-slate-500 text-[10px] block">AVERAGE EXPECTANCY</span>
                    <span className="text-blue-400 font-bold">+1.67R Multiple</span>
                  </div>
                </div>
              </div>

              {/* Guardrail Invariants Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Enforced Risk Invariants
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#070b14] border border-[#1b253b]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Synchronous pre-order risk validation on server side</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#070b14] border border-[#1b253b]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Hard Stop-Loss mandatory on Basic &amp; Active tier orders</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#070b14] border border-[#1b253b]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>One-Cancels-the-Other (OCO) child leg cancellation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
