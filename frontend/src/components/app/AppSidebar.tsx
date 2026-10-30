'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Terminal, Compass, Eye, Filter, ShoppingBag,
  BookOpen, LineChart, FileText, Newspaper, History,
  Cpu, Sparkles, FlaskConical, PlayCircle, BookmarkCheck,
  TrendingUp, Activity, PieChart, Calculator, Target,
  ShieldAlert, Layers, Percent, AlignVerticalSpaceAround, BookMarked,
  GraduationCap, BookCheck, Lightbulb,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();

  const navigationSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Trading',
      items: [
        { name: 'Trading Terminal', path: '/terminal', icon: Terminal },
        { name: 'Markets', path: '/app/markets', icon: Compass },
        { name: 'Watchlists', path: '/app/watchlists', icon: Eye },
        { name: 'Stock Screener', path: '/app/screener', icon: Filter },
        { name: 'Orders and Trades', path: '/app/orders', icon: ShoppingBag }
      ]
    },
    {
      title: 'Research',
      items: [
        { name: 'Stock Research', path: '/app/research', icon: BookOpen },
        { name: 'Technical Analysis', path: '/app/research/technical', icon: LineChart },
        { name: 'Fundamental Analysis', path: '/app/research/fundamental', icon: FileText },
        { name: 'News and Sentiment', path: '/app/research/sentiment', icon: Newspaper },
        { name: 'Historical Analogues', path: '/app/research/analogues', icon: History }
      ]
    },
    {
      title: 'Quant Intelligence',
      items: [
        { name: 'Multi-Agent Research', path: '/app/quant/multi-agent', icon: Cpu },
        { name: 'AI Predictions', path: '/app/quant/predictions', icon: Sparkles },
        { name: 'Quant Strategy Lab', path: '/app/quant/strategy-lab', icon: FlaskConical },
        { name: 'Backtesting', path: '/app/quant/backtesting', icon: PlayCircle },
        { name: 'Saved Research', path: '/app/quant/saved', icon: BookmarkCheck }
      ]
    },
    {
      title: 'Wealth Management',
      items: [
        { name: 'Portfolio Optimizer', path: '/app/wealth/optimizer', icon: TrendingUp },
        { name: 'Efficient Frontier', path: '/app/wealth/frontier', icon: Activity },
        { name: 'Mutual Funds', path: '/app/wealth/mutual-funds', icon: PieChart },
        { name: 'SIP Planner', path: '/app/wealth/sip-planner', icon: Calculator },
        { name: 'Wealth Scenarios', path: '/app/wealth/scenarios', icon: Target }
      ]
    },
    {
      title: 'Risk & Analytics',
      items: [
        { name: 'Risk Centre', path: '/app/risk', icon: ShieldAlert },
        { name: 'Options Analytics', path: '/app/risk/options', icon: Layers },
        { name: 'Greeks Calculator', path: '/app/risk/greeks', icon: Percent },
        { name: 'Simulated Market Depth', path: '/app/risk/depth', icon: AlignVerticalSpaceAround },
        { name: 'Trade Journal', path: '/app/risk/journal', icon: BookMarked }
      ]
    },
    {
      title: 'Learning',
      items: [
        { name: 'Beginner Academy', path: '/app/learning', icon: GraduationCap },
        { name: 'Investing Guide', path: '/app/learning/guide', icon: BookCheck },
        { name: 'Strategy Education', path: '/app/learning/strategies', icon: Lightbulb }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/app/dashboard' && (pathname === '/app' || pathname === '/app/dashboard')) return true;
    if (path === '/terminal' && pathname === '/terminal') return true;
    if (path !== '/app/dashboard' && path !== '/terminal') {
      return pathname === path || (pathname.startsWith(path) && path !== '/app/research' && path !== '/app/risk' && path !== '/app/learning');
    }
    return false;
  };

  return (
    <aside
      className={`bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-[#1b253b] flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-13 px-3.5 flex items-center justify-between border-b border-slate-200 dark:border-[#1b253b] shrink-0">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-sm">
                Ω
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                  TradeSphere<span className="text-blue-600">AI</span>
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-sm">
                Ω
              </div>
            </Link>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4 custom-scrollbar text-xs">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!collapsed ? (
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
              ) : (
                <div className="border-t border-slate-200 dark:border-slate-800/80 my-1.5" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/15 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                    title={collapsed ? `${section.title}: ${item.name}` : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Simulator Status Indicator */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1b253b] bg-slate-50 dark:bg-[#070b14] shrink-0">
        {!collapsed ? (
          <div className="space-y-0.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>24/7 GBM ENGINE</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Zero-Key Fallback Active</div>
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mx-auto" title="24/7 GBM Simulator Active" />
        )}
      </div>
    </aside>
  );
}
