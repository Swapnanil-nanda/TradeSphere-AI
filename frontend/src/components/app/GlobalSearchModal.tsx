'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, TrendingDown, ArrowRight, LayoutDashboard, BarChart2, ShieldCheck, Compass, BookOpen, Settings } from 'lucide-react';
import { apiClient, Ticker } from '../../lib/api-client';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      apiClient.getTickers().then(setTickers);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const appPages = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Markets Overview', path: '/app/markets', icon: Compass },
    { name: 'Watchlists', path: '/app/watchlists', icon: BarChart2 },
    { name: 'Stock Screener', path: '/app/screener', icon: Search },
    { name: 'Technical Charts', path: '/app/charts', icon: BarChart2 },
    { name: 'Company Research', path: '/app/research', icon: BookOpen },
    { name: 'Paper Trading Console', path: '/app/paper-trading', icon: ArrowRight },
    { name: 'Portfolio & Journals', path: '/app/portfolio', icon: LayoutDashboard },
    { name: 'Risk Management', path: '/app/risk', icon: ShieldCheck },
    { name: 'Learning Academy', path: '/app/learning', icon: BookOpen },
    { name: 'Settings & Security', path: '/app/settings', icon: Settings }
  ];

  const filteredPages = appPages.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const filteredTickers = tickers.filter(t => 
    t.symbol.toLowerCase().includes(query.toLowerCase()) || 
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 select-none">
      <div className="bg-[#0c121f] border border-[#1b253b] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#1b253b] flex items-center gap-3 bg-[#090d16]">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search instruments (NIFTY, RELIANCE, AAPL) or jump to pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs divide-y divide-[#1b253b]/40">
          {/* Instruments */}
          {filteredTickers.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Simulated Instruments ({filteredTickers.length})
              </span>
              <div className="space-y-1">
                {filteredTickers.slice(0, 5).map((t) => (
                  <button
                    key={t.symbol}
                    onClick={() => {
                      router.push(`/app/charts?symbol=${t.symbol}`);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-xs">{t.symbol}</span>
                      <span className="text-[10px] text-slate-400">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white text-xs">
                        {t.currency === 'USD' ? '$' : '₹'}{t.ltp.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-bold ${t.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.changePct >= 0 ? '+' : ''}{t.changePct.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Application Navigation Pages */}
          {filteredPages.length > 0 && (
            <div className="pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Application Pages
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {filteredPages.map((page) => {
                  const PageIcon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => {
                        router.push(page.path);
                        onClose();
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/50 transition-colors text-left text-slate-300 hover:text-white"
                    >
                      <PageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="font-semibold text-xs">{page.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredTickers.length === 0 && filteredPages.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No symbols or pages matching &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2.5 px-4 bg-[#090d16] border-t border-[#1b253b] text-[10px] text-slate-500 flex justify-between items-center">
          <span>Navigate with mouse or keyboard</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
