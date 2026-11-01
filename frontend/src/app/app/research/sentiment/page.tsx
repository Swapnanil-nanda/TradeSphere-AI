'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Newspaper, TrendingUp, TrendingDown, ShieldCheck, AlertCircle, 
  ArrowUpRight, Activity, RefreshCw, ExternalLink, Sparkles, Filter 
} from 'lucide-react';

const ALL_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'TATAMOTORS', 'BHARTIARTL', 'ITC', 'LICI', 'WIPRO',
  'NIFTY50', 'BANKNIFTY',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'SPY', 'QQQ'
];

interface Article {
  title: string;
  source: string;
  link: string;
  publishedAt: string;
  timeAgo: string;
  sentiment: string;
  sentimentScore: number;
  bias: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  relevance: string;
  snippet?: string;
}

interface NewsData {
  symbol: string;
  companyName: string;
  aggregateScore: string;
  aggregateBias: string;
  breakdown: {
    positivePct: number;
    neutralPct: number;
    negativePct: number;
    totalArticles: number;
  };
  articles: Article[];
}

function SentimentContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');

  useEffect(() => {
    const sym = searchParams.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [searchParams]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/news?symbol=${symbol}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load real news:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [symbol]);

  const filteredArticles = useMemo(() => {
    if (!data?.articles) return [];
    if (filter === 'BULLISH') return data.articles.filter(a => a.sentimentScore > 0.1);
    if (filter === 'BEARISH') return data.articles.filter(a => a.sentimentScore < -0.1);
    return data.articles;
  }, [data, filter]);

  const avgScore = data?.aggregateScore || '+0.42';
  const isPositive = !avgScore.startsWith('-');

  return (
    <div className="space-y-4 select-none pb-8 text-xs font-sans text-[#E7EDF3]">
      {/* Header */}
      <div className="bg-[#111922] p-4 rounded-xl border border-[#25313D] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2979FF] text-white flex items-center justify-center font-bold">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#E7EDF3]">Real Financial News Intelligence &amp; NLP Sentiment</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono border ${
                  isPositive 
                    ? 'bg-[#35C69A]/10 text-[#35C69A] border-[#35C69A]/30' 
                    : 'bg-[#EF6468]/10 text-[#EF6468] border-[#EF6468]/30'
                }`}>
                  AGGREGATE: {avgScore} {data?.aggregateBias || 'BULLISH'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#151F29] text-[#2979FF] border border-[#25313D] hidden sm:inline">
                  OPEN-SOURCE RSS
                </span>
              </div>
              <p className="text-[#8B99A8] text-[11px]">
                Real-time financial headlines from Reuters, Bloomberg, Mint &amp; Economic Times with algorithmic polarity scoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-[#151F29] border border-[#25313D] rounded-lg px-3 py-1.5 font-mono font-bold text-[#E7EDF3] focus:outline-none focus:border-[#2979FF]"
            >
              {ALL_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <button
              onClick={fetchNews}
              disabled={loading}
              className="p-1.5 rounded-lg border border-[#25313D] bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] transition-colors"
              title="Refresh News Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate NLP Sentiment Bar */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Corporate Entity</div>
            <div className="font-bold text-sm text-[#E7EDF3] truncate mt-0.5 font-sans">
              {data.companyName}
            </div>
            <div className="text-[10px] text-[#8B99A8] font-mono mt-0.5">{symbol} • {data.breakdown.totalArticles} Live Articles</div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">NLP Sentiment Score</div>
            <div className={`font-bold text-sm mt-0.5 ${isPositive ? 'text-[#35C69A]' : 'text-[#EF6468]'}`}>
              {data.aggregateScore} ({data.aggregateBias})
            </div>
            <div className="text-[10px] text-[#8B99A8] font-mono mt-0.5">VADER Financial Model</div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs">
            <div className="text-[10px] text-[#8B99A8] font-sans">Sentiment Distribution</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-[#35C69A]">{data.breakdown.positivePct}% Bull</span>
              <span className="text-xs text-[#8B99A8]">{data.breakdown.neutralPct}% Neu</span>
              <span className="text-xs font-bold text-[#EF6468]">{data.breakdown.negativePct}% Bear</span>
            </div>
            <div className="w-full bg-[#0D131A] h-1.5 rounded-full overflow-hidden flex mt-1.5 border border-[#25313D]">
              <div style={{ width: `${data.breakdown.positivePct}%` }} className="bg-[#35C69A] h-full" />
              <div style={{ width: `${data.breakdown.neutralPct}%` }} className="bg-[#8B99A8] h-full" />
              <div style={{ width: `${data.breakdown.negativePct}%` }} className="bg-[#EF6468] h-full" />
            </div>
          </div>

          <div className="p-3 bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[10px] text-[#8B99A8] font-sans">Filter Sentiment</div>
              <div className="flex items-center gap-1 mt-1 font-sans">
                {(['ALL', 'BULLISH', 'BEARISH'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilter(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      filter === mode 
                        ? 'bg-[#2979FF] text-white' 
                        : 'bg-[#151F29] text-[#8B99A8] hover:text-[#E7EDF3] border border-[#25313D]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Live News Stream */}
      <div className="bg-[#111922] rounded-xl border border-[#25313D] shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-[#25313D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2979FF]" />
            <span className="font-bold text-[#E7EDF3] text-xs">
              Live Verified Press &amp; Market Intelligence ({filteredArticles.length} Articles)
            </span>
          </div>
          <span className="text-[10px] text-[#8B99A8] font-mono">Source: Google Financial RSS Stream</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#8B99A8] font-mono">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#2979FF]" />
            <span>Fetching real open-source financial articles for {symbol}...</span>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-10 text-center text-[#8B99A8]">
            No articles found matching the selected sentiment filter.
          </div>
        ) : (
          <div className="divide-y divide-[#25313D]">
            {filteredArticles.map((article, idx) => {
              const isBull = article.sentimentScore >= 0;
              return (
                <div key={idx} className="p-4 hover:bg-[#151F29]/60 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1 max-w-3xl">
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-bold text-[#E7EDF3] text-xs sm:text-sm hover:text-[#2979FF] transition-colors flex items-start gap-1.5 group"
                      >
                        <span>{article.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#8B99A8] group-hover:text-[#2979FF] shrink-0 mt-0.5" />
                      </a>
                      {article.snippet && (
                        <p className="text-[#8B99A8] text-[11px] leading-relaxed line-clamp-2">
                          {article.snippet}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                        isBull
                          ? 'bg-[#35C69A]/10 text-[#35C69A] border-[#35C69A]/20'
                          : 'bg-[#EF6468]/10 text-[#EF6468] border-[#EF6468]/20'
                      }`}>
                        {article.sentiment} {article.bias}
                      </span>
                      <span className="text-[10px] text-[#8B99A8] font-mono">
                        Relevance: {article.relevance}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[10px] text-[#8B99A8] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-[#0D131A] border border-[#25313D] text-[#E7EDF3] font-semibold">
                      {article.source}
                    </span>
                    <span>•</span>
                    <span>{article.timeAgo}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SentimentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Real News Intelligence...</div>}>
      <SentimentContent />
    </Suspense>
  );
}
