'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Layers, RefreshCw, Activity, ShieldCheck,
  TrendingUp, TrendingDown, ArrowUpRight, BarChart2
} from 'lucide-react';
import Link from 'next/link';
import OptionsChain from '../../../../components/OptionsChain';
import { apiClient, Ticker } from '../../../../lib/api-client';
import {
  ALL_RISK_SYMBOLS,
  RISK_UNIVERSE_ASSETS,
  generateOptionsChainEngine
} from '../../../../lib/options-risk-engine';

function OptionsContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'NIFTY50';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol && RISK_UNIVERSE_ASSETS[sym]) {
      setSymbol(sym);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const list = await apiClient.getTickers();
        if (isMounted && Array.isArray(list) && list.length > 0) {
          setTickers(list);
        }
      } catch (err) {
        console.error('Error fetching options tickers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const meta = RISK_UNIVERSE_ASSETS[symbol] || RISK_UNIVERSE_ASSETS['NIFTY50'];
  const activeTicker = useMemo(() => {
    return tickers.find(t => t.symbol === symbol) || {
      symbol,
      ltp: meta.basePrice,
      changePct: 0.5,
      currency: meta.currency
    } as any;
  }, [tickers, symbol, meta]);

  const spotPrice = Number(activeTicker.ltp || meta.basePrice);
  const isUS = meta.market === 'US';
  const curr = isUS ? '$' : '₹';

  // Compute live chain metrics (PCR, Max Pain, ATM IV)
  const chainAnalysis = useMemo(() => {
    return generateOptionsChainEngine(symbol, spotPrice, days);
  }, [symbol, spotPrice, days]);

  return (
    <div className="space-y-4 select-none pb-10 text-xs text-[#E7EDF3] max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-4 rounded-xl border border-[#25313D] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white font-sans">
                  Options Analytics &amp; Volatility Chain
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                  ANALYTICAL BLACK-SCHOLES
                </span>
              </div>
              <p className="text-[#8B99A8] text-xs">
                Real-time multi-strike Greeks (Δ, Γ, Θ, ν, ρ), Newton-Raphson IV solver, and Max Pain detection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono text-xs">
              <span className="text-white font-bold">{symbol}</span>
              <span className="text-[#8B99A8] tabular-nums">Spot: {curr}{spotPrice.toFixed(2)}</span>
            </div>

            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs focus:outline-none focus:border-[#2979FF]"
            >
              <optgroup label="Indian Benchmark Indices (NSE)">
                {ALL_RISK_SYMBOLS.filter(s => s.includes('NIFTY')).map(s => (
                  <option key={s} value={s}>{s} — {RISK_UNIVERSE_ASSETS[s].name}</option>
                ))}
              </optgroup>
              <optgroup label="Top Indian Equities (NSE)">
                {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'IN' && !s.includes('NIFTY')).map(s => (
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
      </div>

      {/* Options Structure Metrics (Real Quantitative Computation) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">Put-Call Ratio (PCR OI)</div>
          <div className={`text-base font-extrabold mt-0.5 tabular-nums ${
            chainAnalysis.pcrBias === 'Bullish' ? 'text-[#35C69A]' : chainAnalysis.pcrBias === 'Bearish' ? 'text-[#EF6468]' : 'text-[#D8AB5E]'
          }`}>
            {chainAnalysis.pcrOI.toFixed(2)} ({chainAnalysis.pcrBias})
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">
            Vol PCR: {chainAnalysis.pcrVol.toFixed(2)}
          </div>
        </div>

        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">Max Pain Strike</div>
          <div className="text-base font-extrabold text-white mt-0.5 tabular-nums">
            {curr}{chainAnalysis.maxPainStrike.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">
            Lowest buyer payout level
          </div>
        </div>

        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">ATM Implied Volatility (IV)</div>
          <div className="text-base font-extrabold text-[#2979FF] mt-0.5 tabular-nums">
            {chainAnalysis.atmIV.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">
            Newton-Raphson smile baseline
          </div>
        </div>

        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D]">
          <div className="text-[10px] text-[#8B99A8] font-sans">Historical Volatility (HV20)</div>
          <div className="text-base font-extrabold text-[#D8AB5E] mt-0.5 tabular-nums">
            {chainAnalysis.hv20.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans mt-0.5">
            IV-HV Spread: {(chainAnalysis.atmIV - chainAnalysis.hv20).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#111922] rounded-lg border border-[#25313D] text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[#8B99A8]">Total Open Interest:</span>
          <span className="text-[#35C69A] font-bold">Calls: {chainAnalysis.totalCallOI.toLocaleString()}</span>
          <span className="text-[#EF6468] font-bold">Puts: {chainAnalysis.totalPutOI.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/app/risk/payoff?symbol=${symbol}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D131A] hover:bg-[#151F29] border border-[#25313D] text-[#2979FF] font-semibold transition-colors"
          >
            <span>Model Payoff</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
          <Link
            href={`/app/risk/greeks?symbol=${symbol}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D131A] hover:bg-[#151F29] border border-[#25313D] text-[#D8AB5E] font-semibold transition-colors"
          >
            <span>Analytic Greeks</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Full Chain Table Component */}
      <div className="bg-[#0D131A] rounded-xl border border-[#25313D] shadow-md h-[580px] overflow-hidden">
        <OptionsChain symbol={symbol} spotPrice={spotPrice} />
      </div>
    </div>
  );
}

export default function OptionsAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Options Chain...</div>}>
      <OptionsContent />
    </Suspense>
  );
}
