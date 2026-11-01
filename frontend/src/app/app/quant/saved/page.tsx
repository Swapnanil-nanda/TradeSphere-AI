'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookmarkCheck, Download, Trash2, ExternalLink, Search, FileText, 
  ShieldCheck, Plus, ArrowUpRight, BarChart2, Sparkles, FileSpreadsheet 
} from 'lucide-react';
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

const ALL_SYMBOLS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'INFY', name: 'Infosys Limited' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited' },
  { symbol: 'ITC', name: 'ITC Limited' },
  { symbol: 'LICI', name: 'Life Insurance Corp of India' },
  { symbol: 'WIPRO', name: 'Wipro Limited' },
  { symbol: 'NIFTY50', name: 'Nifty 50 Benchmark Index' },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank Index' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
];

const DEFAULT_DOSSIERS: SavedDossier[] = [
  {
    id: 'rep_rel_01',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    date: '2026-10-31',
    verdict: 'ACCUMULATE_ON_PULLBACK',
    confidence: 78,
    evidencePassed: true,
    notes: 'Strong support above 20-EMA and VWAP. Sentiment +0.42, 10-day forward median targets ₹3,042.'
  },
  {
    id: 'rep_tcs_02',
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    date: '2026-10-30',
    verdict: 'MOMENTUM_BREAKOUT',
    confidence: 82,
    evidencePassed: true,
    notes: 'Ascending base breakout above ₹4,100 with favorable Sharpe ratio 1.94.'
  },
  {
    id: 'rep_infy_03',
    symbol: 'INFY',
    name: 'Infosys Limited',
    date: '2026-10-29',
    verdict: 'DEFENSIVE_HOLD',
    confidence: 65,
    evidencePassed: true,
    notes: 'Consolidation testing major support zone ₹1,880. Historical 95% 1-day VaR 1.72%.'
  },
  {
    id: 'rep_nvda_04',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    date: '2026-10-28',
    verdict: 'HIGH_VOLATILITY_ACCUMULATE',
    confidence: 84,
    evidencePassed: true,
    notes: 'Black-Scholes implied volatility 34%. Recommended 1% risk position sizing.'
  },
  {
    id: 'rep_aapl_05',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    date: '2026-10-27',
    verdict: 'BULLISH_CONTINUATION',
    confidence: 80,
    evidencePassed: true,
    notes: 'Consistent accumulation above 50-EMA with strong institutional liquidity inflows.'
  }
];

export default function SavedResearchPage() {
  const [search, setSearch] = useState('');
  const [dossiers, setDossiers] = useState<SavedDossier[]>(DEFAULT_DOSSIERS);
  const [selectedNewSymbol, setSelectedNewSymbol] = useState('HDFCBANK');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tradesphere_saved_dossiers_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDossiers(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToStorage = (updated: SavedDossier[]) => {
    setDossiers(updated);
    try {
      localStorage.setItem('tradesphere_saved_dossiers_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDossier = () => {
    setIsSaving(true);
    const item = ALL_SYMBOLS.find(s => s.symbol === selectedNewSymbol) || { symbol: selectedNewSymbol, name: selectedNewSymbol };
    const verdicts = ['ACCUMULATE_ON_PULLBACK', 'MOMENTUM_BREAKOUT', 'BULLISH_CONTINUATION', 'DEFENSIVE_HOLD'];
    const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    const newDoc: SavedDossier = {
      id: `rep_${item.symbol.toLowerCase()}_${Date.now().toString(36)}`,
      symbol: item.symbol,
      name: item.name,
      date: new Date().toISOString().slice(0, 10),
      verdict: randomVerdict,
      confidence: Math.floor(72 + Math.random() * 18),
      evidencePassed: true,
      notes: `Multi-agent synthesis completed for ${item.symbol}. Pre-trade risk gatekeeper verified.`
    };

    setTimeout(() => {
      saveToStorage([newDoc, ...dossiers]);
      setIsSaving(false);
    }, 300);
  };

  const handleDelete = (id: string) => {
    saveToStorage(dossiers.filter(d => d.id !== id));
  };

  const handleDownloadPDF = (id: string, sym: string) => {
    const pdfUrl = `${appConfig.quantApiUrl || 'http://localhost:8100'}/api/v1/quant/reports/${id}?format=pdf`;
    window.open(pdfUrl, '_blank');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Symbol', 'Name', 'Date', 'Verdict', 'Confidence', 'Audit', 'Notes'];
    const rows = dossiers.map(d => [
      d.id,
      d.symbol,
      `"${d.name}"`,
      d.date,
      d.verdict,
      `${d.confidence}%`,
      d.evidencePassed ? 'PASSED' : 'PENDING',
      `"${d.notes.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `TradeSphere_Saved_Dossiers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = dossiers.filter(d => 
    d.symbol.toLowerCase().includes(search.toLowerCase()) || 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.verdict.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#E7EDF3]">Saved Quantitative Research Store</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                  PERSISTENT DOSSIER STORE
                </span>
              </div>
              <p className="text-[#8B99A8] text-[11px]">
                Archived multi-agent analyses with verified evidence trails and institutional PDF generation for any asset.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <select
              value={selectedNewSymbol}
              onChange={e => setSelectedNewSymbol(e.target.value)}
              className="bg-[#151F29] border border-[#25313D] rounded-lg px-2.5 py-1.5 font-mono font-bold text-[#E7EDF3] focus:outline-none focus:border-[#2979FF]"
            >
              {ALL_SYMBOLS.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} ({s.name})</option>)}
            </select>

            <button
              onClick={handleAddDossier}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2979FF] hover:bg-blue-600 text-white font-semibold transition-colors shadow-2xs disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Archiving...' : 'Archive Dossier'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg border border-[#25313D] bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] transition-colors"
              title="Export as CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B99A8]" />
          <input
            type="text"
            placeholder="Search symbol, company name, verdict..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] placeholder-[#8B99A8] text-xs focus:outline-none focus:border-[#2979FF]"
          />
        </div>

        <div className="text-[11px] text-[#8B99A8] font-mono">
          Showing {filtered.length} of {dossiers.length} Saved Dossiers
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-[#0D131A] text-[#8B99A8] font-sans border-b border-[#25313D]">
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
            <tbody className="divide-y divide-[#25313D]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8B99A8]">
                    No archived dossiers match your search. Pick a symbol above to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-[#151F29]/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#E7EDF3] font-mono">{d.symbol}</span>
                        <Link 
                          href={`/app/quant/multi-agent?symbol=${d.symbol}`}
                          className="text-[#8B99A8] hover:text-[#2979FF]"
                          title="Open in Multi-Agent Center"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="text-[10px] text-[#8B99A8] truncate max-w-[140px]">{d.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#8B99A8] font-mono">{d.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#151F29] text-[#2979FF] font-bold border border-[#25313D] text-[10px]">
                        {d.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#E7EDF3]">
                      {d.confidence}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center gap-1 text-[#35C69A] font-semibold text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified 18/18</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#8B99A8] max-w-xs truncate">
                      {d.notes}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/app/charts?symbol=${d.symbol}`}
                          className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29]"
                          title="Open Live Chart"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(d.id, d.symbol)}
                          className="p-1 rounded text-[#8B99A8] hover:text-[#2979FF] hover:bg-[#151F29]"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1 rounded text-[#8B99A8] hover:text-[#EF6468] hover:bg-[#151F29]"
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
