'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, Calculator,
  Sparkles, CheckCircle2, Lock, ArrowRight, Activity, Percent, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, PortfolioAccount, Ticker } from '../../../lib/api-client';
import {
  ALL_RISK_SYMBOLS,
  RISK_UNIVERSE_ASSETS,
  evaluatePreTradeRisk
} from '../../../lib/options-risk-engine';

function RiskManagementContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [account, setAccount] = useState<PortfolioAccount | null>(null);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);

  // Pre-trade calculator state
  const [calcEquity, setCalcEquity] = useState(1000000);
  const [calcEntry, setCalcEntry] = useState('2985.0');
  const [calcSL, setCalcSL] = useState('2950.0');
  const [calcTarget, setCalcTarget] = useState('3055.0');
  const [riskCapPct, setRiskCapPct] = useState(1.0);
  const [sessionDrawdownPct, setSessionDrawdownPct] = useState(0.85);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol && RISK_UNIVERSE_ASSETS[sym]) {
      setSymbol(sym);
    }
  }, [searchParams]);

  // Load account portfolio & live tickers
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const [port, tickerList] = await Promise.all([
          apiClient.getPortfolio(),
          apiClient.getTickers()
        ]);
        if (isMounted) {
          if (port?.account) {
            setAccount(port.account);
            if (port.account.netLiquidation) {
              setCalcEquity(port.account.netLiquidation);
            }
          }
          if (Array.isArray(tickerList) && tickerList.length > 0) {
            setTickers(tickerList);
          }
        }
      } catch (err) {
        console.error('Risk page data fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();
  }, []);

  const meta = RISK_UNIVERSE_ASSETS[symbol] || RISK_UNIVERSE_ASSETS['RELIANCE'];
  const activeTicker = useMemo(() => {
    return tickers.find(t => t.symbol === symbol) || {
      symbol,
      ltp: meta.basePrice,
      changePct: 0.5,
      currency: meta.currency
    } as any;
  }, [tickers, symbol, meta]);

  const spot = Number(activeTicker.ltp || meta.basePrice);
  const currSym = meta.currency === 'USD' ? '$' : '₹';

  // Sync entry and SL when symbol changes
  useEffect(() => {
    const step = meta.strikeInterval || (spot > 1000 ? 10 : 1);
    const roundedSpot = Math.round(spot * 10) / 10;
    const roundedSL = Math.round((spot * 0.985) * 10) / 10;
    const roundedTP = Math.round((spot * 1.03) * 10) / 10;
    setCalcEntry(roundedSpot.toString());
    setCalcSL(roundedSL.toString());
    setCalcTarget(roundedTP.toString());
  }, [symbol, spot, meta.strikeInterval]);

  const entry = parseFloat(calcEntry) || 0;
  const sl = parseFloat(calcSL) || 0;
  const target = parseFloat(calcTarget) || 0;

  // Strict Pre-Trade Risk Evaluation (Enforces Rule A & Rule B)
  const riskEval = useMemo(() => {
    return evaluatePreTradeRisk(
      calcEquity,
      entry,
      sl,
      target,
      riskCapPct,
      sessionDrawdownPct,
      3.0
    );
  }, [calcEquity, entry, sl, target, riskCapPct, sessionDrawdownPct]);

  const maxDrawdownPct = 3.0;
  const isTripped = sessionDrawdownPct >= maxDrawdownPct;
  const riskReward = riskEval.riskPerShare > 0 && target > entry
    ? Math.round(((target - entry) / riskEval.riskPerShare) * 100) / 100
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#E7EDF3]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D131A] p-4 rounded-xl border border-[#25313D] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Risk Management &amp; Guardrails
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                RULE A GATEKEEPER
              </span>
            </div>
            <p className="text-xs text-[#8B99A8] mt-0.5">
              Enforcing mandatory hard stop-loss, 1.0% single-trade max loss, and 3.0% session circuit breaker.
            </p>
          </div>
        </div>

        {/* Universal Asset Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono text-xs">
            <span className="text-white font-bold">{symbol}</span>
            <span className="text-[#8B99A8]">Spot:</span>
            <span className="text-[#35C69A] font-bold">{currSym}{spot.toFixed(2)}</span>
          </div>

          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs focus:outline-none focus:border-[#2979FF]"
          >
            <optgroup label="Indian Equities &amp; Indices (NSE)">
              {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'IN').map(s => (
                <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
              ))}
            </optgroup>
            <optgroup label="US Equities &amp; ETFs (NASDAQ/NYSE)">
              {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'US').map(s => (
                <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Daily Drawdown Circuit Breaker Hero Card */}
      <div className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#25313D]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isTripped ? 'bg-[#EF6468]/15 text-[#EF6468] border border-[#EF6468]/30' : 'bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30'
            }`}>
              {isTripped ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Daily Drawdown Circuit Breaker</span>
                <span className="text-[10px] font-mono text-[#8B99A8] font-normal">(Rule B Synchronous Invariant)</span>
              </h2>
              <p className="text-[11px] text-[#8B99A8]">
                Automatic session lockout when cumulative realized + unrealized drawdown reaches 3.0% of starting equity.
              </p>
            </div>
          </div>

          <div>
            {isTripped ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EF6468]/20 text-[#EF6468] border border-[#EF6468]/40 font-bold text-xs font-mono">
                <Lock className="w-3.5 h-3.5" />
                CIRCUIT BREAKER TRIPPED — ORDERS LOCKED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-bold text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#35C69A] animate-pulse" />
                GATEKEEPER NORMAL (ACTIVE)
              </span>
            )}
          </div>
        </div>

        {/* Drawdown Progress Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#8B99A8]">Simulated Session Drawdown:</span>
            <span className={`font-bold ${isTripped ? 'text-[#EF6468]' : 'text-white'}`}>
              {sessionDrawdownPct.toFixed(2)}% / {maxDrawdownPct.toFixed(1)}% Max Allowed Cap
            </span>
          </div>

          <div className="w-full h-3 bg-[#090D12] rounded-full overflow-hidden border border-[#25313D]">
            <div
              className={`h-full transition-all duration-300 ${
                isTripped ? 'bg-[#EF6468]' : sessionDrawdownPct > 2.0 ? 'bg-[#D8AB5E]' : 'bg-[#2979FF]'
              }`}
              style={{ width: `${Math.min(100, (sessionDrawdownPct / maxDrawdownPct) * 100)}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#8B99A8] font-mono gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span>Test Circuit Breaker:</span>
              <input
                type="range"
                min="0"
                max="4.0"
                step="0.05"
                value={sessionDrawdownPct}
                onChange={e => setSessionDrawdownPct(parseFloat(e.target.value))}
                className="w-32 accent-[#2979FF] cursor-pointer"
              />
              <span className="text-white font-bold">{sessionDrawdownPct.toFixed(2)}%</span>
            </div>
            <span>Trip Threshold: -{currSym}{(calcEquity * (maxDrawdownPct / 100)).toLocaleString()} loss</span>
          </div>
        </div>
      </div>

      {/* Dual Column: Position Sizing Validator & AI Risk Coach Blotter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: 1.0% Position Sizing Calculator */}
        <div className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#2979FF]" />
              <span>1.0% Risk Position Sizing Engine</span>
            </h3>
            <span className="text-[10px] text-[#2979FF] font-mono px-2 py-0.5 rounded bg-[#2979FF]/10 border border-[#2979FF]/25">
              RULE A STRICT SIZING
            </span>
          </div>

          <p className="text-xs text-[#8B99A8] leading-relaxed">
            Computes exact maximum safe contract size for <strong className="text-white">{symbol}</strong>. If risk for even 1 share exceeds the {riskCapPct}% risk cap, sizing <strong>must strictly return 0 units</strong> per Rule A.
          </p>

          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8B99A8] mb-1 font-sans text-[11px]">Account Equity ({currSym})</label>
                <input
                  type="number"
                  value={calcEquity}
                  onChange={e => setCalcEquity(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-3 py-1.5 text-white font-bold focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div>
                <label className="block text-[#8B99A8] mb-1 font-sans text-[11px]">Max Risk Cap: {riskCapPct}%</label>
                <input
                  type="range"
                  min="0.25"
                  max="3.0"
                  step="0.25"
                  value={riskCapPct}
                  onChange={e => setRiskCapPct(parseFloat(e.target.value))}
                  className="w-full accent-[#2979FF] cursor-pointer mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[#8B99A8] mb-1 font-sans text-[11px]">Planned Entry ({currSym})</label>
                <input
                  type="number"
                  step="any"
                  value={calcEntry}
                  onChange={e => setCalcEntry(e.target.value)}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-white font-bold focus:outline-none focus:border-[#2979FF]"
                />
              </div>

              <div>
                <label className="block text-[#8B99A8] mb-1 font-sans text-[11px]">Hard Stop Loss ({currSym})</label>
                <input
                  type="number"
                  step="any"
                  value={calcSL}
                  onChange={e => setCalcSL(e.target.value)}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-[#EF6468] font-bold focus:outline-none focus:border-[#EF6468]"
                />
              </div>

              <div>
                <label className="block text-[#8B99A8] mb-1 font-sans text-[11px]">Target ({currSym})</label>
                <input
                  type="number"
                  step="any"
                  value={calcTarget}
                  onChange={e => setCalcTarget(e.target.value)}
                  className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg px-2.5 py-1.5 text-[#35C69A] font-bold focus:outline-none focus:border-[#35C69A]"
                />
              </div>
            </div>

            {/* Sizing Output Blotter */}
            <div className="bg-[#0D131A] border border-[#25313D] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#8B99A8] font-sans">Stop Loss Distance per Share:</span>
                <span className="text-white font-bold">{currSym}{riskEval.riskPerShare.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8B99A8] font-sans">Max Allowed Loss Allocation:</span>
                <span className="text-[#2979FF] font-bold">{currSym}{riskEval.maxAllowedRiskCash.toLocaleString()} ({riskCapPct}%)</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#8B99A8] font-sans">Planned Risk / Reward:</span>
                <span className="text-[#D8AB5E] font-bold">1 : {riskReward.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#25313D]">
                <span className="text-white font-sans font-bold">Maximum Safe Quantity:</span>
                <span className={`text-base font-extrabold ${riskEval.isBreached ? 'text-[#EF6468]' : 'text-[#35C69A]'}`}>
                  {riskEval.safeQuantity} {symbol.includes('NIFTY') ? 'Contracts' : 'Shares'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-[#8B99A8]">
                <span className="font-sans">Total Capital Requirement:</span>
                <span>{currSym}{riskEval.totalDeployedCapital.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Breach Alert Banner if Safe Quantity is 0 */}
            {riskEval.isBreached && (
              <div className="p-3 bg-[#EF6468]/10 border border-[#EF6468]/30 rounded-xl flex items-start gap-2.5 text-[#EF6468]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-[11px] font-sans leading-relaxed">
                  <strong>Risk Rule Activated:</strong> {riskEval.breachReason}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Institutional Risk Analytics & Parametric VaR */}
        <div className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#25313D]">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D8AB5E]" />
              <span>Parametric VaR &amp; Behavioral Auditing</span>
            </h3>
            <span className="text-[10px] text-[#D8AB5E] font-mono px-2 py-0.5 rounded bg-[#D8AB5E]/10 border border-[#D8AB5E]/25">
              1-DAY 95% / 99%
            </span>
          </div>

          {/* VaR Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#0D131A] p-3 rounded-lg border border-[#25313D]">
              <span className="text-[#8B99A8] text-[10px] block font-sans">1-DAY 95% PARAMETRIC VAR</span>
              <span className="text-white font-extrabold text-sm block mt-0.5">
                {currSym}{riskEval.var95_1Day.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#8B99A8] font-sans">1.645σ standard risk tail</span>
            </div>

            <div className="bg-[#0D131A] p-3 rounded-lg border border-[#25313D]">
              <span className="text-[#8B99A8] text-[10px] block font-sans">1-DAY 99% STRESS VAR</span>
              <span className="text-[#EF6468] font-extrabold text-sm block mt-0.5">
                {currSym}{riskEval.var99_1Day.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#8B99A8] font-sans">2.326σ extreme tail loss</span>
            </div>
          </div>

          {/* Behavior & Guardrails Checklist */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
              Enforced Production Invariants
            </span>

            <div className="space-y-1.5 text-xs text-[#E7EDF3]">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <CheckCircle2 className="w-4 h-4 text-[#35C69A] shrink-0" />
                <div>
                  <span className="font-semibold block">Pre-Trade Risk Gatekeeper (Synchronous)</span>
                  <span className="text-[11px] text-[#8B99A8]">All orders verified before reaching matching book.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <CheckCircle2 className="w-4 h-4 text-[#35C69A] shrink-0" />
                <div>
                  <span className="font-semibold block">Mandatory Hard Stop-Loss</span>
                  <span className="text-[11px] text-[#8B99A8]">Cannot submit naked positions without pre-defined stop trigger.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                <CheckCircle2 className="w-4 h-4 text-[#35C69A] shrink-0" />
                <div>
                  <span className="font-semibold block">One-Cancels-the-Other (OCO) State Machine</span>
                  <span className="text-[11px] text-[#8B99A8]">When target fills, stop-loss child leg is canceled immediately.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href={`/app/paper-trading?symbol=${symbol}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-colors"
            >
              <span>Execute Sized Order for {symbol}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RiskManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Risk Management Center...</div>}>
      <RiskManagementContent />
    </Suspense>
  );
}
