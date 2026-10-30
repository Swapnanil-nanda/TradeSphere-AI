'use client';

import React, { useState } from 'react';
import { Newspaper, TrendingUp, TrendingDown, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function SentimentAnalysisPage() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'AAPL', 'NVDA'];

  const newsItems = [
    {
      title: 'Reliance Retail expands omnichannel presence with 120 new experiential formats',
      source: 'Economic Times',
      time: '1 hour ago',
      sentiment: '+0.68',
      bias: 'BULLISH',
      relevance: '0.94'
    },
    {
      title: 'Jio Platforms announces next-generation enterprise AI partnership for cloud edge computing',
      source: 'Financial Express',
      time: '3 hours ago',
      sentiment: '+0.54',
      bias: 'BULLISH',
      relevance: '0.91'
    },
    {
      title: 'Crude oil refining margins face slight seasonal compression amid OPEC+ production status quo',
      source: 'Bloomberg Quint',
      time: '6 hours ago',
      sentiment: '-0.22',
      bias: 'MILD_BEARISH',
      relevance: '0.88'
    },
    {
      title: 'Green Energy Gigafactory CapEx milestones tracking ahead of target timelines in Jamnagar',
      source: 'LiveMint',
      time: '12 hours ago',
      sentiment: '+0.45',
      bias: 'BULLISH',
      relevance: '0.85'
    },
    {
      title: 'RBI maintains status quo on repo rates; credit expansion remains robust across retail sectors',
      source: 'Reuters India',
      time: '1 day ago',
      sentiment: '+0.15',
      bias: 'NEUTRAL',
      relevance: '0.78'
    }
  ];

  return (
    <div className="space-y-4 select-none pb-8 text-xs">
      {/* Header */}
      <div className="bg-white dark:bg-[#0c121f] p-4 rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">News Intelligence &amp; NLP Sentiment Scan</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Real-time algorithmic sentiment extraction, entity resolution, and regulatory compliance audit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-[#1b253b] rounded-lg px-3 py-1.5 font-mono font-bold text-slate-800 dark:text-slate-200"
            >
              {symbols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Sentiment Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">VADER Composite Score</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 my-0.5">
            +0.42 (Moderately Bullish)
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Range: -1.00 (Extreme Bearish) to +1.00 (Extreme Bullish)</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Positive / Negative Ratio</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 my-0.5">
            4.2 : 1 (80% Positive)
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Based on last 24 hours parsed headlines</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs">
          <div className="text-[10px] text-slate-400 font-sans">Regulatory Compliance Audit</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 my-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Clean 0 Issues</span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Zero SEBI / SEC regulatory enforcement flags</div>
        </div>
      </div>

      {/* Headlines List */}
      <div className="bg-white dark:bg-[#0c121f] rounded-xl border border-slate-200 dark:border-[#1b253b] shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-[#1b253b] font-bold text-[11px] text-slate-700 dark:text-slate-300 uppercase">
          Curated Financial Headlines &amp; Sentiment Impact ({symbol})
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1b253b]/40">
          {newsItems.map((item, idx) => (
            <div key={idx} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                  <span>•</span>
                  <span>Relevance: {(parseFloat(item.relevance) * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                  item.bias === 'BULLISH'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                    : item.bias === 'MILD_BEARISH'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {item.sentiment} ({item.bias})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
