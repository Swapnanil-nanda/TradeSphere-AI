'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Terminal, Compass, Eye, ShoppingBag, Briefcase,
  Filter, LineChart, FileText, Newspaper, History,
  Cpu, Sparkles, BookmarkCheck, FileSpreadsheet,
  FlaskConical, PlayCircle, Sliders, FlaskRound,
  PieChart, TrendingUp, Activity, Calculator, Target,
  ShieldAlert, Layers, Percent, BarChart3, AlignVerticalSpaceAround, BookMarked,
  GraduationCap, BookOpen, HelpCircle, CheckSquare,
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
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();

  const navigationSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'TRADING',
      items: [
        { name: 'Terminal', path: '/terminal', icon: Terminal, badge: 'PRO' },
        { name: 'Markets', path: '/app/markets', icon: Compass },
        { name: 'Watchlists', path: '/app/watchlists', icon: Eye },
        { name: 'Orders', path: '/app/orders', icon: ShoppingBag },
        { name: 'Positions', path: '/app/portfolio', icon: Briefcase }
      ]
    },
    {
      title: 'RESEARCH',
      items: [
        { name: 'Stock Screener', path: '/app/screener', icon: Filter },
        { name: 'Technical Analysis', path: '/app/research/technical', icon: LineChart },
        { name: 'Fundamental Analysis', path: '/app/research/fundamental', icon: FileText },
        { name: 'News & Sentiment', path: '/app/research/sentiment', icon: Newspaper },
        { name: 'Historical Analogues', path: '/app/research/analogues', icon: History }
      ]
    },
    {
      title: 'QUANT INTELLIGENCE',
      items: [
        { name: 'Agent Command Center', path: '/app/quant/multi-agent', icon: Cpu, badge: '7 AGENTS' },
        { name: 'AI Predictions', path: '/app/quant/predictions', icon: Sparkles },
        { name: 'Saved Research', path: '/app/quant/saved', icon: BookmarkCheck },
        { name: 'Reports', path: '/app/quant/reports', icon: FileSpreadsheet, badge: 'PDF' }
      ]
    },
    {
      title: 'STRATEGY LAB',
      items: [
        { name: 'Strategy Builder', path: '/app/strategy-lab/builder', icon: FlaskConical },
        { name: 'Backtesting', path: '/app/quant/backtesting', icon: PlayCircle },
        { name: 'Parameter Optimisation', path: '/app/strategy-lab/optimization', icon: Sliders },
        { name: 'Paper Experiments', path: '/app/strategy-lab/experiments', icon: FlaskRound }
      ]
    },
    {
      title: 'WEALTH',
      items: [
        { name: 'Portfolio Allocation', path: '/app/wealth/portfolio', icon: PieChart },
        { name: 'Portfolio Optimizer', path: '/app/wealth/optimizer', icon: TrendingUp, badge: 'MPT' },
        { name: 'Efficient Frontier', path: '/app/wealth/frontier', icon: Activity },
        { name: 'Mutual Funds', path: '/app/wealth/mutual-funds', icon: Briefcase },
        { name: 'SIP Planner', path: '/app/wealth/sip-planner', icon: Calculator },
        { name: 'Monte Carlo', path: '/app/wealth/scenarios', icon: Target }
      ]
    },
    {
      title: 'RISK & OPTIONS',
      items: [
        { name: 'Risk Centre', path: '/app/risk', icon: ShieldAlert },
        { name: 'Options Chain', path: '/app/risk/options', icon: Layers },
        { name: 'Greeks', path: '/app/risk/greeks', icon: Percent },
        { name: 'Payoff Analysis', path: '/app/risk/payoff', icon: BarChart3 },
        { name: 'Simulated DOM', path: '/app/risk/depth', icon: AlignVerticalSpaceAround, badge: 'L2' },
        { name: 'Trade Journal', path: '/app/risk/journal', icon: BookMarked }
      ]
    },
    {
      title: 'LEARNING',
      items: [
        { name: 'Academy', path: '/app/learning', icon: GraduationCap },
        { name: 'Courses', path: '/app/learning/guide', icon: BookOpen },
        { name: 'Quizzes', path: '/app/learning/quizzes', icon: HelpCircle },
        { name: 'Practical Exercises', path: '/app/learning/strategies', icon: CheckSquare }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/app/dashboard' && (pathname === '/app' || pathname === '/app/dashboard')) return true;
    if (path === '/terminal' && pathname === '/terminal') return true;
    if (path !== '/app/dashboard' && path !== '/terminal') {
      return pathname === path || (pathname.startsWith(path) && path !== '/app/research' && path !== '/app/risk' && path !== '/app/learning' && path !== '/app/quant');
    }
    return false;
  };

  return (
    <aside
      className={`bg-[#0D131A] border-r border-[#25313D] flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-12 px-3 flex items-center justify-between border-b border-[#25313D] shrink-0 bg-[#0D131A]">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded bg-[#2979FF] flex items-center justify-center font-black text-white text-xs shadow-xs">
                Ω
              </div>
              <div className="flex items-center gap-1 font-sans">
                <span className="font-bold text-xs tracking-tight text-[#E7EDF3]">
                  TradeSphere<span className="text-[#2979FF]">AI</span>
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#151F29] text-[#35C69A] border border-[#25313D]">
                  PRO
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="w-6 h-6 rounded bg-[#2979FF] flex items-center justify-center font-black text-white text-xs shadow-xs">
                Ω
              </div>
            </Link>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#8B99A8] hover:text-[#E7EDF3] hover:bg-[#151F29] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Scrollable Navigation Tree */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-4">
          {navigationSections.map((section) => (
            <div key={section.title} className="px-2">
              {!collapsed && (
                <div className="px-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#8B99A8] uppercase">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-xs transition-colors group relative ${
                        active
                          ? 'bg-[#151F29] text-[#E7EDF3] font-medium border-l-2 border-[#2979FF]'
                          : 'text-[#8B99A8] hover:bg-[#111922] hover:text-[#E7EDF3]'
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          active ? 'text-[#2979FF]' : 'text-[#8B99A8] group-hover:text-[#E7EDF3]'
                        }`}
                      />
                      {!collapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1C2631] text-[#8B99A8] border border-[#25313D] shrink-0 ml-1">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom User Profile Ribbon */}
        <div className="p-2 border-t border-[#25313D] bg-[#0D131A] shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[#111922] border border-[#25313D] text-[11px]">
              <div className="truncate">
                <div className="font-semibold text-[#E7EDF3] truncate">Virtual Account</div>
                <div className="text-[10px] font-mono text-[#35C69A] font-semibold">₹10,00,000.00</div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#151F29] text-[#8B99A8] border border-[#25313D]">
                SIM
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-1 text-[#35C69A] text-[10px] font-mono font-bold" title="Virtual Capital: ₹10,00,000">
              ₹10L
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
