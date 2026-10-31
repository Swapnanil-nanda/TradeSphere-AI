'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Terminal, LineChart, FileText, Newspaper, 
  Cpu, Sparkles, TrendingUp, ShieldAlert, Layers, Percent, 
  Target, GraduationCap, X, ArrowRight, CornerDownLeft
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  category: 'Navigation' | 'Instruments' | 'Actions';
  icon: any;
  path: string;
  shortcut?: string;
  badge?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Navigation
  { id: 'nav-terminal', name: 'Trading Terminal (3-Column)', category: 'Navigation', icon: Terminal, path: '/terminal', shortcut: 'T' },
  { id: 'nav-dashboard', name: 'Overview Dashboard', category: 'Navigation', icon: TrendingUp, path: '/app/dashboard', shortcut: 'D' },
  { id: 'nav-screener', name: 'Stock Screener', category: 'Navigation', icon: LineChart, path: '/app/screener', shortcut: 'S' },
  { id: 'nav-multi-agent', name: '7-Agent Quant Command Center', category: 'Navigation', icon: Cpu, path: '/app/quant/multi-agent', badge: 'AI' },
  { id: 'nav-predictions', name: 'AI Price Predictions & Forecasts', category: 'Navigation', icon: Sparkles, path: '/app/quant/predictions' },
  { id: 'nav-backtesting', name: 'Quantitative Strategy Backtester', category: 'Navigation', icon: TrendingUp, path: '/app/quant/backtesting' },
  { id: 'nav-optimizer', name: 'Markowitz Portfolio Optimizer (MPT)', category: 'Navigation', icon: TrendingUp, path: '/app/wealth/optimizer', badge: 'MPT' },
  { id: 'nav-frontier', name: 'Efficient Frontier Studio', category: 'Navigation', icon: TrendingUp, path: '/app/wealth/frontier' },
  { id: 'nav-scenarios', name: 'Monte Carlo Wealth Scenarios', category: 'Navigation', icon: Target, path: '/app/wealth/scenarios' },
  { id: 'nav-options', name: 'Options Chain & Matrix', category: 'Navigation', icon: Layers, path: '/app/risk/options', badge: 'GREEKS' },
  { id: 'nav-greeks', name: 'Options Greeks Calculator', category: 'Navigation', icon: Percent, path: '/app/risk/greeks' },
  { id: 'nav-dom', name: '20-Level Depth of Market (DOM)', category: 'Navigation', icon: Layers, path: '/app/risk/depth' },
  { id: 'nav-journal', name: 'Trade Journal & AI Tilt Auditor', category: 'Navigation', icon: FileText, path: '/app/risk/journal' },
  { id: 'nav-academy', name: 'Learning Academy & Guides', category: 'Navigation', icon: GraduationCap, path: '/app/learning/guide' },

  // Instruments
  { id: 'sym-reliance', name: 'RELIANCE · Reliance Industries Ltd (NSE)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=RELIANCE', badge: '₹2,985.40' },
  { id: 'sym-nifty', name: 'NIFTY 50 · Benchmark Index (NSE)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=NIFTY50', badge: '₹24,350.25' },
  { id: 'sym-tcs', name: 'TCS · Tata Consultancy Services (NSE)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=TCS', badge: '₹4,120.50' },
  { id: 'sym-infy', name: 'INFY · Infosys Limited (NSE)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=INFY', badge: '₹1,845.00' },
  { id: 'sym-hdfc', name: 'HDFCBANK · HDFC Bank Limited (NSE)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=HDFCBANK', badge: '₹1,680.75' },
  { id: 'sym-aapl', name: 'AAPL · Apple Inc. (NASDAQ)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=AAPL', badge: '$232.50' },
  { id: 'sym-nvda', name: 'NVDA · NVIDIA Corporation (NASDAQ)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=NVDA', badge: '$141.20' },
  { id: 'sym-tsla', name: 'TSLA · Tesla Inc. (NASDAQ)', category: 'Instruments', icon: LineChart, path: '/terminal?symbol=TSLA', badge: '$265.40' },

  // Quick Actions
  { id: 'act-size', name: 'Probe 1% Safe Risk Position Sizer', category: 'Actions', icon: ShieldAlert, path: '/terminal', badge: 'RULE A' },
  { id: 'act-reconcile', name: 'Reconcile Cash Ledger & Portfolio Balance', category: 'Actions', icon: TrendingUp, path: '/app/orders' },
  { id: 'act-pdf', name: 'Export Latest Research Run to Institutional PDF', category: 'Actions', icon: FileText, path: '/app/quant/multi-agent', badge: 'PDF' },
];

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalCommandPalette({ isOpen, onClose }: GlobalCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    onClose();
    router.push(item.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-[#090D12]/80 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#111922] border border-[#25313D] rounded-lg shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#25313D] bg-[#0D131A] gap-3">
          <Search className="w-4 h-4 text-[#8B99A8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, stock symbol, or tool name..."
            className="flex-1 bg-transparent text-[#E7EDF3] placeholder-[#8B99A8] text-sm focus:outline-hidden font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[#8B99A8] hover:text-[#E7EDF3]">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="bg-[#151F29] border border-[#25313D] px-1.5 py-0.5 rounded text-[10px] text-[#8B99A8] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-[#8B99A8] text-xs">
              No matching modules or symbols found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-[#151F29] text-[#E7EDF3]' : 'text-[#8B99A8] hover:bg-[#151F29] hover:text-[#E7EDF3]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#2979FF]' : 'text-[#8B99A8]'}`} />
                    <span className="font-medium text-[#E7EDF3] truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.badge && (
                      <span className="bg-[#1C2631] text-[#8B99A8] border border-[#25313D] px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-[#8B99A8] uppercase font-mono tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-[#35C69A]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="h-8 bg-[#0D131A] border-t border-[#25313D] px-4 flex items-center justify-between text-[11px] text-[#8B99A8] font-mono select-none">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#35C69A]">TradeSphere Institutional Workstation</span>
        </div>
      </div>
    </div>
  );
}
