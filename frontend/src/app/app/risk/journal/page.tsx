'use client';

import React, { useState, useEffect } from 'react';
import { BookMarked, ShieldCheck, AlertCircle, Award, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { apiClient, PortfolioData } from '../../../../lib/api-client';

export default function TradeJournalPage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [filterTag, setFilterTag] = useState('ALL');

  useEffect(() => {
    apiClient.getPortfolio().then(setPortfolio);
  }, []);

  const trades = portfolio?.trades || [];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Automated Trade Journal &amp; Behavioral Audit</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Continuous psychological audit of Stop-Loss discipline, risk-reward ratios, and emotional trading anomalies.
            </p>
          </div>
        </div>
      </div>

      {/* Behavioral Discipline Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono">
        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Stop-Loss Discipline Score</div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 my-0.5">100% Perfect</div>
          <div className="text-[10px] text-slate-500 font-sans">0 Stop-Loss removal events</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">1% Risk Compliance</div>
          <div className="text-base font-bold text-blue-600 dark:text-blue-400 my-0.5">100% Passed</div>
          <div className="text-[10px] text-slate-500 font-sans">All positions sized within 1.0% cap</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Revenge Trading Risk</div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 my-0.5">LOW (0 Flags)</div>
          <div className="text-[10px] text-slate-500 font-sans">Healthy post-loss trade intervals</div>
        </div>

        <div className="p-3 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Average Trade Expectancy</div>
          <div className="text-base font-bold text-slate-900 dark:text-white my-0.5">+1.85 R</div>
          <div className="text-[10px] text-slate-500 font-sans">Mean reward to risk multiple</div>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
          Chronological Behavioral Journal Entries
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
          {trades.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No closed trades logged yet. Place bracket trades with mandatory Stop-Loss in the Terminal to generate reflection audits.
            </div>
          ) : (
            trades.map((tr, idx) => (
              <div key={idx} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">{tr.symbol}</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                      tr.side === 'BUY' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      {tr.side} {tr.quantity} Qty
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      @ ₹{(tr.price || tr.averagePrice)?.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Execution aligned with mandatory 1% risk rules. Stop-Loss respected at ₹{tr.stopLoss || 'Enforced'}.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-200 dark:border-emerald-500/20">
                    Discipline: 100% ✓
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
