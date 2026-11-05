'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookCheck, ShieldCheck, CheckCircle2, ArrowRight,
  HelpCircle, Search, ExternalLink, ChevronDown, ChevronUp,
  Sliders, Layers, Activity, AlertTriangle, Video, Sparkles
} from 'lucide-react';
import {
  PLATFORM_FEATURE_GUIDES,
  PLATFORM_FAQS,
  PlatformFeatureGuide,
  PlatformFAQ
} from '../../../../lib/academy-data';

function GuideContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  const [activeTab, setActiveTab] = useState<'FEATURES' | 'FAQS'>('FEATURES');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Filter feature guides
  const filteredGuides = useMemo(() => {
    return PLATFORM_FEATURE_GUIDES.filter(g => {
      const matchCat = selectedCategory === 'ALL' || g.category === selectedCategory;
      const matchQuery = !searchQuery ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.whatItDoes.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return PLATFORM_FAQS.filter(f => {
      const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory || (selectedCategory === 'EXECUTION' && f.category === 'PAPER_TRADING');
      const matchQuery = !searchQuery ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-[#E7EDF3]">
      {/* Top Header */}
      <div className="bg-[#0D131A] p-5 rounded-xl border border-[#25313D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30 flex items-center justify-center font-bold">
            <BookCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Platform Knowledge Base &amp; Feature FAQs
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#35C69A]/15 text-[#35C69A] border border-[#35C69A]/30 font-mono">
                EVERY FEATURE DOCUMENTED
              </span>
            </div>
            <p className="text-xs text-[#8B99A8] mt-1">
              Detailed step-by-step guides, mathematical formulas, troubleshooting rules, and educational video links for every tool on TradeSphere AI.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#111922] p-1 rounded-xl border border-[#25313D] self-start md:self-auto font-mono text-xs">
          <button
            onClick={() => setActiveTab('FEATURES')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'FEATURES'
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'text-[#8B99A8] hover:text-white'
            }`}
          >
            Feature Guides ({PLATFORM_FEATURE_GUIDES.length})
          </button>
          <button
            onClick={() => setActiveTab('FAQS')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
              activeTab === 'FAQS'
                ? 'bg-[#2979FF] text-white shadow-xs'
                : 'text-[#8B99A8] hover:text-white'
            }`}
          >
            Platform FAQs ({PLATFORM_FAQS.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111922] p-3 rounded-xl border border-[#25313D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 font-mono text-[11px]">
          {['ALL', 'EXECUTION', 'RISK', 'OPTIONS', 'QUANT', 'WEALTH'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2979FF] text-white border-[#2979FF] font-bold'
                  : 'bg-[#0D131A] text-[#8B99A8] border-[#25313D] hover:text-white'
              }`}
            >
              {cat === 'EXECUTION' ? 'TRADING' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#8B99A8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, formulas, FAQs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D131A] border border-[#25313D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8B99A8] focus:outline-none focus:border-[#2979FF]"
          />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {activeTab === 'FEATURES' ? (
        <div className="space-y-4">
          {filteredGuides.length === 0 ? (
            <div className="bg-[#111922] p-8 text-center rounded-xl border border-[#25313D] text-xs text-[#8B99A8] font-mono">
              No platform feature guides match the query "{searchQuery}".
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-[#111922] border border-[#25313D] rounded-xl p-5 shadow-sm space-y-4 hover:border-[#25313D]/80 transition-all"
              >
                {/* Guide Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#25313D]">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/25 font-mono">
                      {guide.badge}
                    </span>
                    <h2 className="text-base font-bold text-white">{guide.name}</h2>
                    <span className="text-[11px] text-[#8B99A8] font-mono">({guide.route})</span>
                  </div>

                  <Link
                    href={guide.route}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2979FF] hover:bg-[#1E65DF] text-white font-bold text-xs transition-colors self-start sm:self-auto"
                  >
                    <span>Launch Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <p className="text-xs text-[#E7EDF3] leading-relaxed">
                  {guide.whatItDoes}
                </p>

                {/* Step-by-Step How-To */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                    Step-by-Step How to Use:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#8B99A8]">
                    {guide.howToUse.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                        <span className="w-4 h-4 rounded-full bg-[#2979FF]/20 text-[#2979FF] flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="text-[#E7EDF3] leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics and Formulas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono block">
                    Key Metrics &amp; Mathematical Formulas:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    {guide.keyMetrics.map((km, kmIdx) => (
                      <div key={kmIdx} className="p-2.5 rounded-lg bg-[#0D131A] border border-[#25313D]">
                        <span className="text-[#35C69A] font-bold block text-[11px] font-sans">{km.name}</span>
                        <span className="text-[#8B99A8] text-[10px] mt-0.5 block leading-normal">{km.formulaOrMeaning}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Troubleshooting & Video Guide Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#25313D]/60 text-xs">
                  {/* Troubleshooting Alert */}
                  <div className="p-3 bg-[#0D131A] border border-[#25313D] rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#D8AB5E] shrink-0 mt-0.5" />
                    <div className="text-[11px] text-[#8B99A8] leading-relaxed">
                      <strong className="text-white">Troubleshooting Tip: </strong>
                      {guide.troubleshootingTip}
                    </div>
                  </div>

                  {/* Free Video Reference */}
                  <div className="p-3 bg-[#0D131A] border border-[#25313D] rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#2979FF] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#8B99A8] block font-mono">RECOMMENDED FREE VIDEO LESSON</span>
                        <span className="text-[11px] font-bold text-white line-clamp-1">{guide.videoGuideTitle}</span>
                      </div>
                    </div>
                    <a
                      href={guide.videoGuideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[#111922] hover:bg-[#151F29] border border-[#25313D] text-[#2979FF] text-[10px] font-bold flex items-center gap-1 shrink-0"
                    >
                      <span>Watch</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* PLATFORM FAQS ACCORDION */
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-[#111922] p-8 text-center rounded-xl border border-[#25313D] text-xs text-[#8B99A8] font-mono">
              No FAQs match the query "{searchQuery}".
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = expandedFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-[#111922] border border-[#25313D] rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#151F29]/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0D131A] text-[#35C69A] border border-[#25313D] font-mono shrink-0">
                        {faq.category}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">{faq.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#8B99A8] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8B99A8] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 pb-4 bg-[#0D131A] border-t border-[#25313D] space-y-3">
                      <p className="text-xs text-[#8B99A8] leading-relaxed font-sans">
                        {faq.answer}
                      </p>

                      {faq.relatedFeatureRoute && (
                        <div className="pt-2 flex justify-end">
                          <Link
                            href={faq.relatedFeatureRoute}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2979FF] hover:text-[#5CA0FF] transition-colors"
                          >
                            <span>Open {faq.relatedFeatureName || 'Related Feature'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function PlatformGuidePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#8B99A8] font-mono text-xs">Loading Platform Guide &amp; Knowledge Base...</div>}>
      <GuideContent />
    </Suspense>
  );
}
