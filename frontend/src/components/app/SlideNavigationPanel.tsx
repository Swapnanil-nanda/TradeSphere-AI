'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Search,
  PanelLeft,
  LayoutDashboard,
  Terminal,
  Compass,
  Eye,
  ShoppingBag,
  Briefcase,
  Filter,
  LineChart,
  FileText,
  Newspaper,
  History,
  Cpu,
  Sparkles,
  BookmarkCheck,
  FileSpreadsheet,
  FlaskConical,
  PlayCircle,
  Sliders,
  FlaskRound,
  PieChart,
  TrendingUp,
  Activity,
  Calculator,
  Target,
  ShieldAlert,
  Layers,
  Percent,
  BarChart3,
  AlignVerticalSpaceAround,
  BookMarked,
  GraduationCap,
  BookOpen,
  HelpCircle,
  CheckSquare,
  Settings,
  Globe,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface SlideNavigationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const ALL_WORKSPACE_SECTIONS: NavSection[] = [
  {
    title: 'TRADING & EXECUTION',
    items: [
      { name: 'Institutional Terminal', path: '/app/paper-trading', icon: Terminal, badge: 'PRO', description: 'Simulated execution with 1% risk gatekeeper' },
      { name: 'Live Market Watch', path: '/app/markets', icon: Compass, badge: 'NSE/US', description: 'Real-time multi-market quote streamer' },
      { name: 'Watchlists Management', path: '/app/watchlists', icon: Eye, badge: 'CUSTOM', description: 'Institutional baskets & price triggers' },
      { name: 'Interactive Charts', path: '/app/charts', icon: LineChart, badge: 'TV', description: 'Candlestick charting with 8 technical indicators' },
      { name: 'Active Orders Blotter', path: '/app/orders', icon: ShoppingBag, badge: 'OCO', description: 'Bracket & limit order management' },
      { name: 'Positions & Portfolio', path: '/app/portfolio', icon: Briefcase, badge: 'MTM', description: 'Live mark-to-market ledger & exposures' }
    ]
  },
  {
    title: 'MARKET RESEARCH & INTELLIGENCE',
    items: [
      { name: 'Stock Screener', path: '/app/screener', icon: Filter, badge: 'FILTERS', description: 'Filter 500+ NSE and NASDAQ instruments' },
      { name: 'Technical Analysis', path: '/app/research/technical', icon: LineChart, badge: 'TA', description: 'RSI, MACD, Supertrend, Bollinger & VWAP' },
      { name: 'Fundamental Analysis', path: '/app/research/fundamental', icon: FileText, badge: 'FA', description: 'Balance sheet, valuation & income metrics' },
      { name: 'News & Sentiment', path: '/app/research/sentiment', icon: Newspaper, badge: 'NLP', description: 'Live news sentiment scoring & headlines' },
      { name: 'Historical Analogues', path: '/app/research/analogues', icon: History, badge: 'ANALOGUES', description: 'Historical pattern similarity matching' }
    ]
  },
  {
    title: 'QUANTITATIVE INTELLIGENCE',
    items: [
      { name: 'Autonomous Agent Center', path: '/app/quant/multi-agent', icon: Cpu, badge: '7 AGENTS', description: 'Multi-agent quantitative research federation' },
      { name: 'AI Price Forecasting', path: '/app/quant/predictions', icon: Sparkles, badge: 'PROB', description: 'Stochastic price trend projections' },
      { name: 'Strategy Lab Hub', path: '/app/quant/strategy-lab', icon: FlaskConical, badge: 'ALPHA', description: 'Vectorized quant strategies & performance' },
      { name: 'Vectorized Backtester', path: '/app/quant/backtesting', icon: PlayCircle, badge: 'WF', description: 'Walk-forward historical strategy backtesting' },
      { name: 'Saved Research Store', path: '/app/quant/saved', icon: BookmarkCheck, badge: 'AUDIT', description: 'Persisted multi-agent research briefs' },
      { name: 'Quant Research Reports', path: '/app/quant/reports', icon: FileSpreadsheet, badge: 'PDF', description: 'Institutional PDF report generator' }
    ]
  },
  {
    title: 'STRATEGY LAB & OPTIMIZATION',
    items: [
      { name: 'Strategy Logic Builder', path: '/app/strategy-lab/builder', icon: FlaskConical, badge: 'BUILDER', description: 'Visual strategy parameters & rules' },
      { name: 'Parameter Optimization', path: '/app/strategy-lab/optimization', icon: Sliders, badge: 'GRID', description: 'Grid & genetic parameter optimization' },
      { name: 'Paper Experiments', path: '/app/strategy-lab/experiments', icon: FlaskRound, badge: 'LAB', description: 'Live forward paper strategy incubation' }
    ]
  },
  {
    title: 'WEALTH & ASSET MANAGEMENT',
    items: [
      { name: 'Portfolio Allocation', path: '/app/wealth/portfolio', icon: PieChart, badge: 'WEIGHTS', description: 'Multi-asset target weight rebalancing' },
      { name: 'Markowitz MPT Optimizer', path: '/app/wealth/optimizer', icon: TrendingUp, badge: 'MPT', description: 'Max Sharpe & Minimum Variance optimization' },
      { name: 'Efficient Frontier', path: '/app/wealth/frontier', icon: Activity, badge: 'CURVE', description: 'Mean-variance capital allocation line' },
      { name: 'Mutual Funds & NAV', path: '/app/wealth/mutual-funds', icon: Briefcase, badge: 'NAV', description: 'Indian mutual fund search & history' },
      { name: 'Step-Up SIP Planner', path: '/app/wealth/sip-planner', icon: Calculator, badge: 'SIP', description: 'Inflation-adjusted wealth accumulation' },
      { name: 'Monte Carlo Scenarios', path: '/app/wealth/scenarios', icon: Target, badge: 'PATHS', description: '10,000-path retirement & goal simulations' }
    ]
  },
  {
    title: 'RISK & OPTIONS GREEKS',
    items: [
      { name: 'Risk Control Centre', path: '/app/risk', icon: ShieldAlert, badge: '1% CAP', description: 'Pre-trade gatekeeper & daily circuit breaker' },
      { name: '20-Level Depth of Market', path: '/app/risk/depth', icon: AlignVerticalSpaceAround, badge: 'L2 DOM', description: 'Simulated institutional microstructure ladder' },
      { name: 'Options Chain Matrix', path: '/app/risk/options', icon: Layers, badge: 'CHAIN', description: 'Call/Put strike ladder & open interest' },
      { name: 'Black-Scholes Greeks', path: '/app/risk/greeks', icon: Percent, badge: 'Δ Γ Θ ν', description: 'Delta, Gamma, Theta, Vega & IV solver' },
      { name: 'Visual Payoff Analysis', path: '/app/risk/payoff', icon: BarChart3, badge: 'PAYOFF', description: 'Multi-leg options payoff curve modeler' },
      { name: 'Automated Trade Journal', path: '/app/risk/journal', icon: BookMarked, badge: 'JOURNAL', description: 'R-multiple tagging & ledger audit' }
    ]
  },
  {
    title: 'LEARNING & TRADER ACADEMY',
    items: [
      { name: 'Trader Academy Overview', path: '/app/learning', icon: GraduationCap, badge: 'FREE', description: 'Zero-to-One financial curriculum' },
      { name: 'Guided Curriculum', path: '/app/learning/guide', icon: BookOpen, badge: 'MODULES', description: 'Market structure, risk & quant guides' },
      { name: 'Interactive Quizzes', path: '/app/learning/quizzes', icon: HelpCircle, badge: 'TESTS', description: 'Knowledge tests with instant feedback' },
      { name: 'Practical Trading Exercises', path: '/app/learning/strategies', icon: CheckSquare, badge: 'DRILLS', description: 'Hands-on practice calculators & setups' }
    ]
  },
  {
    title: 'SYSTEM & TOOLS',
    items: [
      { name: 'Workstation Dashboard', path: '/app/dashboard', icon: LayoutDashboard, badge: 'MAIN', description: 'High-level trading workstation portal' },
      { name: 'Settings & Reset', path: '/app/settings', icon: Settings, badge: 'CONFIG', description: 'Capital reset & risk parameters' },
      { name: 'Public Landing Portal', path: '/', icon: Globe, badge: 'PUBLIC', description: 'Main public overview page' }
    ]
  }
];

export default function SlideNavigationPanel({ isOpen, onClose }: SlideNavigationPanelProps) {
  const pathname = usePathname();
  const [filterQuery, setFilterQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Focus search input when drawer slides open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    } else {
      setFilterQuery('');
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter sections and items based on search query
  const filteredSections = useMemo(() => {
    const query = filterQuery.toLowerCase().trim();
    if (!query) return ALL_WORKSPACE_SECTIONS;

    return ALL_WORKSPACE_SECTIONS.map((section) => {
      const matchingItems = section.items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query) ||
          (item.badge && item.badge.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
      return {
        ...section,
        items: matchingItems
      };
    }).filter((section) => section.items.length > 0);
  }, [filterQuery]);

  const isActive = (path: string) => {
    if (path === '/app/dashboard' && (pathname === '/app' || pathname === '/app/dashboard')) return true;
    if (path === '/app/paper-trading' && (pathname === '/terminal' || pathname === '/app/paper-trading')) return true;
    if (path !== '/app/dashboard' && path !== '/app/paper-trading' && path !== '/') {
      return pathname === path || pathname.startsWith(path);
    }
    return pathname === path;
  };

  const totalToolCount = ALL_WORKSPACE_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <>
      {/* 1. Backdrop overlay with smooth fade */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* 2. Slide-In Left Panel Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-96 max-w-[90vw] bg-[#050505] border-r border-[#141414] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Workspace Navigator"
      >
        {/* Top Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#141414] bg-[#080808] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#2979FF] flex items-center justify-center font-black text-white text-xs shadow-md shadow-blue-500/20">
              Ω
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white font-sans tracking-tight">
                  TradeSphere<span className="text-[#2979FF]">OS</span>
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30">
                  OPEN ACCESS
                </span>
              </div>
              <div className="text-[10px] text-[#808a9d] font-mono">
                {totalToolCount} Workspace Sites & Tools
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#808a9d] hover:text-white hover:bg-[#121212] transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Filter Bar */}
        <div className="p-3 border-b border-[#141414] bg-[#050505] shrink-0">
          <div className="flex items-center gap-2 bg-[#080808] border border-[#1a1a1a] focus-within:border-[#2979FF] rounded-lg px-3 py-2 transition-colors">
            <Search className="w-4 h-4 text-[#808a9d] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={`Search all ${totalToolCount} workspace tools (e.g. greeks, screener, sip)...`}
              className="w-full bg-transparent text-xs text-white placeholder-[#808a9d] focus:outline-none font-sans"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="text-[#808a9d] hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Access Action Bar */}
        <div className="px-3 py-2 bg-[#080808] border-b border-[#141414] flex items-center justify-between text-[11px] font-mono shrink-0">
          <span className="text-[#808a9d]">KEY HUBS:</span>
          <div className="flex items-center gap-1.5">
            <Link
              href="/app/paper-trading"
              onClick={onClose}
              className="px-2 py-0.5 rounded bg-[#2979FF]/10 text-[#2979FF] border border-[#2979FF]/30 font-bold hover:bg-[#2979FF]/20 transition-colors"
            >
              Terminal
            </Link>
            <Link
              href="/app/watchlists"
              onClick={onClose}
              className="px-2 py-0.5 rounded bg-[#00c805]/10 text-[#00c805] border border-[#00c805]/30 font-bold hover:bg-[#00c805]/20 transition-colors"
            >
              Watchlists
            </Link>
            <Link
              href="/app/quant/multi-agent"
              onClick={onClose}
              className="px-2 py-0.5 rounded bg-[#D8AB5E]/10 text-[#D8AB5E] border border-[#D8AB5E]/30 font-bold hover:bg-[#D8AB5E]/20 transition-colors"
            >
              7-Agents
            </Link>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {filteredSections.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#808a9d] font-mono">
              No matching sites or tools found for &quot;{filterQuery}&quot;.
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#808a9d] uppercase flex items-center justify-between">
                  <span>{section.title}</span>
                  <span className="text-[9px] text-[#808a9d]/60 font-mono">
                    {section.items.length}
                  </span>
                </div>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={onClose}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-all group ${
                          active
                            ? 'bg-[#121212] text-white border-l-2 border-[#2979FF] shadow-xs'
                            : 'text-[#808a9d] hover:bg-[#0c0c0c] hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${
                            active ? 'text-[#2979FF]' : 'text-[#808a9d] group-hover:text-white'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-white truncate text-xs font-sans">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#101010] text-[#808a9d] border border-[#1f1f1f] shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-[#808a9d] truncate font-sans mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Status Ribbon: No Gatekeeping / Public Access */}
        <div className="p-3 border-t border-[#141414] bg-[#080808] shrink-0 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-[#00c805] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00c805] animate-pulse" />
              Public Institutional Mode
            </span>
            <span className="text-[#808a9d]">₹10,00,000 Equity</span>
          </div>
          <p className="text-[10px] text-[#808a9d] mt-1 font-sans">
            Zero gatekeeping • 100% Free • Open to everyone worldwide anytime.
          </p>
        </div>
      </aside>
    </>
  );
}
