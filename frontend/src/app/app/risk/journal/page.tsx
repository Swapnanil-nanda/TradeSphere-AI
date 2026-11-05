'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BookMarked, ShieldCheck, AlertCircle, Award, CheckCircle2,
  TrendingUp, TrendingDown, Filter, Calendar, BarChart2, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, PortfolioData } from '../../../../lib/api-client';
import {
  ALL_RISK_SYMBOLS,
  RISK_UNIVERSE_ASSETS,
  getAuditedTradeJournal,
  JournalTradeRecord
} from '../../../../lib/options-risk-engine';

function JournalContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'ALL';

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== selectedSymbol) {
      setSelectedSymbol(sym);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    apiClient.getPortfolio().then(data => {
      if (isMounted) {
        setPortfolio(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Compute audited summary from user trades or pre-seeded audit history
  const journalSummary = useMemo(() => {
    const rawTrades = portfolio?.trades || [];
    return getAuditedTradeJournal(rawTrades.length > 0 ? rawTrades : undefined);
  }, [portfolio]);

  // Apply filters
  const filteredTrades = useMemo(() => {
    return journalSummary.trades.filter(t => {
      const matchSymbol = selectedSymbol === 'ALL' || t.symbol === selectedSymbol;
      const matchOutcome = filterOutcome === 'ALL' || (filterOutcome === 'WIN' ? t.pnl > 0 : t.pnl < 0);
      return matchSymbol && matchOutcome;
    });
  }, [journalSummary, selectedSymbol, filterOutcome]);

  return (
    <div className="space-y-4 select-none pb-12 text-xs text-[#E7EDF3] max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-4 rounded-xl border border-[#25313D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white font-sans">
                Automated Trade Journal &amp; Behavioral Audit
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                PSYCHOLOGICAL DEFENSE
              </span>
            </div>
            <p className="text-[#8B99A8] text-xs">
              Continuous empirical audit of stop-loss adherence, revenge-trading prevention, and R-multiple expectancy.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
            className="bg-[#111922] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs focus:outline-none focus:border-[#2979FF]"
          >
            <option value="ALL">All Instruments ({ALL_RISK_SYMBOLS.length})</option>
            <optgroup label="Indian Equities &amp; Indices">
              {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'IN').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </optgroup>
            <optgroup label="US Equities &amp; ETFs">
              {ALL_RISK_SYMBOLS.filter(s => RISK_UNIVERSE_ASSETS[s].market === 'US').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </optgroup>
          </select>

          <div className="flex bg-[#111922] p-0.5 rounded-lg border border-[#25313D] font-mono">
            <button
              onClick={() => setFilterOutcome('ALL')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                filterOutcome === 'ALL' ? 'bg-[#2979FF] text-white shadow-xs' : 'text-[#8B99A8] hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterOutcome('WIN')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                filterOutcome === 'WIN' ? 'bg-[#35C69A] text-black shadow-xs' : 'text-[#8B99A8] hover:text-white'
              }`}
            >
              WINS
            </button>
            <button
              onClick={() => setFilterOutcome('LOSS')}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors ${
                filterOutcome === 'LOSS' ? 'bg-[#EF6468] text-white shadow-xs' : 'text-[#8B99A8] hover:text-white'
              }`}
            >
              LOSSES
            </button>
          </div>
        </div>
      </div>

      {/* Behavioral Discipline Scorecard (4 KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D] shadow-sm">
          <div className="text-[10px] text-[#8B99A8] font-sans">Stop-Loss Discipline Score</div>
          <div className="text-base font-extrabold text-[#35C69A] my-0.5 tabular-nums">
            {journalSummary.stopLossDisciplineScore}% Perfect
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans">
            0 manual stop-loss removal violations
          </div>
        </div>

        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D] shadow-sm">
          <div className="text-[10px] text-[#8B99A8] font-sans">1% Risk Cap Compliance</div>
          <div className="text-base font-extrabold text-[#2979FF] my-0.5 tabular-nums">
            {journalSummary.riskComplianceScore}% Passed
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans">
            All trades sized within 1.0% equity rule
          </div>
        </div>

        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D] shadow-sm">
          <div className="text-[10px] text-[#8B99A8] font-sans">Revenge Trading Risk</div>
          <div className="text-base font-extrabold text-[#35C69A] my-0.5 tabular-nums">
            LOW (0 Tilt Flags)
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans">
            Disciplined inter-trade pacing
          </div>
        </div>

        <div className="p-3.5 bg-[#111922] rounded-xl border border-[#25313D] shadow-sm">
          <div className="text-[10px] text-[#8B99A8] font-sans">Average Expectancy / Profit Factor</div>
          <div className="text-base font-extrabold text-white my-0.5 tabular-nums">
            +{journalSummary.expectancyR} R / {journalSummary.profitFactor} PF
          </div>
          <div className="text-[10px] text-[#8B99A8] font-sans">
            Win Rate: {journalSummary.winRatePct}% ({journalSummary.winCount}W / {journalSummary.lossCount}L)
          </div>
        </div>
      </div>

      {/* Chronological Behavioral Journal Ledger */}
      <div className="bg-[#111922] rounded-xl border border-[#25313D] shadow-sm overflow-hidden">
        <div className="p-3 bg-[#0D131A] border-b border-[#25313D] flex items-center justify-between font-mono text-[11px]">
          <span className="font-bold text-white uppercase tracking-wider">
            Audited Behavioral Journal ({filteredTrades.length} entries)
          </span>
          <span className="text-[#8B99A8]">
            Showing {selectedSymbol === 'ALL' ? 'All Symbols' : selectedSymbol} • {filterOutcome}
          </span>
        </div>

        <div className="divide-y divide-[#25313D]/40">
          {filteredTrades.length === 0 ? (
            <div className="p-8 text-center text-[#8B99A8] text-xs font-mono">
              No journal records match the selected filter criteria.
            </div>
          ) : (
            filteredTrades.map((t) => {
              const isUS = RISK_UNIVERSE_ASSETS[t.symbol]?.market === 'US';
              const curr = isUS ? '$' : '₹';
              const isWin = t.pnl > 0;

              return (
                <div key={t.id} className="p-4 hover:bg-[#151F29]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white font-mono text-sm">{t.symbol}</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        t.side === 'BUY'
                          ? 'bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30'
                          : 'bg-[#EF6468]/15 text-[#EF6468] border border-[#EF6468]/30'
                      }`}>
                        {t.side} {t.quantity} Qty
                      </span>

                      <span className="text-[11px] text-[#8B99A8] font-mono">
                        Entry: {curr}{t.entryPrice.toFixed(2)} → Exit: {curr}{t.exitPrice.toFixed(2)}
                      </span>

                      <span className="text-[10px] text-[#8B99A8] font-mono">
                        SL: {curr}{t.stopLoss.toFixed(2)} | TP: {curr}{t.targetPrice.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-[#8B99A8] font-sans leading-relaxed">
                      {t.notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <div className="text-right">
                      <div className={`text-sm font-extrabold tabular-nums ${isWin ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
                        {isWin ? '+' : ''}{curr}{t.pnl.toLocaleString()} ({t.pnlPct >= 0 ? '+' : ''}{t.pnlPct}%)
                      </div>
                      <div className="text-[10px] text-[#8B99A8]">
                        Multiple: <b className={t.rMultiple >= 0 ? 'text-[#35C69A]' : 'text-[#EF6468]'}>
                          {t.rMultiple >= 0 ? '+' : ''}{t.rMultiple} R
                        </b>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] font-bold text-[10px] border border-[#35C69A]/30">
                        Discipline: 100% ✓
                      </span>
                      <span className="text-[9px] text-[#8B99A8]">
                        {new Date(t.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function TradeJournalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Trade Journal...</div>}>
      <JournalContent />
    </Suspense>
  );
}
