'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CardSkeleton } from '../../../components/app/LoadingSkeleton';
import ErrorState from '../../../components/app/ErrorState';
import { apiClient, CompanyResearch, Ticker } from '../../../lib/api-client';
import { BookOpen, Search, ArrowUpRight, TrendingUp, TrendingDown, ShieldCheck, Layers, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function ResearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [research, setResearch] = useState<CompanyResearch | null>(null);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams, symbol]);

  const loadData = async (targetSymbol: string) => {
    try {
      setLoading(true);
      setError(null);
      const [allTickers, researchData] = await Promise.all([
        apiClient.getTickers(),
        apiClient.getCompanyResearch(targetSymbol)
      ]);
      setTickers(allTickers);
      setResearch(researchData);
    } catch (err: any) {
      console.error(err);
      setError(`Failed to load company research dossier for ${targetSymbol}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(symbol);
  }, [symbol]);

  const isUS = research?.market === 'US';
  const currencySymbol = isUS ? '$' : '₹';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header with Search/Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Institutional Research Dossier
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              SIMULATED ANALYSIS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep-dive fundamental ratios, quantitative market structure, and catalyst timeline.
          </p>
        </div>

        {/* Quick Symbol Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={symbol}
            onChange={(e) => {
              const s = e.target.value;
              setSymbol(s);
              router.push(`/app/research?symbol=${s}`);
            }}
            className="bg-[#0c121f] border border-[#1b253b] text-white font-extrabold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-sans"
          >
            {tickers.map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol} ({t.name})
              </option>
            ))}
          </select>

          <Link
            href={`/app/paper-trading?symbol=${symbol}`}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30"
          >
            Trade {symbol}
          </Link>
        </div>
      </div>

      {/* Simulation Transparency Ribbon */}
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Data Source:</span>
          <span className="text-blue-400">TradeSphere Synthetic GBM Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            SIMULATED RESEARCH
          </span>
          <span>Freshness: <strong className="text-slate-200">Real-time Synthetic Tick (&lt;50ms)</strong></span>
          <span className="text-slate-500">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : error || !research ? (
        <ErrorState message={error || 'Research data unavailable.'} onRetry={() => loadData(symbol)} />
      ) : (
        <div className="space-y-6">
          {/* Company Hero Card */}
          <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b253b]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-black text-white">{research.name}</h2>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {research.symbol}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {isUS ? 'NASDAQ/NYSE' : 'NSE / BSE'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Sector: <span className="text-slate-200 font-semibold">{research.sector}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/app/charts?symbol=${research.symbol}`}
                  className="px-3 py-1.5 rounded-xl border border-[#1b253b] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
                >
                  Technical Charts
                </Link>
                <Link
                  href={`/app/screener`}
                  className="px-3 py-1.5 rounded-xl border border-[#1b253b] text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
                >
                  Compare in Screener
                </Link>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-4xl">
              {research.overview}
            </p>
          </div>

          {/* Key Fundamentals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Market Cap</span>
              <div className="text-lg font-black text-white font-mono">{research.keyStats.marketCap}</div>
              <span className="text-[10px] text-slate-500">Free-float weighted</span>
            </div>
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">P/E Ratio (TTM)</span>
              <div className="text-lg font-black text-white font-mono">{research.keyStats.peRatio.toFixed(1)}x</div>
              <span className="text-[10px] text-emerald-400">Sector Median: 24.2x</span>
            </div>
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Price-to-Book (P/B)</span>
              <div className="text-lg font-black text-white font-mono">{research.keyStats.pbRatio.toFixed(2)}x</div>
              <span className="text-[10px] text-slate-500">Book Value Multiple</span>
            </div>
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Return on Equity (ROE)</span>
              <div className="text-lg font-black text-emerald-400 font-mono">{research.keyStats.roe}</div>
              <span className="text-[10px] text-slate-500">Trailing 12-Month</span>
            </div>
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Debt-to-Equity</span>
              <div className="text-lg font-black text-white font-mono">{research.keyStats.debtToEquity.toFixed(2)}</div>
              <span className="text-[10px] text-emerald-400">Conservative balance sheet</span>
            </div>
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Beta (5Y Monthly)</span>
              <div className="text-lg font-black text-white font-mono">{research.keyStats.beta.toFixed(2)}</div>
              <span className="text-[10px] text-slate-500">&lt; 1.0 Low Market Sensitivity</span>
            </div>
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">Dividend Yield</span>
              <div className="text-lg font-black text-white font-mono">{research.keyStats.dividendYield}</div>
              <span className="text-[10px] text-slate-500">Annualized payout</span>
            </div>
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-semibold block mb-1">52-Week Range</span>
              <div className="text-xs font-black text-white font-mono truncate">
                {currencySymbol}{research.keyStats.week52Low} - {currencySymbol}{research.keyStats.week52High}
              </div>
              <span className="text-[10px] text-slate-500">Trailing 252 sessions</span>
            </div>
          </div>

          {/* Technical Regime & Catalysts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Regime Box */}
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Market Structure &amp; Technical Regime</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                  {research.technicals.bias}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {research.technicals.trendSummary}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#070b14] p-3 rounded-xl border border-[#1b253b]">
                  <span className="text-slate-400 text-[10px] block mb-1">DYNAMIC 20-EMA</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {currencySymbol}{research.technicals.ema20.toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#070b14] p-3 rounded-xl border border-[#1b253b]">
                  <span className="text-slate-400 text-[10px] block mb-1">SESSION VWAP</span>
                  <span className="text-blue-400 font-bold text-sm">
                    {currencySymbol}{research.technicals.vwap.toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#070b14] p-3 rounded-xl border border-[#1b253b]">
                  <span className="text-slate-400 text-[10px] block mb-1">KEY SUPPORT LEVEL</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {currencySymbol}{research.technicals.support.toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#070b14] p-3 rounded-xl border border-[#1b253b]">
                  <span className="text-slate-400 text-[10px] block mb-1">KEY RESISTANCE LEVEL</span>
                  <span className="text-rose-400 font-bold text-sm">
                    {currencySymbol}{research.technicals.resistance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Catalysts & Risks Box */}
            <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b253b]">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Key Catalysts &amp; Corporate Events</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">TIMELINE</span>
              </div>

              <div className="space-y-3">
                {research.catalysts.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#070b14] border border-[#1b253b] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white mb-0.5">{cat.title}</div>
                      <div className="text-[10px] text-slate-500">Status: {cat.date}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      cat.impact === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      cat.impact === 'NEGATIVE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {cat.impact}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span>
                  All fundamental statistics and valuation multiples reflect simulated research parameters designed to practice financial analysis and risk evaluation.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResearchPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <ResearchContent />
    </Suspense>
  );
}
