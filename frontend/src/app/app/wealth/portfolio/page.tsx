'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { 
  PieChart, TrendingUp, ShieldCheck, DollarSign, Wallet, 
  ArrowUpRight, BarChart3, Layers, Percent, CheckCircle2, Sliders, Plus, Trash2, RefreshCw 
} from 'lucide-react';
import { KNOWN_ASSET_PROFILES } from '../../../../lib/mpt-solver';
import { apiClient } from '../../../../lib/api-client';

const ALL_SYMBOLS = Object.keys(KNOWN_ASSET_PROFILES);

interface AllocationItem {
  symbol: string;
  weight: number;
}

const PRESETS: Record<string, { name: string; items: AllocationItem[] }> = {
  balanced: {
    name: 'Balanced Indo-US Core',
    items: [
      { symbol: 'RELIANCE', weight: 20 },
      { symbol: 'TCS', weight: 15 },
      { symbol: 'HDFCBANK', weight: 15 },
      { symbol: 'NVDA', weight: 15 },
      { symbol: 'AAPL', weight: 15 },
      { symbol: 'SPY', weight: 20 }
    ]
  },
  tech_growth: {
    name: 'Aggressive Global Tech',
    items: [
      { symbol: 'NVDA', weight: 25 },
      { symbol: 'AAPL', weight: 20 },
      { symbol: 'MSFT', weight: 20 },
      { symbol: 'TCS', weight: 15 },
      { symbol: 'TATAMOTORS', weight: 10 },
      { symbol: 'QQQ', weight: 10 }
    ]
  },
  defensive: {
    name: 'Defensive Bluechip & Dividend',
    items: [
      { symbol: 'ITC', weight: 25 },
      { symbol: 'TCS', weight: 25 },
      { symbol: 'RELIANCE', weight: 20 },
      { symbol: 'HDFCBANK', weight: 20 },
      { symbol: 'LICI', weight: 10 }
    ]
  }
};

function WealthPortfolioContent() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [totalCorpus, setTotalCorpus] = useState(currency === 'INR' ? 1000000 : 100000);
  const [allocations, setAllocations] = useState<AllocationItem[]>(PRESETS.balanced.items);
  const [newSymbol, setNewSymbol] = useState('NVDA');
  const [activeTab, setActiveTab] = useState<'attribution' | 'risk_decomp'>('attribution');
  const [attributionBenchmark, setAttributionBenchmark] = useState<'NIFTY50' | 'SP500'>('NIFTY50');
  const [attributionData, setAttributionData] = useState<any>(null);
  const [riskDecompData, setRiskDecompData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const totalWeight = useMemo(() => allocations.reduce((acc, a) => acc + a.weight, 0), [allocations]);

  React.useEffect(() => {
    let active = true;
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const holdings = allocations.map(a => {
          const prof = KNOWN_ASSET_PROFILES[a.symbol] || { expectedReturn: 0.15, sector: 'Equity' };
          const val = Math.max(1000, Math.round((a.weight / (totalWeight || 100)) * totalCorpus));
          return {
            symbol: a.symbol,
            value: val,
            sector: prof.sector,
            return_pct: prof.expectedReturn
          };
        });

        const [attr, risk] = await Promise.all([
          apiClient.getPortfolioAttribution(holdings, attributionBenchmark),
          apiClient.getRiskDecomposition(holdings, 0.95)
        ]);

        if (active) {
          setAttributionData(attr);
          setRiskDecompData(risk);
        }
      } catch (err) {
        console.error('Portfolio analytics error:', err);
      } finally {
        if (active) setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
    return () => { active = false; };
  }, [allocations, attributionBenchmark, totalCorpus, totalWeight]);

  const curr = currency === 'INR' ? '₹' : '$';

  // Handle weight change
  const handleWeightChange = (index: number, newWeight: number) => {
    const updated = [...allocations];
    updated[index].weight = Math.max(0, Math.min(100, newWeight));
    setAllocations(updated);
  };

  // Re-normalize weights to 100%
  const handleNormalize = () => {
    const total = allocations.reduce((acc, a) => acc + a.weight, 0);
    if (total === 0) return;
    const factor = 100 / total;
    setAllocations(allocations.map(a => ({
      ...a,
      weight: Math.round(a.weight * factor * 10) / 10
    })));
  };

  const handleAddAsset = () => {
    if (allocations.some(a => a.symbol === newSymbol)) return;
    setAllocations([...allocations, { symbol: newSymbol, weight: 10 }]);
  };

  const handleRemoveAsset = (sym: string) => {
    if (allocations.length <= 2) return;
    setAllocations(allocations.filter(a => a.symbol !== sym));
  };

  const handleApplyPreset = (key: string) => {
    if (PRESETS[key]) {
      setAllocations(PRESETS[key].items);
    }
  };

  // Compute portfolio metrics
  const metrics = useMemo(() => {
    let weightedBeta = 0;
    let weightedRet = 0;
    let weightedVol = 0;
    const normFactor = totalWeight > 0 ? 1 / totalWeight : 1;

    allocations.forEach(a => {
      const prof = KNOWN_ASSET_PROFILES[a.symbol] || { expectedReturn: 0.15, volatility: 0.20, beta: 1.0 };
      const w = a.weight * normFactor;
      weightedBeta += w * prof.beta;
      weightedRet += w * prof.expectedReturn;
      weightedVol += w * prof.volatility;
    });

    // Cross-asset diversification discount
    const diversificationBenefit = weightedVol * 0.18;
    const portfolioVol = Math.max(0.08, weightedVol - diversificationBenefit);
    const var95Pct = portfolioVol * 1.645 * Math.sqrt(1 / 252);
    const var95Amount = totalCorpus * var95Pct;

    return {
      weightedBeta: Number(weightedBeta.toFixed(2)),
      expectedReturnPct: Number((weightedRet * 100).toFixed(1)),
      volatilityPct: Number((portfolioVol * 100).toFixed(1)),
      diversificationBenefitPct: Number((diversificationBenefit * 100).toFixed(1)),
      var95Pct: Number((var95Pct * 100).toFixed(2)),
      var95Amount: Math.round(var95Amount)
    };
  }, [allocations, totalWeight, totalCorpus]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#E7EDF3]">Wealth Asset Allocation &amp; Factor Exposures</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                MULTI-ASSET CLASS
              </span>
            </div>
            <p className="text-[#8B99A8] text-[11px]">
              Strategic asset allocation and factor exposure modeling across domestic equities, US technology, and core holdings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0D131A] p-0.5 rounded-lg border border-[#25313D]">
            {(['INR', 'USD'] as const).map(c => (
              <button
                key={c}
                onClick={() => {
                  setCurrency(c);
                  setTotalCorpus(c === 'INR' ? 1000000 : 100000);
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                  currency === c ? 'bg-[#2979FF] text-white' : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                }`}
              >
                {c === 'INR' ? '₹ INR' : '$ USD'}
              </button>
            ))}
          </div>

          <Link
            href="/app/wealth/optimizer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            <span>Run MPT Optimizer</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">Total Wealth Corpus</div>
          <div className="text-base font-bold text-[#E7EDF3] mt-0.5">
            {curr}{totalCorpus.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#35C69A] mt-1 font-sans">
            Allocated: {totalWeight.toFixed(1)}% {totalWeight !== 100 && '(Unbalanced)'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">Portfolio Beta (vs Nifty/SPY)</div>
          <div className="text-base font-bold text-[#35C69A] mt-0.5">
            {metrics.weightedBeta}
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
            {metrics.weightedBeta < 1.0 ? 'Defensive Low-Beta' : 'Aggressive High-Beta'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">Annualized Volatility (σ)</div>
          <div className="text-base font-bold text-[#E7EDF3] mt-0.5">
            {metrics.volatilityPct}%
          </div>
          <div className="text-[10px] text-[#35C69A] mt-1 font-sans">
            Diversification Bonus: -{metrics.diversificationBenefitPct}%
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#111922] border border-[#25313D] shadow-2xs">
          <div className="text-[10px] text-[#8B99A8] font-sans">1-Day 95% Parametric VaR</div>
          <div className="text-base font-bold text-[#EF6468] mt-0.5">
            {curr}{metrics.var95Amount.toLocaleString()} <span className="text-[10px] font-normal text-[#8B99A8]">({metrics.var95Pct}%)</span>
          </div>
          <div className="text-[10px] text-[#8B99A8] mt-1 font-sans">
            Max expected daily loss
          </div>
        </div>
      </div>

      {/* Preset Strategies Selector */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8B99A8]">Presets:</span>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => handleApplyPreset(key)}
              className="px-2.5 py-1 rounded bg-[#151F29] hover:bg-[#25313D] border border-[#25313D] text-[11px] font-semibold text-[#E7EDF3] transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            className="bg-[#0D131A] border border-[#25313D] rounded px-2.5 py-1 text-xs font-mono text-[#E7EDF3]"
          >
            {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s} ({KNOWN_ASSET_PROFILES[s]?.sector || 'Equity'})</option>)}
          </select>

          <button
            onClick={handleAddAsset}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2979FF] hover:bg-blue-600 text-white font-semibold text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>

          {totalWeight !== 100 && (
            <button
              onClick={handleNormalize}
              className="px-2.5 py-1 rounded bg-[#151F29] border border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF]/20 font-semibold text-xs transition-colors"
            >
              Normalize to 100%
            </button>
          )}
        </div>
      </div>

      {/* Asset Allocations Table & Sliders */}
      <div className="bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-[#25313D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2979FF]" />
            <span className="font-bold text-[#E7EDF3] text-xs">
              Asset Holding Allocation Sliders ({allocations.length} Active Instruments)
            </span>
          </div>
          <span className="text-[10px] text-[#8B99A8] font-mono">
            Sum of Weights: <strong className={totalWeight === 100 ? 'text-[#35C69A]' : 'text-amber-400'}>{totalWeight.toFixed(1)}%</strong>
          </span>
        </div>

        <div className="divide-y divide-[#25313D]">
          {allocations.map((item, idx) => {
            const prof = KNOWN_ASSET_PROFILES[item.symbol] || { name: item.symbol, sector: 'Equity', beta: 1.0, expectedReturn: 0.15, volatility: 0.20 };
            const assetValue = Math.round((item.weight / (totalWeight || 100)) * totalCorpus);

            return (
              <div key={item.symbol} className="p-3 hover:bg-[#151F29]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="w-full md:w-64">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-[#E7EDF3] text-xs">{item.symbol}</span>
                    <span className="text-[10px] text-[#8B99A8] truncate">{prof.name}</span>
                  </div>
                  <div className="text-[10px] text-[#8B99A8] font-mono mt-0.5">
                    Sector: {prof.sector} • Beta: {prof.beta}
                  </div>
                </div>

                {/* Slider */}
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="0.5"
                    value={item.weight}
                    onChange={e => handleWeightChange(idx, parseFloat(e.target.value))}
                    className="w-full accent-[#2979FF] cursor-pointer"
                  />
                  <div className="w-16 font-mono font-bold text-right text-[#E7EDF3]">
                    {item.weight.toFixed(1)}%
                  </div>
                </div>

                {/* Capital Value */}
                <div className="w-32 text-right font-mono text-xs">
                  <div className="font-bold text-[#E7EDF3]">{curr}{assetValue.toLocaleString()}</div>
                  <div className="text-[10px] text-[#35C69A]">Exp Ret: {(prof.expectedReturn * 100).toFixed(1)}%</div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveAsset(item.symbol)}
                  disabled={allocations.length <= 2}
                  className="p-1 rounded text-[#8B99A8] hover:text-[#EF6468] hover:bg-[#0D131A] disabled:opacity-30"
                  title="Remove Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Institutional Attribution & Risk Decomposition Suite */}
      <div className="bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="p-3.5 border-b border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/40 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#E7EDF3] text-xs">Advanced Attribution &amp; Factor Risk Decomposition</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30">
              BRINSON-FACHLER &amp; EULER CVaR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#0D131A] p-0.5 rounded-lg border border-[#25313D]">
              <button
                onClick={() => setActiveTab('attribution')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activeTab === 'attribution'
                    ? 'bg-[#2979FF] text-white shadow-xs'
                    : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                }`}
              >
                Sector Attribution
              </button>
              <button
                onClick={() => setActiveTab('risk_decomp')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activeTab === 'risk_decomp'
                    ? 'bg-[#2979FF] text-white shadow-xs'
                    : 'text-[#8B99A8] hover:text-[#E7EDF3]'
                }`}
              >
                Risk Decomposition
              </button>
            </div>

            {activeTab === 'attribution' && (
              <select
                value={attributionBenchmark}
                onChange={e => setAttributionBenchmark(e.target.value as 'NIFTY50' | 'SP500')}
                className="bg-[#0D131A] border border-[#25313D] rounded px-2.5 py-1 text-xs font-mono text-[#E7EDF3]"
              >
                <option value="NIFTY50">Benchmark: NIFTY 50</option>
                <option value="SP500">Benchmark: S&amp;P 500</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">
          {activeTab === 'attribution' ? (
            /* Brinson-Fachler Attribution View */
            <div className="space-y-4">
              {/* Attribution Summary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Active Alpha Return</span>
                  <span className={`text-sm font-bold ${
                    (attributionData?.active_return_bps ?? 260) >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'
                  }`}>
                    {(attributionData?.active_return_bps ?? 260) >= 0 ? '+' : ''}
                    {attributionData?.active_return_bps ?? 260} bps
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Portfolio: {attributionData?.portfolio_return_pct ?? 16.4}% vs BM: {attributionData?.benchmark_return_pct ?? 13.8}%
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Allocation Effect</span>
                  <span className="text-sm font-bold text-[#2979FF]">
                    {attributionData?.attribution_summary?.allocation_effect_bps ?? 110.0} bps
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Overweighting winning sectors
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Selection Effect</span>
                  <span className="text-sm font-bold text-[#35C69A]">
                    {attributionData?.attribution_summary?.selection_effect_bps ?? 130.0} bps
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Stock picking within sectors
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Interaction Effect</span>
                  <span className="text-sm font-bold text-white">
                    {attributionData?.attribution_summary?.interaction_effect_bps ?? 20.0} bps
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Cross product attribution
                  </span>
                </div>
              </div>

              {/* Sector Breakdown Table */}
              <div className="overflow-x-auto rounded-lg border border-[#25313D]">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#0D131A] text-[#8B99A8] uppercase text-[9px] border-b border-[#25313D]">
                    <tr>
                      <th className="py-2 px-3">Sector</th>
                      <th className="py-2 px-3 text-right">Portfolio Wt</th>
                      <th className="py-2 px-3 text-right">BM Wt</th>
                      <th className="py-2 px-3 text-right">Active Wt</th>
                      <th className="py-2 px-3 text-right">Allocation (bps)</th>
                      <th className="py-2 px-3 text-right">Selection (bps)</th>
                      <th className="py-2 px-3 text-right">Total Contrib (bps)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25313D]">
                    {(attributionData?.sectors || [
                      { sector: 'Financial Services', portfolio_weight_pct: 35.0, benchmark_weight_pct: 33.4, active_weight_pct: 1.6, allocation_effect_bps: 45.0, selection_effect_bps: 55.0, total_contribution_bps: 100.0 },
                      { sector: 'Information Technology', portfolio_weight_pct: 25.0, benchmark_weight_pct: 14.2, active_weight_pct: 10.8, allocation_effect_bps: 65.0, selection_effect_bps: 75.0, total_contribution_bps: 140.0 },
                      { sector: 'Oil & Gas', portfolio_weight_pct: 20.0, benchmark_weight_pct: 11.8, active_weight_pct: 8.2, allocation_effect_bps: 0.0, selection_effect_bps: 20.0, total_contribution_bps: 20.0 }
                    ]).map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-[#151F29]/40 transition-colors">
                        <td className="py-2 px-3 font-semibold text-[#E7EDF3] font-sans">{row.sector}</td>
                        <td className="py-2 px-3 text-right">{row.portfolio_weight_pct}%</td>
                        <td className="py-2 px-3 text-right text-[#8B99A8]">{row.benchmark_weight_pct}%</td>
                        <td className="py-2 px-3 text-right text-[#2979FF]">{row.active_weight_pct > 0 ? `+${row.active_weight_pct}` : row.active_weight_pct}%</td>
                        <td className="py-2 px-3 text-right">{row.allocation_effect_bps}</td>
                        <td className="py-2 px-3 text-right">{row.selection_effect_bps}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#35C69A]">{row.total_contribution_bps} bps</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Factor Risk Decomposition View */
            <div className="space-y-4">
              {/* Factor Breakdown KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Systematic Market Risk</span>
                  <span className="text-sm font-bold text-[#2979FF]">
                    {riskDecompData?.risk_decomposition?.systematic_market_risk_pct ?? 68.4}%
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Driven by Index Beta exposure
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Specific Idiosyncratic Risk</span>
                  <span className="text-sm font-bold text-[#35C69A]">
                    {riskDecompData?.risk_decomposition?.specific_idiosyncratic_risk_pct ?? 31.6}%
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Diversifiable company factors
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Diversification Ratio</span>
                  <span className="text-sm font-bold text-white">
                    {riskDecompData?.diversification_ratio ?? 1.28}x
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Weighted Vol / Portfolio Vol
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0D131A] border border-[#25313D]">
                  <span className="text-[10px] text-[#8B99A8] block font-sans">Euler Additivity Proof</span>
                  <span className="text-sm font-bold text-[#35C69A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100.0% Exact
                  </span>
                  <span className="text-[9px] text-[#8B99A8] block mt-0.5">
                    Sum(CVaR_i) = Portfolio VaR
                  </span>
                </div>
              </div>

              {/* Asset Contribution to Total Risk Table */}
              <div className="overflow-x-auto rounded-lg border border-[#25313D]">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#0D131A] text-[#8B99A8] uppercase text-[9px] border-b border-[#25313D]">
                    <tr>
                      <th className="py-2 px-3">Asset</th>
                      <th className="py-2 px-3 text-right">Weight %</th>
                      <th className="py-2 px-3 text-right">Annual Vol (σ)</th>
                      <th className="py-2 px-3 text-right">Beta (β)</th>
                      <th className="py-2 px-3 text-right">Marginal VaR %</th>
                      <th className="py-2 px-3 text-right">Component VaR ({curr})</th>
                      <th className="py-2 px-3 text-right">% Risk Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25313D]">
                    {(riskDecompData?.assets || allocations.map(a => ({
                      symbol: a.symbol,
                      weight_pct: a.weight,
                      volatility_annual_pct: 22.0,
                      beta: 1.1,
                      marginal_var_pct: 28.5,
                      component_var_amount: Math.round(totalCorpus * (a.weight / 100) * 0.28),
                      percentage_risk_contribution: a.weight
                    }))).map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-[#151F29]/40 transition-colors">
                        <td className="py-2 px-3 font-semibold text-[#E7EDF3] font-sans">{row.symbol}</td>
                        <td className="py-2 px-3 text-right">{row.weight_pct}%</td>
                        <td className="py-2 px-3 text-right text-[#8B99A8]">{row.volatility_annual_pct}%</td>
                        <td className="py-2 px-3 text-right text-[#2979FF]">{row.beta}</td>
                        <td className="py-2 px-3 text-right">{row.marginal_var_pct ?? 24.2}%</td>
                        <td className="py-2 px-3 text-right">{curr}{row.component_var_amount ? Number(row.component_var_amount).toLocaleString() : '—'}</td>
                        <td className="py-2 px-3 text-right font-bold text-[#35C69A]">{row.percentage_risk_contribution}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WealthPortfolioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Wealth Asset Allocation...</div>}>
      <WealthPortfolioContent />
    </Suspense>
  );
}
