'use client';

import React, { useState } from 'react';
import { BookmarkCheck, Download, Trash2, ExternalLink, Search, FileText, ShieldCheck } from 'lucide-react';
import { appConfig } from '../../../../lib/config';

interface SavedDossier {
  id: string;
  symbol: string;
  name: string;
  date: string;
  verdict: string;
  confidence: number;
  evidencePassed: boolean;
  notes: string;
}

export default function SavedResearchPage() {
  const [search, setSearch] = useState('');
  const [dossiers, setDossiers] = useState<SavedDossier[]>([
    {
      id: 'rep_rel_01',
      symbol: 'RELIANCE',
      name: 'Reliance Industries Limited',
      date: '2026-10-30',
      verdict: 'ACCUMULATE_ON_PULLBACK',
      confidence: 78,
      evidencePassed: true,
      notes: 'Strong support above 20-EMA and VWAP. Sentiment +0.42, 10-day forward median ₹3,042.'
    },
    {
      id: 'rep_tcs_02',
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      date: '2026-10-29',
      verdict: 'MOMENTUM_BREAKOUT',
      confidence: 82,
      evidencePassed: true,
      notes: 'Ascending base breakout above ₹4,100 with favorable Sharpe ratio 1.94.'
    },
    {
      id: 'rep_infy_03',
      symbol: 'INFY',
      name: 'Infosys Limited',
      date: '2026-10-28',
      verdict: 'DEFENSIVE_HOLD',
      confidence: 65,
      evidencePassed: true,
      notes: 'Consolidation testing major support zone ₹1,880. VaR 1.72%.'
    },
    {
      id: 'rep_nvda_04',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      date: '2026-10-27',
      verdict: 'HIGH_VOLATILITY_ACCUMULATE',
      confidence: 84,
      evidencePassed: true,
      notes: 'Black-Scholes implied volatility 34%. Recommended 1% risk position sizing.'
    }
  ]);

  const filtered = dossiers.filter(d => 
    d.symbol.toLowerCase().includes(search.toLowerCase()) || 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.verdict.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDossiers(dossiers.filter(d => d.id !== id));
  };

  const handleDownloadPDF = (id: string) => {
    const pdfUrl = `${appConfig.quantApiUrl || 'http://localhost:8100'}/api/v1/quant/reports/${id}?format=pdf`;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Saved Quantitative Research Dossiers</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Archived multi-agent analyses with verified evidence trails and institutional PDF generation.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol, verdict..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-slate-50 dark:bg-[#070b14] text-slate-500 font-sans border-b border-slate-200 dark:border-[#1b253b]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Instrument</th>
                <th className="py-2.5 px-3 font-semibold">Date Archived</th>
                <th className="py-2.5 px-3 font-semibold">Verdict</th>
                <th className="py-2.5 px-3 font-semibold">Confidence</th>
                <th className="py-2.5 px-3 font-semibold">Evidence Audit</th>
                <th className="py-2.5 px-3 font-semibold">Summary Notes</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No archived dossiers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{d.symbol}</div>
                      <div className="text-[10px] text-slate-400">{d.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{d.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-500/20 text-[10px]">
                        {d.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {d.confidence}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified 18/18</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {d.notes}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadPDF(d.id)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Dossier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
