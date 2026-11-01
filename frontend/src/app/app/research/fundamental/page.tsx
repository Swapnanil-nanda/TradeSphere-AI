'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Award, TrendingUp, ShieldCheck, DollarSign, PieChart, Activity } from 'lucide-react';
import { apiClient, CompanyResearch } from '../../../../lib/api-client';

const ALL_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'BHARTIARTL', 'ITC', 'TATAMOTORS', 'LICI', 'WIPRO',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN'
];

function FundamentalContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [data, setData] = useState<CompanyResearch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiClient.getCompanyResearch(symbol)
      .then(res => {
        if (isMounted) setData(res);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [symbol]);

  const stats = data?.keyStats;
  const isUS = data?.market === 'US';
  const curr = isUS ? '$' : '₹';

  const ratios = [
    { name: 'Trailing P/E Ratio', value: stats ? `${stats.peRatio}x` : '—', benchmark: isUS ? 'S&P 500: ~28.0x' : 'Nifty 50: ~22.5x', status: 'VALUATION' },
    { name: 'Price to Book (P/B)', value: stats ? `${stats.pbRatio}x` : '—', benchmark: 'Historical Asset Multiplier', status: 'BALANCE_SHEET' },
    { name: 'Return on Equity (ROE)', value: stats?.roe || '—', benchmark: 'Target > 14.0%', status: 'PROFITABILITY' },
    { name: 'Debt to Equity', value: stats ? `${stats.debtToEquity}` : '—', benchmark: 'Safe < 0.80', status: 'SOLVENCY' },
    { name: 'Dividend Yield', value: stats?.dividendYield || '—', benchmark: 'Cash Distribution Yield', status: 'SHAREHOLDER_RETURN' },
    { name: 'Beta (Market Sensitivity)', value: stats ? `${stats.beta}` : '—', benchmark: 'Benchmark Beta = 1.00', status: 'RISK_PROFILE' },
    { name: '52-Week High Range', value: stats ? `${curr}${stats.week52High}` : '—', benchmark: 'Annual Resistance Bound', status: 'RANGE' },
    { name: '52-Week Low Range', value: stats ? `${curr}${stats.week52Low}` : '—', benchmark: 'Annual Support Foundation', status: 'RANGE' }
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs text-[#F0F3F6]">
      {/* Header */}
      <div className="bg-[#050505] p-4 rounded-xl border border-[#141414] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white font-sans">{data?.name || `${symbol} Equities`}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30 font-mono">
                  {data?.sector || 'Institutional Dossier'}
                </span>
              </div>
              <p className="text-[#808a9d] text-[11px]">
                Quantitative valuation ratios, financial leverage metrics, and catalyst intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-[#080808] border border-[#1a1a1a] rounded-lg px-3 py-1.5 font-mono font-bold text-white focus:outline-none focus:border-[#2979FF]"
            >
              {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Company Executive Overview */}
      <div className="bg-[#050505] p-4 rounded-xl border border-[#141414]">
        <div className="flex items-center gap-2 mb-1.5 font-bold text-white text-xs font-sans">
          <Award className="w-4 h-4 text-[#2979FF]" />
          <span>Business Model &amp; Industry Standing</span>
        </div>
        <p className="text-[#808a9d] text-xs leading-relaxed font-sans">
          {data?.overview || 'Compiling company overview...'}
        </p>
      </div>

      {/* Ratios Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ratios.slice(0, 4).map((r, i) => (
          <div key={i} className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
            <div className="text-[10px] text-[#808a9d] font-sans">{r.name}</div>
            <div className="font-bold text-base font-mono text-white my-0.5 tabular-nums">{r.value}</div>
            <div className="text-[10px] text-[#808a9d]/80 font-mono">{r.benchmark}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Full Ratios Table (Left 2/3) */}
        <div className="lg:col-span-2 bg-[#050505] rounded-xl border border-[#141414] overflow-hidden">
          <div className="p-3.5 border-b border-[#141414] flex items-center justify-between">
            <span className="font-bold text-white text-xs font-sans">Fundamental Multiples &amp; Capital Structure ({symbol})</span>
            <span className="text-[10px] text-[#808a9d] font-mono">Market Cap: {stats?.marketCap}</span>
          </div>

          <div className="divide-y divide-[#141414]">
            {ratios.map((r, i) => (
              <div key={i} className="p-3 px-4 flex items-center justify-between hover:bg-[#0c0c0c] transition-colors">
                <div>
                  <div className="font-bold text-white text-xs">{r.name}</div>
                  <div className="text-[10px] text-[#808a9d]">{r.benchmark}</div>
                </div>
                <div className="font-mono font-bold text-white text-xs tabular-nums">
                  {r.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catalysts & Events (Right 1/3) */}
        <div className="bg-[#050505] rounded-xl border border-[#141414] overflow-hidden">
          <div className="p-3.5 border-b border-[#141414] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00c805]" />
            <span className="font-bold text-white text-xs font-sans">Strategic Catalysts &amp; Drivers</span>
          </div>

          <div className="divide-y divide-[#141414]">
            {data?.catalysts?.map((c, i) => (
              <div key={i} className="p-3 px-4 space-y-1 hover:bg-[#0c0c0c] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#808a9d]">{c.date}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    c.impact === 'POSITIVE' ? 'bg-[#00c805]/10 text-[#00c805]' : 'bg-[#2979FF]/10 text-[#2979FF]'
                  }`}>
                    {c.impact}
                  </span>
                </div>
                <div className="text-white text-xs font-semibold leading-snug">
                  {c.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FundamentalAnalysisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#808a9d] font-mono text-xs">Loading Fundamental Dossier...</div>}>
      <FundamentalContent />
    </Suspense>
  );
}
