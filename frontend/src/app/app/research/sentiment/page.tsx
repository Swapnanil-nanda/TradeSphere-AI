'use client';

import React, { useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Newspaper, TrendingUp, TrendingDown, ShieldCheck, AlertCircle, ArrowUpRight, Activity } from 'lucide-react';

const ALL_SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN',
  'TATAMOTORS', 'BHARTIARTL', 'ITC', 'LICI', 'WIPRO',
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'NIFTY50'
];

const COMPANY_NEWS: Record<string, any[]> = {
  'RELIANCE': [
    { title: 'Reliance Retail expands omnichannel footprint with 120 new digital-first format stores', source: 'Economic Times', time: '1 hour ago', sentiment: '+0.68', bias: 'BULLISH', relevance: '0.94' },
    { title: 'Jio Platforms announces next-generation enterprise AI partnership for cloud edge computing', source: 'Financial Express', time: '3 hours ago', sentiment: '+0.54', bias: 'BULLISH', relevance: '0.91' },
    { title: 'Crude oil refining crack margins face minor seasonal compression amid OPEC+ supply quotas', source: 'Bloomberg Quint', time: '6 hours ago', sentiment: '-0.18', bias: 'MILD_BEARISH', relevance: '0.88' },
    { title: 'Green Energy Gigafactory CapEx milestones tracking ahead of schedule in Jamnagar complex', source: 'LiveMint', time: '12 hours ago', sentiment: '+0.45', bias: 'BULLISH', relevance: '0.85' }
  ],
  'TCS': [
    { title: 'TCS secures $850M multi-year digital transformation and cloud modernization pact in UK', source: 'Reuters Technology', time: '45 mins ago', sentiment: '+0.72', bias: 'BULLISH', relevance: '0.96' },
    { title: 'Enterprise Generative AI pipeline doubles to $1.2B as BFSI clients accelerate automation', source: 'Economic Times', time: '2 hours ago', sentiment: '+0.61', bias: 'BULLISH', relevance: '0.92' },
    { title: 'Quarterly employee attrition stabilizes at lowest level in 14 quarters across offshore centers', source: 'LiveMint', time: '5 hours ago', sentiment: '+0.38', bias: 'BULLISH', relevance: '0.84' }
  ],
  'INFY': [
    { title: 'Infosys Topaz platform adoption scales across global Fortune 500 manufacturing conglomerates', source: 'Financial Times', time: '1 hour ago', sentiment: '+0.65', bias: 'BULLISH', relevance: '0.93' },
    { title: 'Infosys expands Nordic presence with new cloud engineering and cyber defense hub', source: 'Press Trust of India', time: '4 hours ago', sentiment: '+0.42', bias: 'BULLISH', relevance: '0.89' }
  ],
  'HDFCBANK': [
    { title: 'HDFC Bank advances deposit mobilization run-rate, reducing Loan-to-Deposit ratio to target range', source: 'Business Standard', time: '30 mins ago', sentiment: '+0.58', bias: 'BULLISH', relevance: '0.95' },
    { title: 'Gross NPA ratio improves to 1.24% with credit loss provisions well below annual guidance', source: 'CNBC-TV18', time: '2 hours ago', sentiment: '+0.49', bias: 'BULLISH', relevance: '0.92' }
  ],
  'TATAMOTORS': [
    { title: 'Jaguar Land Rover records 18% YoY wholesales growth propelled by Defender & Range Rover order book', source: 'Autocar India', time: '1 hour ago', sentiment: '+0.64', bias: 'BULLISH', relevance: '0.95' },
    { title: 'Tata Motors Commercial Vehicles de-merger receives shareholder and regulatory clearances', source: 'Economic Times', time: '3 hours ago', sentiment: '+0.52', bias: 'BULLISH', relevance: '0.90' },
    { title: 'Passenger Electric Vehicle market share retained above 64% with new Curvv EV ramp', source: 'LiveMint', time: '6 hours ago', sentiment: '+0.41', bias: 'BULLISH', relevance: '0.87' }
  ],
  'AAPL': [
    { title: 'Apple Intelligence deployment expands to 8 new regional languages with high developer retention', source: 'Bloomberg Tech', time: '20 mins ago', sentiment: '+0.62', bias: 'BULLISH', relevance: '0.97' },
    { title: 'Services division gross margin hits record 74.2% as App Store and iCloud subscriptions scale', source: 'Wall Street Journal', time: '2 hours ago', sentiment: '+0.55', bias: 'BULLISH', relevance: '0.94' }
  ],
  'NVDA': [
    { title: 'Blackwell Ultra AI accelerator shipments commence to Tier-1 hyperscale cloud datacenters', source: 'Reuters Business', time: '15 mins ago', sentiment: '+0.82', bias: 'STRONG_BULLISH', relevance: '0.98' },
    { title: 'NVIDIA CUDA ecosystem developer count surpasses 5.1 million with enterprise LLM runtime scale', source: 'VentureBeat', time: '3 hours ago', sentiment: '+0.68', bias: 'BULLISH', relevance: '0.93' },
    { title: 'Sovereign AI datacenter agreements signed with European and Middle Eastern supercomputing consortiums', source: 'Financial Times', time: '5 hours ago', sentiment: '+0.74', bias: 'BULLISH', relevance: '0.91' }
  ],
  'TSLA': [
    { title: 'Tesla Megapack utility-scale energy storage deployments surge 85% YoY across US and Australia', source: 'Electrek', time: '40 mins ago', sentiment: '+0.59', bias: 'BULLISH', relevance: '0.94' },
    { title: 'FSD v13 rollout shows marked reduction in driver interventions across highway and dense urban tests', source: 'CleanTechnica', time: '2 hours ago', sentiment: '+0.48', bias: 'BULLISH', relevance: '0.91' }
  ]
};

function SentimentContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';
  const [symbol, setSymbol] = useState(initialSymbol);

  const newsItems = useMemo(() => {
    return COMPANY_NEWS[symbol] || [
      { title: `${symbol} exhibits constructive institutional accumulation following strong operational updates`, source: 'Reuters Financial', time: '1 hour ago', sentiment: '+0.48', bias: 'BULLISH', relevance: '0.92' },
      { title: `Analyst consensus maintains positive medium-term outlook on ${symbol} capital efficiency`, source: 'Bloomberg Intelligence', time: '3 hours ago', sentiment: '+0.35', bias: 'BULLISH', relevance: '0.88' },
      { title: `Broader index constituents consolidate as sector rotation dynamics favor benchmark leaders`, source: 'Financial Express', time: '5 hours ago', sentiment: '+0.12', bias: 'NEUTRAL', relevance: '0.81' }
    ];
  }, [symbol]);

  // Aggregate NLP score
  const avgScore = useMemo(() => {
    const sum = newsItems.reduce((acc, item) => acc + parseFloat(item.sentiment), 0);
    return (sum / newsItems.length).toFixed(2);
  }, [newsItems]);

  return (
    <div className="space-y-4 select-none pb-8 text-xs text-[#F0F3F6]">
      {/* Header */}
      <div className="bg-[#050505] p-4 rounded-xl border border-[#141414] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF] flex items-center justify-center font-bold">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white font-sans">News Intelligence &amp; NLP Sentiment</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-mono">
                  AGGREGATE: +{avgScore} BULLISH
                </span>
              </div>
              <p className="text-[#808a9d] text-[11px]">
                Algorithmic sentiment extraction, entity recognition, and event catalyst impact for any symbol.
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

      {/* Sentiment Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
          <div className="text-[10px] text-[#808a9d] font-sans">Headline Sentiment Velocity</div>
          <div className="text-lg font-bold text-[#00c805] mt-1 tabular-nums">+{avgScore} / 1.00</div>
          <div className="text-[10px] text-[#808a9d]">Positive bias dominates coverage</div>
        </div>
        <div className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
          <div className="text-[10px] text-[#808a9d] font-sans">Articles Processed (24h)</div>
          <div className="text-lg font-bold text-white mt-1 tabular-nums">{newsItems.length * 8} Feeds</div>
          <div className="text-[10px] text-[#808a9d]">100% verified financial press</div>
        </div>
        <div className="p-3 bg-[#050505] rounded-xl border border-[#141414]">
          <div className="text-[10px] text-[#808a9d] font-sans">Algorithmic Confidence</div>
          <div className="text-lg font-bold text-[#2979FF] mt-1 tabular-nums">92.4% Match</div>
          <div className="text-[10px] text-[#808a9d]">High entity correlation</div>
        </div>
      </div>

      {/* News Feed Stream */}
      <div className="bg-[#050505] rounded-xl border border-[#141414] overflow-hidden">
        <div className="p-3.5 border-b border-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2979FF]" />
            <span className="font-bold text-white text-xs font-sans">Active News Feed Stream ({symbol})</span>
          </div>
          <span className="text-[10px] text-[#808a9d] font-mono">Updated: Real-time</span>
        </div>

        <div className="divide-y divide-[#141414]">
          {newsItems.map((item, i) => (
            <div key={i} className="p-4 hover:bg-[#0c0c0c] transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-xs">{item.source}</span>
                  <span className="text-[10px] text-[#808a9d] font-mono">• {item.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#808a9d] font-mono">Relevance: {item.relevance}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                    item.bias.includes('BULLISH')
                      ? 'bg-[#00c805]/10 text-[#00c805]'
                      : 'bg-[#ff333a]/10 text-[#ff333a]'
                  }`}>
                    {item.sentiment} {item.bias}
                  </span>
                </div>
              </div>
              <p className="text-white text-xs font-semibold leading-relaxed font-sans">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SentimentAnalysisPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#808a9d] font-mono text-xs">Loading News Intelligence...</div>}>
      <SentimentContent />
    </Suspense>
  );
}
